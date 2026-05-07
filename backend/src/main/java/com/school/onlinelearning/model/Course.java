package com.school.onlinelearning.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "courses")
public class Course {

	@Id
	private String id;

	@NotBlank(message = "Title is required")
	private String title;

	@NotBlank(message = "Description is required")
	private String description;

        private String category; // Added for category management
        private String level;

        private double price;
	@NotBlank(message = "Instructor ID is required")
	private String instructorId;

	@Valid
	private List<Lesson> lessons;

	public Course() {
		this.lessons = new ArrayList<>();
	}

	public Course(String id, String title, String description, String level, double price, String instructorId, List<Lesson> lessons) {
		this.id = id;
		this.title = title;
		this.description = description;
		this.level = level;
		this.price = price;
		this.instructorId = instructorId;
		this.lessons = lessons != null ? lessons : new ArrayList<>();
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

        public String getCategory() {
                return category;
        }

        public void setCategory(String category) {
                this.category = category;
        }

        public String getLevel() {
		return level;
	}

	public void setLevel(String level) {
		this.level = level;
	}

	public double getPrice() {
		return price;
	}

	public void setPrice(double price) {
		this.price = price;
	}

	public String getInstructorId() {
		return instructorId;
	}

	public void setInstructorId(String instructorId) {
		this.instructorId = instructorId;
	}

	public List<Lesson> getLessons() {
		if (lessons == null) {
			lessons = new ArrayList<>();
		}
		return lessons;
	}

	public void setLessons(List<Lesson> lessons) {
		this.lessons = lessons != null ? lessons : new ArrayList<>();
	}
}
