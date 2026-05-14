package com.school.onlinelearning.controller;

import com.school.onlinelearning.dto.request.InstructorRequestDTO;
import com.school.onlinelearning.dto.request.ProfileUpdateDTO;
import com.school.onlinelearning.dto.response.InstructorResponseDTO;
import com.school.onlinelearning.dto.response.PageResponseDTO;
import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Instructor;
import com.school.onlinelearning.repository.InstructorRepository;
import com.school.onlinelearning.repository.UserRepository;
import com.school.onlinelearning.security.AuthenticatedUser;
import com.school.onlinelearning.service.InstructorService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/instructors")
public class InstructorController {

	private final InstructorService instructorService;
	private final InstructorRepository instructorRepository;
	private final UserRepository userRepository;

	public InstructorController(InstructorService instructorService, InstructorRepository instructorRepository, UserRepository userRepository) {
		this.instructorService = instructorService;
		this.instructorRepository = instructorRepository;
		this.userRepository = userRepository;
	}

	@PreAuthorize("hasRole('TEACHER')")
	@GetMapping("/me")
	public ResponseEntity<Instructor> getMyProfile(@AuthenticationPrincipal AuthenticatedUser currentUser) {
		Instructor instructor = instructorRepository.findByUserId(currentUser.getId())
				.or(() -> instructorRepository.findByEmail(currentUser.getUsername())
						.map(i -> { i.setUserId(currentUser.getId()); return instructorRepository.save(i); }))
				.orElseThrow(() -> new ResourceNotFoundException("Instructor profile not found"));
		return ResponseEntity.ok(instructor);
	}

	@PreAuthorize("hasRole('TEACHER')")
	@PatchMapping("/me")
	public ResponseEntity<Instructor> updateMyProfile(
			@RequestBody ProfileUpdateDTO dto,
			@AuthenticationPrincipal AuthenticatedUser currentUser) {
		Instructor instructor = instructorRepository.findByUserId(currentUser.getId())
				.or(() -> instructorRepository.findByEmail(currentUser.getUsername())
						.map(i -> { i.setUserId(currentUser.getId()); return instructorRepository.save(i); }))
				.orElseThrow(() -> new ResourceNotFoundException("Instructor profile not found"));
		if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
			instructor.setFullName(dto.getFullName());
			userRepository.findById(currentUser.getId()).ifPresent(u -> {
				u.setFullName(dto.getFullName());
				userRepository.save(u);
			});
		}
		if (dto.getSpecialization() != null && !dto.getSpecialization().isBlank()) {
			instructor.setSpecialization(dto.getSpecialization());
		}
		return ResponseEntity.ok(instructorRepository.save(instructor));
	}

	@PreAuthorize("hasAnyRole('STUDENT','TEACHER', 'ADMIN')")
	@GetMapping
	public ResponseEntity<PageResponseDTO<InstructorResponseDTO>> getAllInstructors(Pageable pageable) {
		return ResponseEntity.ok(instructorService.getAllInstructors(pageable));
	}

	@PreAuthorize("hasAnyRole('STUDENT','TEACHER', 'ADMIN')")
	@GetMapping("/{id}")
	public ResponseEntity<InstructorResponseDTO> getInstructorById(@PathVariable String id) {
		return ResponseEntity.ok(instructorService.getInstructorById(id));
	}

	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping
	public ResponseEntity<InstructorResponseDTO> createInstructor(@Valid @RequestBody InstructorRequestDTO instructor) {
		return ResponseEntity.status(HttpStatus.CREATED).body(instructorService.createInstructor(instructor));
	}

	@PreAuthorize("hasRole('ADMIN')")
	@PutMapping("/{id}")
	public ResponseEntity<InstructorResponseDTO> updateInstructor(@PathVariable String id, @Valid @RequestBody InstructorRequestDTO instructor) {
		return ResponseEntity.ok(instructorService.updateInstructor(id, instructor));
	}

	@PreAuthorize("hasRole('ADMIN')")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteInstructor(@PathVariable String id) {
		instructorService.deleteInstructor(id);
		return ResponseEntity.noContent().build();
	}
}
