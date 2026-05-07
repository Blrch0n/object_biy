package com.school.onlinelearning.controller;

import com.school.onlinelearning.dto.auth.AuthResponse;
import com.school.onlinelearning.dto.auth.LoginRequest;
import com.school.onlinelearning.dto.auth.SignupRequest;
import com.school.onlinelearning.dto.auth.UserResponse;
import com.school.onlinelearning.security.AuthenticatedUser;
import com.school.onlinelearning.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/signup")
	public ResponseEntity<UserResponse> signup(@Valid @RequestBody SignupRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(request));
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
		return ResponseEntity.ok(authService.login(request));
	}

	@PostMapping("/refresh")
	public ResponseEntity<AuthResponse> refresh(@AuthenticationPrincipal AuthenticatedUser currentUser) {
		return ResponseEntity.ok(authService.refreshToken(currentUser));
	}

	@GetMapping("/me")
	public ResponseEntity<UserResponse> me(@AuthenticationPrincipal AuthenticatedUser currentUser) {
		return ResponseEntity.ok(authService.me(currentUser));
	}
}
