package com.school.onlinelearning.controller;

import com.school.onlinelearning.dto.request.ProfileUpdateDTO;
import com.school.onlinelearning.dto.request.StudentRequestDTO;
import com.school.onlinelearning.dto.response.PageResponseDTO;
import com.school.onlinelearning.dto.response.StudentResponseDTO;
import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Student;
import com.school.onlinelearning.repository.StudentRepository;
import com.school.onlinelearning.repository.UserRepository;
import com.school.onlinelearning.security.AuthenticatedUser;
import com.school.onlinelearning.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
public class StudentController {

	private final StudentService studentService;
	private final StudentRepository studentRepository;
	private final UserRepository userRepository;

	public StudentController(StudentService studentService, StudentRepository studentRepository, UserRepository userRepository) {
		this.studentService = studentService;
		this.studentRepository = studentRepository;
		this.userRepository = userRepository;
	}

	@PreAuthorize("hasRole('STUDENT')")
	@GetMapping("/me")
	public ResponseEntity<Student> getMyProfile(@AuthenticationPrincipal AuthenticatedUser currentUser) {
		Student student = studentRepository.findByUserId(currentUser.getId())
				.orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
		return ResponseEntity.ok(student);
	}

	@PreAuthorize("hasRole('STUDENT')")
	@PatchMapping("/me")
	public ResponseEntity<Student> updateMyProfile(
			@RequestBody ProfileUpdateDTO dto,
			@AuthenticationPrincipal AuthenticatedUser currentUser) {
		Student student = studentRepository.findByUserId(currentUser.getId())
				.orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
		if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
			student.setFullName(dto.getFullName());
			userRepository.findById(currentUser.getId()).ifPresent(u -> {
				u.setFullName(dto.getFullName());
				userRepository.save(u);
			});
		}
		if (dto.getBatch() != null && !dto.getBatch().isBlank()) {
			student.setBatch(dto.getBatch());
		}
		return ResponseEntity.ok(studentRepository.save(student));
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
