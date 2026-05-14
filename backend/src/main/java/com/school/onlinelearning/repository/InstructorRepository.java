package com.school.onlinelearning.repository;

import com.school.onlinelearning.model.Instructor;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface InstructorRepository extends MongoRepository<Instructor, String> {
	boolean existsByEmail(String email);

	Optional<Instructor> findByEmail(String email);

	Optional<Instructor> findByUserId(String userId);
}
