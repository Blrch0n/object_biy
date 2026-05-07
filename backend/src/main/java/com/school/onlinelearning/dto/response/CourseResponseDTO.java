package com.school.onlinelearning.dto.response;

import com.school.onlinelearning.model.Course;
import com.school.onlinelearning.model.Lesson;
import java.util.List;

public record CourseResponseDTO(
        String id,
        String title,
        String description,
        String category,
        String level,
        double price,
        String instructorId,
        List<Lesson> lessons
) {
    public static CourseResponseDTO fromEntity(Course entity) {
        return new CourseResponseDTO(
            entity.getId(),
            entity.getTitle(),
            entity.getDescription(),
            entity.getCategory(),
            entity.getLevel(),
            entity.getPrice(),
            entity.getInstructorId(),
            entity.getLessons()
        );
    }
}
