package com.school.onlinelearning.config;

import com.school.onlinelearning.model.*;
import com.school.onlinelearning.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepository,
            StudentRepository studentRepository,
            InstructorRepository instructorRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository,
            AssignmentRepository assignmentRepository,
            SubmissionRepository submissionRepository,
            QuizRepository quizRepository,
            QuizAttemptRepository quizAttemptRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            boolean shouldSeed = true; // Set to false after first run if you don't want to clear data on every startup

            if (shouldSeed) {
                // Clear existing data
                userRepository.deleteAll();
                studentRepository.deleteAll();
                instructorRepository.deleteAll();
                courseRepository.deleteAll();
                enrollmentRepository.deleteAll();
                assignmentRepository.deleteAll();
                submissionRepository.deleteAll();
                quizRepository.deleteAll();
                quizAttemptRepository.deleteAll();

                // 1 Admin
                User admin = new User();
                admin.setFullName("Admin User");
                admin.setEmail("admin@example.com");
                admin.setPasswordHash(passwordEncoder.encode("password"));
                admin.setRole(UserRole.ADMIN);
                userRepository.save(admin);

                // 5 Teachers
                List<Instructor> instructors = new ArrayList<>();
                for (int i = 1; i <= 5; i++) {
                    User teacherUser = new User();
                    teacherUser.setFullName("Teacher " + i);
                    teacherUser.setEmail("teacher" + i + "@example.com");
                    teacherUser.setPasswordHash(passwordEncoder.encode("password"));
                    teacherUser.setRole(UserRole.TEACHER);
                    teacherUser = userRepository.save(teacherUser);

                    Instructor instructor = new Instructor();
                    instructor.setUserId(teacherUser.getId());
                    instructor.setFullName(teacherUser.getFullName());
                    instructor.setEmail(teacherUser.getEmail());
                    instructor.setSpecialization("Specialization " + i);
                    instructors.add(instructorRepository.save(instructor));
                }

                // 5 Students
                List<Student> students = new ArrayList<>();
                for (int i = 1; i <= 5; i++) {
                    User studentUser = new User();
                    studentUser.setFullName("Student " + i);
                    studentUser.setEmail("student" + i + "@example.com");
                    studentUser.setPasswordHash(passwordEncoder.encode("password"));
                    studentUser.setRole(UserRole.STUDENT);
                    studentUser = userRepository.save(studentUser);

                    Student student = new Student();
                    student.setUserId(studentUser.getId());
                    student.setFullName(studentUser.getFullName());
                    student.setEmail(studentUser.getEmail());
                    student.setBatch("Batch 202" + i);
                    student.setXp(i * 100);
                    students.add(studentRepository.save(student));
                }

                // Create Courses
                List<Course> courses = new ArrayList<>();
                for (int i = 0; i < instructors.size(); i++) {
                    Instructor inst = instructors.get(i);
                    Course course = new Course();
                    course.setTitle("Course " + (i + 1) + " by " + inst.getFullName());
                    course.setDescription("Description for course " + (i + 1));
                    course.setLevel(i % 2 == 0 ? "Beginner" : "Advanced");
                    course.setPrice(100.0 * (i + 1));
                    course.setInstructorId(inst.getId());

                    List<Lesson> lessons = new ArrayList<>();
                    Lesson lesson1 = new Lesson();
                    lesson1.setTitle("Introduction");
                    lesson1.setDurationMinutes(30);
                    Lesson lesson2 = new Lesson();
                    lesson2.setTitle("Deep Dive");
                    lesson2.setDurationMinutes(60);
                    lessons.add(lesson1);
                    lessons.add(lesson2);
                    course.setLessons(lessons);

                    courses.add(courseRepository.save(course));
                    
                    // Create Assignments
                    Assignment assignment = new Assignment();
                    assignment.setCourseId(course.getId());
                    assignment.setTitle("Assignment 1 for Course " + (i+1));
                    assignment.setDescription("Complete the tasks described in lesson 2.");
                    assignment.setDueDate(LocalDateTime.now().plusDays(7));
                    assignment.setMaxScore(100);
                    assignment = assignmentRepository.save(assignment);

                    // Create Quizzes
                    Quiz quiz = new Quiz();
                    quiz.setCourseId(course.getId());
                    quiz.setTitle("Quiz 1 for Course " + (i+1));
                    
                    List<Question> questions = new ArrayList<>();
                    Question q1 = new Question();
                    q1.setText("What is the main topic of this course?");
                    q1.setOptions(List.of("Option A", "Option B", "Option C", "Option D"));
                    q1.setCorrectAnswer("Option A");
                    questions.add(q1);
                    
                    Question q2 = new Question();
                    q2.setText("How long is the first lesson?");
                    q2.setOptions(List.of("10 mins", "20 mins", "30 mins", "60 mins"));
                    q2.setCorrectAnswer("30 mins");
                    questions.add(q2);
                    
                    quiz.setQuestions(questions);
                    quizRepository.save(quiz);
                }

                // Enroll Students and create mock submissions/attempts
                for (int i = 0; i < students.size(); i++) {
                    Student student = students.get(i);
                    Course course = courses.get(i % courses.size());
                    
                    Enrollment enrollment = new Enrollment();
                    enrollment.setStudentId(student.getId());
                    enrollment.setCourseId(course.getId());
                    enrollment.setProgress(i * 20);
                    enrollment.setEnrolledAt(LocalDateTime.now());
                    enrollmentRepository.save(enrollment);

                    // Submission
                    Assignment assignment = assignmentRepository.findByCourseId(course.getId()).get(0);
                    Submission submission = new Submission();
                    submission.setAssignmentId(assignment.getId());
                    submission.setStudentId(student.getId());
                    submission.setOriginalFileName("homework_" + student.getId() + ".pdf");
                    submission.setPdfFilePath("uploads/dummy.pdf");
                    submission.setSubmittedAt(LocalDateTime.now().minusDays(1));
                    submission.setScore(80.0 + i);
                    submission.setFeedback("Good job!");
                    submissionRepository.save(submission);

                    // Quiz Attempt
                    Quiz quiz = quizRepository.findByCourseId(course.getId()).get(0);
                    QuizAttempt attempt = new QuizAttempt();
                    attempt.setQuizId(quiz.getId());
                    attempt.setStudentId(student.getId());
                    attempt.setAnswers(java.util.Map.of(0, "Option A", 1, "30 mins"));
                    attempt.setScore(100);
                    attempt.setTotalQuestions(2);
                    attempt.setAttemptedAt(LocalDateTime.now().minusDays(1));
                    quizAttemptRepository.save(attempt);
                }
            }
        };
    }
}
