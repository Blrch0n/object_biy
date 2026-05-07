package com.school.onlinelearning.controller;

import com.school.onlinelearning.dto.enrollment.EnrollmentResponse;
import com.school.onlinelearning.model.Enrollment;
import com.school.onlinelearning.security.AuthenticatedUser;
import com.school.onlinelearning.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

	private final EnrollmentService enrollmentService;

	public EnrollmentController(EnrollmentService enrollmentService) {
		this.enrollmentService = enrollmentService;
	}

	@PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
	@GetMapping
	public ResponseEntity<List<EnrollmentResponse>> getAllEnrollments(
			@AuthenticationPrincipal AuthenticatedUser currentUser,
			@RequestParam(required = false) String sort
	) {
		return ResponseEntity.ok(enrollmentService.getAllEnrollments(currentUser, sort));
	}

	@PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
	@GetMapping("/{id}")
	public ResponseEntity<EnrollmentResponse> getEnrollmentById(
			@PathVariable String id,
			@AuthenticationPrincipal AuthenticatedUser currentUser
	) {
		return ResponseEntity.ok(enrollmentService.getEnrollmentById(id, currentUser));
	}

	@PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
	@PostMapping
	public ResponseEntity<EnrollmentResponse> createEnrollment(@Valid @RequestBody Enrollment enrollment) {
		EnrollmentResponse createdEnrollment = enrollmentService.createEnrollment(enrollment);
		return ResponseEntity.status(HttpStatus.CREATED).body(createdEnrollment);
	}

	@PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
	@PatchMapping("/{id}/progress")
	public ResponseEntity<EnrollmentResponse> updateProgress(@PathVariable String id, @RequestParam("value") double value) {
		EnrollmentResponse updatedEnrollment = enrollmentService.updateProgress(id, value);
		return ResponseEntity.ok(updatedEnrollment);
	}

	@PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteEnrollment(@PathVariable String id) {
		enrollmentService.deleteEnrollment(id);
		return ResponseEntity.noContent().build();
	}
}
