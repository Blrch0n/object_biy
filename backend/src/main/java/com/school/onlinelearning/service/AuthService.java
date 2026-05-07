package com.school.onlinelearning.service;

import com.school.onlinelearning.dto.auth.AuthResponse;
import com.school.onlinelearning.dto.auth.LoginRequest;
import com.school.onlinelearning.dto.auth.SignupRequest;
import com.school.onlinelearning.dto.auth.UserResponse;
import com.school.onlinelearning.exception.DuplicateResourceException;
import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Instructor;
import com.school.onlinelearning.model.Student;
import com.school.onlinelearning.model.User;
import com.school.onlinelearning.model.UserRole;
import com.school.onlinelearning.repository.InstructorRepository;
import com.school.onlinelearning.repository.StudentRepository;
import com.school.onlinelearning.repository.UserRepository;
import com.school.onlinelearning.security.AuthenticatedUser;
import com.school.onlinelearning.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final StudentRepository studentRepository;
	private final InstructorRepository instructorRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public AuthService(
			UserRepository userRepository,
			StudentRepository studentRepository,
			InstructorRepository instructorRepository,
			PasswordEncoder passwordEncoder,
			JwtService jwtService
	) {
		this.userRepository = userRepository;
		this.studentRepository = studentRepository;
		this.instructorRepository = instructorRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	public UserResponse signup(SignupRequest request) {
		String email = normalizeEmail(request.getEmail());
		if (userRepository.existsByEmail(email)) {
			throw new DuplicateResourceException("User email already exists: " + email);
		}

		User saved = userRepository.save(buildUserForSignup(request, email));

		if (saved.getRole() == UserRole.STUDENT) {
			ensureStudentProfile(saved);
		} else if (saved.getRole() == UserRole.TEACHER) {
			ensureInstructorProfile(saved);
		}

		return toUserResponse(saved);
	}

	public AuthResponse login(LoginRequest request) {
		String email = normalizeEmail(request.getEmail());
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

		validatePassword(request.getPassword(), user.getPasswordHash());

		AuthenticatedUser authenticatedUser = toAuthenticatedUser(user);
		String token = jwtService.generateToken(authenticatedUser);
		return new AuthResponse(token, toUserResponse(user));
	}

	public AuthResponse refreshToken(AuthenticatedUser currentUser) {
		User user = userRepository.findById(currentUser.getId())
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		AuthenticatedUser authenticatedUser = toAuthenticatedUser(user);
		String token = jwtService.generateToken(authenticatedUser);
		return new AuthResponse(token, toUserResponse(user));
	}

	public UserResponse me(AuthenticatedUser currentUser) {
		User user = userRepository.findById(currentUser.getId())
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		return toUserResponse(user);
	}

	private UserResponse toUserResponse(User user) {
		return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole());
	}

	private User buildUserForSignup(SignupRequest request, String email) {
		User user = new User();
		user.setFullName(request.getFullName().trim());
		user.setEmail(email);
		user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
		user.setRole(request.getRole());
		user.setCreatedAt(LocalDateTime.now());
		return user;
	}

	private AuthenticatedUser toAuthenticatedUser(User user) {
		return new AuthenticatedUser(
				user.getId(),
				user.getEmail(),
				user.getPasswordHash(),
				user.getFullName(),
				user.getRole()
		);
	}

	private void validatePassword(String rawPassword, String storedPasswordHash) {
		if (!passwordEncoder.matches(rawPassword, storedPasswordHash)) {
			throw new IllegalArgumentException("Invalid email or password");
		}
	}

	private String normalizeEmail(String email) {
		return email.trim().toLowerCase();
	}

	private void ensureStudentProfile(User user) {
		Student student = studentRepository.findByEmail(user.getEmail()).orElseGet(Student::new);
		student.setUserId(user.getId());
		student.setFullName(user.getFullName());
		student.setEmail(user.getEmail());
		if (student.getBatch() == null || student.getBatch().isBlank()) {
			student.setBatch("UNASSIGNED");
		}
		studentRepository.save(student);
	}

	private void ensureInstructorProfile(User user) {
		Instructor instructor = instructorRepository.findByEmail(user.getEmail()).orElseGet(Instructor::new);
		instructor.setUserId(user.getId());
		instructor.setFullName(user.getFullName());
		instructor.setEmail(user.getEmail());
		if (instructor.getSpecialization() == null || instructor.getSpecialization().isBlank()) {
			instructor.setSpecialization("General");
		}
		instructorRepository.save(instructor);
	}
}
