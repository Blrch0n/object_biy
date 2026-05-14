package com.school.onlinelearning.service;

import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Notification;
import com.school.onlinelearning.model.Question;
import com.school.onlinelearning.model.Quiz;
import com.school.onlinelearning.model.QuizAttempt;
import com.school.onlinelearning.model.Student;
import com.school.onlinelearning.repository.QuizAttemptRepository;
import com.school.onlinelearning.repository.QuizRepository;
import com.school.onlinelearning.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final StudentRepository studentRepository;
    private final NotificationService notificationService;

    public QuizService(QuizRepository quizRepository,
                       QuizAttemptRepository quizAttemptRepository,
                       StudentRepository studentRepository,
                       NotificationService notificationService) {
        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.studentRepository = studentRepository;
        this.notificationService = notificationService;
    }

    public Quiz createQuiz(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    public Quiz updateQuiz(String id, Quiz updated) {
        Quiz existing = getQuizById(id);
        existing.setTitle(updated.getTitle());
        if (updated.getQuestions() != null && !updated.getQuestions().isEmpty()) {
            existing.setQuestions(updated.getQuestions());
        }
        return quizRepository.save(existing);
    }

    public List<Quiz> getQuizzesByCourse(String courseId) {
        return quizRepository.findByCourseId(courseId);
    }

    public Quiz getQuizById(String quizId) {
        return quizRepository.findById(quizId).orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
    }

    public QuizAttempt submitQuizAttempt(String quizId, String studentId, Map<String, String> answers) {
        Quiz quiz = getQuizById(quizId);

        // Auto-grade
        int score = 0;
        List<Question> questions = quiz.getQuestions();
        for (int i = 0; i < questions.size(); i++) {
            String studentAnswer = answers.get(String.valueOf(i));
            if (studentAnswer != null && studentAnswer.trim().equalsIgnoreCase(questions.get(i).getCorrectAnswer().trim())) {
                score++;
            }
        }

        // Calculate XP (10 XP per correct question)
        int xpEarned = score * 10;

        QuizAttempt attempt = quizAttemptRepository.findByQuizIdAndStudentId(quizId, studentId)
                .orElse(new QuizAttempt());

        boolean isFirstAttempt = attempt.getId() == null;

        attempt.setQuizId(quizId);
        attempt.setStudentId(studentId);
        attempt.setAnswers(answers);
        attempt.setScore(score);
        attempt.setTotalQuestions(questions.size());
        attempt.setAttemptedAt(LocalDateTime.now());

        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

        // Award XP only on the first attempt to prevent stacking
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        if (isFirstAttempt) {
            student.setXp(student.getXp() + xpEarned);
            studentRepository.save(student);
        }

        // Notify student of result
        if (student.getUserId() != null) {
            boolean passed = questions.size() > 0 && ((double) score / questions.size()) >= 0.5;
            notificationService.createNotification(
                    student.getUserId(),
                    "Сорил дуусгалаа",
                    "\"" + quiz.getTitle() + "\" соролд " + score + "/" + questions.size() + " оноо авлаа. " + (passed ? "Тэнцлээ ✓" : "Тэнцсэнгүй ✗"),
                    Notification.NotificationType.QUIZ_ATTEMPT,
                    "/quizzes"
            );
        }

        return savedAttempt;
    }

    public List<QuizAttempt> getAttemptsForQuiz(String quizId) {
        return quizAttemptRepository.findByQuizId(quizId);
    }

    public QuizAttempt getAttemptForStudent(String quizId, String studentId) {
        return quizAttemptRepository.findByQuizIdAndStudentId(quizId, studentId).orElse(null);
    }

    public List<QuizAttempt> getAttemptsForStudent(String studentId) {
        return quizAttemptRepository.findByStudentId(studentId);
    }
}
