package com.school.onlinelearning.controller;

import com.school.onlinelearning.dto.request.InstructorRequestDTO;
import com.school.onlinelearning.dto.response.InstructorResponseDTO;
import com.school.onlinelearning.dto.response.PageResponseDTO;
import com.school.onlinelearning.service.InstructorService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/instructors")
public class InstructorController {

	private final InstructorService instructorService;

	public InstructorController(InstructorService instructorService) {
		this.instructorService = instructorService;
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
