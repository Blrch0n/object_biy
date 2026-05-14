package com.school.onlinelearning.service;

import com.school.onlinelearning.dto.dashboard.ActivityItem;
import com.school.onlinelearning.dto.dashboard.DashboardActivityResponse;
import com.school.onlinelearning.dto.dashboard.DashboardStatsResponse;
import com.school.onlinelearning.model.Course;
import com.school.onlinelearning.model.Enrollment;
import com.school.onlinelearning.model.QuizAttempt;
import com.school.onlinelearning.model.Student;
import com.school.onlinelearning.model.Submission;
import com.school.onlinelearning.model.UserRole;
import com.school.onlinelearning.repository.AssignmentRepository;
import com.school.onlinelearning.repository.CourseRepository;
import com.school.onlinelearning.repository.EnrollmentRepository;
import com.school.onlinelearning.repository.QuizAttemptRepository;
import com.school.onlinelearning.repository.StudentRepository;
import com.school.onlinelearning.repository.SubmissionRepository;
import com.school.onlinelearning.security.AuthenticatedUser;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

	private final StudentRepository studentRepository;
	private final CourseRepository courseRepository;
	private final EnrollmentRepository enrollmentRepository;
	private final SubmissionRepository submissionRepository;
	private final QuizAttemptRepository quizAttemptRepository;
	private final AssignmentRepository assignmentRepository;

	public DashboardService(
			StudentRepository studentRepository,
			CourseRepository courseRepository,
			EnrollmentRepository enrollmentRepository,
			SubmissionRepository submissionRepository,
			QuizAttemptRepository quizAttemptRepository,
			AssignmentRepository assignmentRepository
	) {
		this.studentRepository = studentRepository;
		this.courseRepository = courseRepository;
		this.enrollmentRepository = enrollmentRepository;
		this.submissionRepository = submissionRepository;
		this.quizAttemptRepository = quizAttemptRepository;
		this.assignmentRepository = assignmentRepository;
	}

	public DashboardStatsResponse getStats() {
		long totalStudents = studentRepository.count();

		List<Enrollment> enrollments = enrollmentRepository.findAll();
		double averageProgress = enrollments.stream()
				.mapToDouble(Enrollment::getProgress)
				.average()
				.orElse(0.0);

		List<Course> courses = courseRepository.findAll();
		Course courseWithMostLessons = null;
		int maxLessons = -1;
		for (Course course : courses) {
			int lessonCount = (course.getLessons() != null) ? course.getLessons().size() : 0;
			if (courseWithMostLessons == null || lessonCount > maxLessons) {
				courseWithMostLessons = course;
				maxLessons = lessonCount;
			}
		}

		String topTitle = courseWithMostLessons != null ? courseWithMostLessons.getTitle() : "N/A";
		int topCount = maxLessons >= 0 ? maxLessons : 0;

		return new DashboardStatsResponse(
				totalStudents,
				courses.size(),
				enrollments.size(),
				Math.round(averageProgress * 100.0) / 100.0,
				topTitle,
				topCount
		);
	}

	public DashboardActivityResponse getActivity(AuthenticatedUser currentUser) {
		List<ActivityItem> items = new ArrayList<>();

		if (currentUser.getRole() == UserRole.STUDENT) {
			// Student: show their own submissions and quiz attempts
			Student student = studentRepository.findByUserId(currentUser.getId()).orElse(null);
			if (student != null) {
				List<Submission> submissions = submissionRepository.findByStudentId(student.getId());
				for (Submission s : submissions) {
					String title = assignmentRepository.findById(s.getAssignmentId())
							.map(a -> "\"" + a.getTitle() + "\" илгээгдлээ")
							.orElse("Даалгавар илгээгдлээ");
					items.add(new ActivityItem("SUBMISSION", title, "/assignments", s.getSubmittedAt(), student.getFullName()));
				}

				List<QuizAttempt> attempts = quizAttemptRepository.findByStudentId(student.getId());
				for (QuizAttempt a : attempts) {
					items.add(new ActivityItem("QUIZ_ATTEMPT", "Сорил өгсөн: " + a.getScore() + "/" + a.getTotalQuestions(), "/quizzes", a.getAttemptedAt(), student.getFullName()));
				}
			}
		} else {
			// Teacher: show recent submissions across all courses
			List<Submission> allSubmissions = submissionRepository.findAll();
			for (Submission s : allSubmissions) {
				Student student = studentRepository.findById(s.getStudentId()).orElse(null);
				String actorName = student != null ? student.getFullName() : "Оюутан";
				items.add(new ActivityItem("SUBMISSION", "Даалгавар илгээлт: " + actorName, "/review-center", s.getSubmittedAt(), actorName));
			}

			List<QuizAttempt> allAttempts = quizAttemptRepository.findAll();
			for (QuizAttempt a : allAttempts) {
				Student student = studentRepository.findById(a.getStudentId()).orElse(null);
				String actorName = student != null ? student.getFullName() : "Оюутан";
				items.add(new ActivityItem("QUIZ_ATTEMPT", "Сорил өгсөн: " + actorName + " (" + a.getScore() + "/" + a.getTotalQuestions() + ")", "/quizzes", a.getAttemptedAt(), actorName));
			}
		}

		// Sort by most recent, limit to 20
		List<ActivityItem> sorted = items.stream()
				.filter(i -> i.getCreatedAt() != null)
				.sorted(Comparator.comparing(ActivityItem::getCreatedAt).reversed())
				.limit(20)
				.collect(Collectors.toList());

		return new DashboardActivityResponse(sorted);
	}
}
