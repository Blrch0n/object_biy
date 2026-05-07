package com.school.onlinelearning.service;

import com.school.onlinelearning.dto.dashboard.DashboardStatsResponse;
import com.school.onlinelearning.model.Course;
import com.school.onlinelearning.model.Enrollment;
import com.school.onlinelearning.repository.CourseRepository;
import com.school.onlinelearning.repository.EnrollmentRepository;
import com.school.onlinelearning.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

	private final StudentRepository studentRepository;
	private final CourseRepository courseRepository;
	private final EnrollmentRepository enrollmentRepository;

	public DashboardService(
			StudentRepository studentRepository,
			CourseRepository courseRepository,
			EnrollmentRepository enrollmentRepository
	) {
		this.studentRepository = studentRepository;
		this.courseRepository = courseRepository;
		this.enrollmentRepository = enrollmentRepository;
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
}
