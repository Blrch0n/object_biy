package com.school.onlinelearning.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CourseRequestDTO(
        @NotBlank(message = "Title is required") String title,
        @NotBlank(message = "Description is required") String description,
        String category,
        @NotBlank(message = "Level is required") String level,
        @Min(value = 0, message = "Price must be greater than or equal to 0") double price,
        @NotBlank(message = "Instructor ID is required") String instructorId
) {}
