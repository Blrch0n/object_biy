package com.school.onlinelearning.controller;

import com.school.onlinelearning.dto.request.CourseRequestDTO;
import com.school.onlinelearning.dto.response.CourseResponseDTO;
import com.school.onlinelearning.dto.response.PageResponseDTO;
import com.school.onlinelearning.model.Lesson;
import com.school.onlinelearning.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<CourseResponseDTO>> getAllCourses(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(courseService.getAllCourses(level, search, pageable));
    }

    @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponseDTO> getCourseById(@PathVariable String id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @PostMapping
    public ResponseEntity<CourseResponseDTO> createCourse(@Valid @RequestBody CourseRequestDTO course) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createCourse(course));
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<CourseResponseDTO> updateCourse(@PathVariable String id, @Valid @RequestBody CourseRequestDTO course) {
        return ResponseEntity.ok(courseService.updateCourse(id, course));
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable String id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @PostMapping("/{courseId}/lessons")
    public ResponseEntity<CourseResponseDTO> addLesson(@PathVariable String courseId, @Valid @RequestBody Lesson lesson) {
        return ResponseEntity.ok(courseService.addLesson(courseId, lesson));
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @DeleteMapping("/{courseId}/lessons/{lessonIndex}")
    public ResponseEntity<CourseResponseDTO> removeLesson(@PathVariable String courseId, @PathVariable int lessonIndex) {
        return ResponseEntity.ok(courseService.removeLesson(courseId, lessonIndex));
    }
}