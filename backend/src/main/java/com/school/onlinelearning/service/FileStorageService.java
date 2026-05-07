package com.school.onlinelearning.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    public FileStorageService() {
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Failed to store empty file.");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds the 50MB limit.");
        }

        String originalFilename = file.getOriginalFilename();
        String contentType = file.getContentType();
        
        if (originalFilename == null) {
            throw new IllegalArgumentException("File name is invalid.");
        }
        
        if (originalFilename.contains("..")) {
            throw new IllegalArgumentException("Filename contains invalid path sequence " + originalFilename);
        }

        // Validate MIME type (basic check against application/pdf)
        if (!"application/pdf".equals(contentType) || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed.");
        }

        try {
            String newFilename = UUID.randomUUID() + ".pdf";
            Path targetLocation = this.fileStorageLocation.resolve(newFilename).normalize();
            
            // Extra safety checking if path escapes base directory
            if (!targetLocation.startsWith(this.fileStorageLocation)) {
                throw new SecurityException("Cannot store file outside current directory.");
            }
            
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return newFilename;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFilename + ". Please try again!", ex);
        }
    }

    public Path loadFileAsResource(String filename) {
        try {
            Path filePath = this.fileStorageLocation.resolve(filename).normalize();
            if (!Files.exists(filePath)) {
                throw new RuntimeException("File not found " + filename);
            }
            return filePath;
        } catch (Exception ex) {
            throw new RuntimeException("File not found " + filename, ex);
        }
    }
}
