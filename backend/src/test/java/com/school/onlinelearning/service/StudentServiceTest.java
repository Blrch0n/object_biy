package com.school.onlinelearning.service;

import com.school.onlinelearning.exception.DuplicateResourceException;
import com.school.onlinelearning.dto.request.StudentRequestDTO;
import com.school.onlinelearning.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

        @Mock
        private StudentRepository studentRepository;

        @InjectMocks
        private StudentServiceImpl studentService;

        @Test
        void createStudentThrowsWhenEmailAlreadyExists() {
                StudentRequestDTO student = new StudentRequestDTO("Test User", "test@example.com", "password", "CS-2024");
                when(studentRepository.existsByEmail("test@example.com")).thenReturn(true);
                assertThrows(DuplicateResourceException.class, () -> studentService.createStudent(student));
        }
}
