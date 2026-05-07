package com.school.onlinelearning.service;

import com.school.onlinelearning.dto.request.InstructorRequestDTO;
import com.school.onlinelearning.dto.response.InstructorResponseDTO;
import com.school.onlinelearning.dto.response.PageResponseDTO;
import com.school.onlinelearning.exception.DuplicateResourceException;
import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Instructor;
import com.school.onlinelearning.repository.InstructorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.school.onlinelearning.model.User;
import com.school.onlinelearning.model.UserRole;
import com.school.onlinelearning.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;

@Service
public class InstructorServiceImpl implements InstructorService {

    private final InstructorRepository instructorRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public InstructorServiceImpl(InstructorRepository instructorRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.instructorRepository = instructorRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public PageResponseDTO<InstructorResponseDTO> getAllInstructors(Pageable pageable) {
        Page<Instructor> page = instructorRepository.findAll(pageable);
        return PageResponseDTO.of(page.map(InstructorResponseDTO::fromEntity));
    }

    @Override
    public InstructorResponseDTO getInstructorById(String id) {
        return InstructorResponseDTO.fromEntity(getInstructorEntityById(id));
    }

    @Override
    public InstructorResponseDTO createInstructor(InstructorRequestDTO payload) {
        if (instructorRepository.existsByEmail(payload.email())) {
            throw new DuplicateResourceException("Instructor email already exists: " + payload.email());
        }

        User user = new User();
        user.setFullName(payload.fullName());
        user.setEmail(payload.email());
        String pwd = payload.password() != null && !payload.password().isBlank() ? payload.password() : "default123";
        user.setPasswordHash(passwordEncoder.encode(pwd));
        user.setRole(UserRole.TEACHER);
        user.setCreatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        Instructor instructor = new Instructor();
        instructor.setUserId(user.getId());
        instructor.setFullName(payload.fullName());
        instructor.setEmail(payload.email());
        instructor.setSpecialization(payload.specialization());
        return InstructorResponseDTO.fromEntity(instructorRepository.save(instructor));
    }

    @Override
    public InstructorResponseDTO updateInstructor(String id, InstructorRequestDTO payload) {
        Instructor existing = getInstructorEntityById(id);

        if (!existing.getEmail().equalsIgnoreCase(payload.email())
                && instructorRepository.existsByEmail(payload.email())) {
            throw new DuplicateResourceException("Instructor email already exists: " + payload.email());
        }

        userRepository.findByEmail(existing.getEmail()).ifPresent(user -> {
            user.setFullName(payload.fullName());
            user.setEmail(payload.email());
            if (payload.password() != null && !payload.password().isBlank()) {
                user.setPasswordHash(passwordEncoder.encode(payload.password()));
            }
            userRepository.save(user);
        });

        existing.setFullName(payload.fullName());
        existing.setEmail(payload.email());
        existing.setSpecialization(payload.specialization());
        return InstructorResponseDTO.fromEntity(instructorRepository.save(existing));
    }

    @Override
    public void deleteInstructor(String id) {
        Instructor existing = getInstructorEntityById(id);
        userRepository.findByEmail(existing.getEmail()).ifPresent(userRepository::delete);
        instructorRepository.delete(existing);
    }
    
    private Instructor getInstructorEntityById(String id) {
        return instructorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found: " + id));
    }
}
