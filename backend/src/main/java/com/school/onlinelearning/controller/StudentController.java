package com.school.onlinelearning.controller;

import com.school.onlinelearning.dto.request.StudentRequestDTO;
import com.school.onlinelearning.dto.response.PageResponseDTO;
import com.school.onlinelearning.dto.response.StudentResponseDTO;
import com.school.onlinelearning.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
public class StudentController {

	private final StudentService studentService;

	public StudentController(StudentService studentService) {
		this.studentService = studentService;
	}

	@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
	@GetMapping
	public ResponseEntity<PageResponseDTO<StudentResponseDTO>> getAllStudents(
			@RequestParam(required = false) String search,
			Pageable pageable) {
		return ResponseEntity.ok(studentService.getAllStudents(search, pageable));
	}

	@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
	@GetMapping("/{id}")
	public ResponseEntity<StudentResponseDTO> getStudentById(@PathVariable String id) {
		return ResponseEntity.ok(studentService.getStudentById(id));
	}

	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping
	public ResponseEntity<StudentResponseDTO> createStudent(@Valid @RequestBody StudentRequestDTO student) {
		return ResponseEntity.status(HttpStatus.CREATED).body(studentService.createStudent(student));
	}

	@PreAuthorize("hasRole('ADMIN')")
	@PutMapping("/{id}")
	public ResponseEntity<StudentResponseDTO> updateStudent(@PathVariable String id, @Valid @RequestBody StudentRequestDTO student) {
		return ResponseEntity.ok(studentService.updateStudent(id, student));
	}

	@PreAuthorize("hasRole('ADMIN')")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteStudent(@PathVariable String id) {
		studentService.deleteStudent(id);
		return ResponseEntity.noContent().build();
	}
}
