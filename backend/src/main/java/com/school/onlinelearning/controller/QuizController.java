package com.school.onlinelearning.controller;

import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Quiz;
import com.school.onlinelearning.model.QuizAttempt;
import com.school.onlinelearning.model.Student;
import com.school.onlinelearning.repository.StudentRepository;
import com.school.onlinelearning.security.AuthenticatedUser;
import com.school.onlinelearning.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;
    private final StudentRepository studentRepository;

    public QuizController(QuizService quizService, StudentRepository studentRepository) {
        this.quizService = quizService;
        this.studentRepository = studentRepository;
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Quiz>> getQuizzesByCourse(@PathVariable String courseId) {
        return ResponseEntity.ok(quizService.getQuizzesByCourse(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable String id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@Valid @RequestBody Quiz quiz) {
        return ResponseEntity.ok(quizService.createQuiz(quiz));
    }

    @PreAuthorize("hasRole('TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable String id, @RequestBody Quiz quiz) {
        return ResponseEntity.ok(quizService.updateQuiz(id, quiz));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/{id}/attempt")
    public ResponseEntity<QuizAttempt> submitQuizAttempt(
            @PathVariable String id,
            @RequestBody Map<Integer, String> answers,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {

        Student student = studentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        return ResponseEntity.ok(quizService.submitQuizAttempt(id, student.getId(), answers));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/{id}/my-attempt")
    public ResponseEntity<QuizAttempt> getMyAttempt(
            @PathVariable String id,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {

        Student student = studentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        QuizAttempt attempt = quizService.getAttemptForStudent(id, student.getId());
        if (attempt == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(attempt);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/my-attempts")
    public ResponseEntity<List<QuizAttempt>> getMyAttempts(
            @AuthenticationPrincipal AuthenticatedUser currentUser) {

        Student student = studentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        return ResponseEntity.ok(quizService.getAttemptsForStudent(student.getId()));
    }

    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping("/{id}/attempts")
    public ResponseEntity<List<QuizAttempt>> getAttempts(@PathVariable String id) {
        return ResponseEntity.ok(quizService.getAttemptsForQuiz(id));
    }
}
