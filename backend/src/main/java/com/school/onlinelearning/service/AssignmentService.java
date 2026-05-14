package com.school.onlinelearning.service;

import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Assignment;
import com.school.onlinelearning.model.Enrollment;
import com.school.onlinelearning.model.Notification;
import com.school.onlinelearning.model.Student;
import com.school.onlinelearning.model.Submission;
import com.school.onlinelearning.repository.AssignmentRepository;
import com.school.onlinelearning.repository.EnrollmentRepository;
import com.school.onlinelearning.repository.StudentRepository;
import com.school.onlinelearning.repository.SubmissionRepository;
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
    private final EnrollmentRepository enrollmentRepository;
    private final NotificationService notificationService;

    public AssignmentService(AssignmentRepository assignmentRepository,
                             SubmissionRepository submissionRepository,
                             FileStorageService fileStorageService,
                             StudentRepository studentRepository,
                             EnrollmentRepository enrollmentRepository,
                             NotificationService notificationService) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.fileStorageService = fileStorageService;
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.notificationService = notificationService;
    }

    public List<Assignment> getAssignmentsByCourse(String courseId) {
        return assignmentRepository.findByCourseId(courseId);
    }

    public Assignment getAssignmentById(String id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + id));
    }

    public Assignment createAssignment(Assignment assignment) {
        Assignment saved = assignmentRepository.save(assignment);

        // Notify all enrolled students
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(assignment.getCourseId());
        for (Enrollment enrollment : enrollments) {
            Student student = studentRepository.findById(enrollment.getStudentId()).orElse(null);
            if (student != null && student.getUserId() != null) {
                notificationService.createNotification(
                        student.getUserId(),
                        "Шинэ даалгавар",
                        "\"" + assignment.getTitle() + "\" даалгавар нэмэгдлээ.",
                        Notification.NotificationType.ASSIGNMENT_CREATED,
                        "/assignments"
                );
            }
        }

        return saved;
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
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        String filename = fileStorageService.storeFile(file);

        Submission submission = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId)
                .orElse(new Submission());

        submission.setAssignmentId(assignmentId);
        submission.setStudentId(studentId);
        submission.setPdfFilePath(filename);
        submission.setOriginalFileName(file.getOriginalFilename());
        submission.setSubmittedAt(LocalDateTime.now());

        Submission saved = submissionRepository.save(submission);

        // Notify the student that submission was received
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student != null && student.getUserId() != null) {
            notificationService.createNotification(
                    student.getUserId(),
                    "Даалгавар илгээгдлээ",
                    "\"" + assignment.getTitle() + "\" даалгавар амжилттай илгээгдлээ.",
                    Notification.NotificationType.SUBMISSION,
                    "/assignments"
            );
        }

        return saved;
    }

    public Submission gradeSubmission(String submissionId, double score, String feedback) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        // Validate score range
        if (score < 0) {
            throw new IllegalArgumentException("Score must be 0 or greater");
        }
        if (score > assignment.getMaxScore()) {
            throw new IllegalArgumentException("Score cannot exceed the maximum score of " + assignment.getMaxScore());
        }

        // Validate feedback length
        if (feedback != null && feedback.length() > 1000) {
            throw new IllegalArgumentException("Feedback cannot exceed 1000 characters");
        }

        double previousScore = submission.getScore() != null ? submission.getScore() : 0.0;
        submission.setScore(score);
        submission.setFeedback(feedback);
        Submission saved = submissionRepository.save(submission);

        // Award XP delta so re-grading never double-counts
        Student student = studentRepository.findById(submission.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        int xpDelta = (int) score - (int) previousScore;
        student.setXp(Math.max(0, student.getXp() + xpDelta));
        studentRepository.save(student);

        // Notify student that submission was graded
        if (student.getUserId() != null) {
            notificationService.createNotification(
                    student.getUserId(),
                    "Даалгавар дүгнэгдлээ",
                    "\"" + assignment.getTitle() + "\" даалгавар дүгнэгдлээ. Оноо: " + (int) score + "/" + assignment.getMaxScore(),
                    Notification.NotificationType.GRADE,
                    "/assignments"
            );
        }

        return saved;
    }

    public List<Submission> getSubmissionsForAssignment(String assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    public List<Submission> getSubmissionsForStudent(String studentId) {
        return submissionRepository.findByStudentId(studentId);
    }

    public Submission getSubmissionForStudent(String assignmentId, String studentId) {
        return submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId).orElse(null);
    }

    public Submission getSubmissionById(String submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
    }
}
