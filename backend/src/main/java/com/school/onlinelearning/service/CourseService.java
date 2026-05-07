package com.school.onlinelearning.service;

import com.school.onlinelearning.dto.request.CourseRequestDTO;
import com.school.onlinelearning.dto.response.CourseResponseDTO;
import com.school.onlinelearning.dto.response.PageResponseDTO;
import com.school.onlinelearning.model.Lesson;
import org.springframework.data.domain.Pageable;

public interface CourseService {
    PageResponseDTO<CourseResponseDTO> getAllCourses(String level, String search, Pageable pageable);
    CourseResponseDTO getCourseById(String id);
    CourseResponseDTO createCourse(CourseRequestDTO course);
    CourseResponseDTO updateCourse(String id, CourseRequestDTO payload);
    void deleteCourse(String id);
    CourseResponseDTO addLesson(String courseId, Lesson lesson);
    CourseResponseDTO removeLesson(String courseId, int lessonIndex);
}
