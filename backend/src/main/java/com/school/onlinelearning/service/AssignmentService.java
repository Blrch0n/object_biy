package com.school.onlinelearning.service;

import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Assignment;
import com.school.onlinelearning.model.Submission;
import com.school.onlinelearning.model.Student;
import com.school.onlinelearning.repository.AssignmentRepository;
import com.school.onlinelearning.repository.SubmissionRepository;
import com.school.onlinelearning.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final FileStorageService fileStorageService;
    private final StudentRepository studentRepository;

    public AssignmentService(AssignmentRepository assignmentRepository, SubmissionRepository submissionRepository, FileStorageService fileStorageService, StudentRepository studentRepository) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.fileStorageService = fileStorageService;
        this.studentRepository = studentRepository;
    }

    public List<Assignment> getAssignmentsByCourse(String courseId) {
        return assignmentRepository.findByCourseId(courseId);
    }

    public Assignment createAssignment(Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    public Assignment updateAssignment(String id, com.school.onlinelearning.dto.request.AssignmentRequestDTO dto) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        assignment.setTitle(dto.getTitle());
        assignment.setDescription(dto.getDescription());
        assignment.setDueDate(dto.getDueDate());
        assignment.setMaxScore((int) dto.getMaxScore());
        
        return assignmentRepository.save(assignment);
    }

    public void deleteAssignment(String id) {
        if (!assignmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Assignment not found");
        }
        assignmentRepository.deleteById(id);
    }

    public Submission submitAssignment(String assignmentId, String studentId, MultipartFile file) {
        if (!assignmentRepository.existsById(assignmentId)) {
            throw new ResourceNotFoundException("Assignment not found");
        }
        
        String filename = fileStorageService.storeFile(file);

        Submission submission = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId)
                .orElse(new Submission());

        submission.setAssignmentId(assignmentId);
        submission.setStudentId(studentId);
        submission.setPdfFilePath(filename);
        submission.setOriginalFileName(file.getOriginalFilename());
        submission.setSubmittedAt(LocalDateTime.now());
        // Do not overwrite score/feedback if they just re-upload before grading
        
        return submissionRepository.save(submission);
    }

    public Submission gradeSubmission(String submissionId, double score, String feedback) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        submission.setScore(score);
        submission.setFeedback(feedback);
        Submission saved = submissionRepository.save(submission);

        // Award XP to student based on score
        Student student = studentRepository.findById(submission.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        // Give xp equal to the score
        student.setXp(student.getXp() + (int)score);
        studentRepository.save(student);

        return saved;
    }

    public List<Submission> getSubmissionsForAssignment(String assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    public Submission getSubmissionForStudent(String assignmentId, String studentId) {
        return submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId).orElse(null);
    }

    public Submission getSubmissionById(String submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
    }
}
