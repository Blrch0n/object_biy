package com.school.onlinelearning.service;

import com.school.onlinelearning.dto.request.CourseRequestDTO;
import com.school.onlinelearning.dto.response.CourseResponseDTO;
import com.school.onlinelearning.dto.response.PageResponseDTO;
import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Course;
import com.school.onlinelearning.model.Lesson;
import com.school.onlinelearning.repository.CourseRepository;
import com.school.onlinelearning.repository.EnrollmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseServiceImpl(CourseRepository courseRepository, EnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Override
    public PageResponseDTO<CourseResponseDTO> getAllCourses(String level, String search, Pageable pageable) {
        Page<Course> page;
        if (search != null && !search.isBlank()) {
            page = courseRepository.findByTitleContainingIgnoreCaseOrCategoryContainingIgnoreCase(search, search, pageable);
        } else if (level != null && !level.isBlank()) {
            page = courseRepository.findByLevelIgnoreCase(level, pageable);
        } else {
            page = courseRepository.findAll(pageable);
        }
        return PageResponseDTO.of(page.map(CourseResponseDTO::fromEntity));
    }

    @Override
    public CourseResponseDTO getCourseById(String id) {
        return CourseResponseDTO.fromEntity(getCourseEntityById(id));
    }

    @Override
    public CourseResponseDTO createCourse(CourseRequestDTO payload) {
        Course course = new Course();
        course.setTitle(payload.title());
        course.setDescription(payload.description());
        course.setCategory(payload.category());
        course.setLevel(payload.level());
        course.setPrice(payload.price());
        course.setInstructorId(payload.instructorId());
        course.setLessons(new ArrayList<>());
        return CourseResponseDTO.fromEntity(courseRepository.save(course));
    }

    @Override
    public CourseResponseDTO updateCourse(String id, CourseRequestDTO payload) {
        Course existing = getCourseEntityById(id);
        existing.setTitle(payload.title());
        existing.setDescription(payload.description());
        existing.setCategory(payload.category());
        existing.setLevel(payload.level());
        existing.setPrice(payload.price());
        existing.setInstructorId(payload.instructorId());
        return CourseResponseDTO.fromEntity(courseRepository.save(existing));
    }

    @Override
    public void deleteCourse(String id) {
        Course existing = getCourseEntityById(id);
        enrollmentRepository.deleteAll(enrollmentRepository.findByCourseId(id));
        courseRepository.delete(existing);
    }

    @Override
    public CourseResponseDTO addLesson(String courseId, Lesson lesson) {
        Course course = getCourseEntityById(courseId);

        boolean duplicateTitle = course.getLessons().stream()
                .anyMatch(existingLesson -> existingLesson.getTitle() != null
                        && existingLesson.getTitle().equalsIgnoreCase(lesson.getTitle()));

        if (duplicateTitle) {
            throw new IllegalArgumentException("Lesson title already exists in this course: " + lesson.getTitle());
        }

        course.getLessons().add(lesson);
        return CourseResponseDTO.fromEntity(courseRepository.save(course));
    }

    @Override
    public CourseResponseDTO removeLesson(String courseId, int lessonIndex) {
        Course course = getCourseEntityById(courseId);
        if (lessonIndex < 0 || lessonIndex >= course.getLessons().size()) {
            throw new IllegalArgumentException("Lesson index is out of range");
        }
        course.getLessons().remove(lessonIndex);
        return CourseResponseDTO.fromEntity(courseRepository.save(course));
    }

    private Course getCourseEntityById(String id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
    }
}
