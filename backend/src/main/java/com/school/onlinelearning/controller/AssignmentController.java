package com.school.onlinelearning.controller;

import com.school.onlinelearning.model.Assignment;
import com.school.onlinelearning.model.Submission;
import com.school.onlinelearning.security.AuthenticatedUser;
import com.school.onlinelearning.service.AssignmentService;
import com.school.onlinelearning.service.FileStorageService;
import com.school.onlinelearning.repository.StudentRepository;
import com.school.onlinelearning.model.Student;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final FileStorageService fileStorageService;
    private final StudentRepository studentRepository;

    public AssignmentController(AssignmentService assignmentService, FileStorageService fileStorageService, StudentRepository studentRepository) {
        this.assignmentService = assignmentService;
        this.fileStorageService = fileStorageService;
        this.studentRepository = studentRepository;
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Assignment>> getAssignmentsByCourse(@PathVariable String courseId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByCourse(courseId));
    }

    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping
    public ResponseEntity<Assignment> createAssignment(@Valid @RequestBody Assignment assignment) {
        return ResponseEntity.ok(assignmentService.createAssignment(assignment));
    }

    @PreAuthorize("hasRole('TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<Assignment> updateAssignment(
            @PathVariable String id,
            @Valid @RequestBody com.school.onlinelearning.dto.request.AssignmentRequestDTO dto) {
        return ResponseEntity.ok(assignmentService.updateAssignment(id, dto));
    }

    @PreAuthorize("hasRole('TEACHER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable String id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/{id}/submit")
    public ResponseEntity<Submission> submitAssignment(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {

        Student student = studentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        return ResponseEntity.ok(assignmentService.submitAssignment(id, student.getId(), file));
    }

    @GetMapping("/{id}/my-submission")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Submission> getMySubmission(
            @PathVariable String id,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {

        Student student = studentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        Submission submission = assignmentService.getSubmissionForStudent(id, student.getId());
        if (submission == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(submission);
    }

    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping("/{id}/submissions")
    public ResponseEntity<List<Submission>> getSubmissions(@PathVariable String id) {
        return ResponseEntity.ok(assignmentService.getSubmissionsForAssignment(id));
    }

    @PreAuthorize("hasRole('TEACHER')")
    @PatchMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<Submission> gradeSubmission(
            @PathVariable String submissionId,
            @RequestParam("score") double score,
            @RequestParam(value = "feedback", required = false) String feedback) {
        return ResponseEntity.ok(assignmentService.gradeSubmission(submissionId, score, feedback));
    }

    @GetMapping("/submissions/{submissionId}/download")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    public ResponseEntity<Resource> downloadSubmissionFile(
            @PathVariable String submissionId,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        Submission submission = assignmentService.getSubmissionById(submissionId);
        
        if (submission == null || submission.getPdfFilePath() == null) {
            return ResponseEntity.notFound().build();
        }

        // Authorization check: Only teachers or the student who owns the submission can download
        boolean isTeacher = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER"));
        
        if (!isTeacher) {
            Student student = studentRepository.findByUserId(currentUser.getId()).orElse(null);
            if (student == null || !submission.getStudentId().equals(student.getId())) {
                return ResponseEntity.status(403).build();
            }
        }

        try {
            Path filePath = fileStorageService.loadFileAsResource(submission.getPdfFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + submission.getOriginalFileName() + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("Could not read file: " + submission.getPdfFilePath());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error while downloading file", e);
        }
    }
}
