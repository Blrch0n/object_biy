package com.school.onlinelearning.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record StudentRequestDTO(
        @NotBlank(message = "Full name is required") String fullName,
        @NotBlank(message = "Email is required") @Email(message = "Valid email is required") String email,
        String password,
        @NotBlank(message = "Batch is required") String batch
) {}
