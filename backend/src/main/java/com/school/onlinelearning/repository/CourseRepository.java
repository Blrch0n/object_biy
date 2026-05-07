package com.school.onlinelearning.repository;

import com.school.onlinelearning.model.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CourseRepository extends MongoRepository<Course, String> {

    Page<Course> findByLevelIgnoreCase(String level, Pageable pageable);

    Page<Course> findByTitleContainingIgnoreCaseOrCategoryContainingIgnoreCase(
            String title,
            String category,
            Pageable pageable
    );
}