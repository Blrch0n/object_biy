package com.school.onlinelearning.controller;

import com.school.onlinelearning.dto.comment.CommentRequest;
import com.school.onlinelearning.dto.comment.CommentResponse;
import com.school.onlinelearning.model.Comment;
import com.school.onlinelearning.model.User;
import com.school.onlinelearning.repository.UserRepository;
import com.school.onlinelearning.security.AuthenticatedUser;
import com.school.onlinelearning.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;
    private final UserRepository userRepository;

    public CommentController(CommentService commentService, UserRepository userRepository) {
        this.commentService = commentService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
            
        Comment comment = commentService.createComment(
                request.getResourceId(),
                request.getResourceType(),
                currentUser.getId(),
                request.getText(),
                request.getParentCommentId()
        );
        
        User author = userRepository.findById(currentUser.getId()).orElseThrow();
        
        return new ResponseEntity<>(mapToResponse(comment, author), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(
            @RequestParam String resourceId,
            @RequestParam Comment.ResourceType resourceType) {
            
        List<Comment> comments = commentService.getComments(resourceId, resourceType);
        
        // Fetch all authors in batch
        List<String> userIds = comments.stream().map(Comment::getUserId).distinct().collect(Collectors.toList());
        Map<String, User> userMap = ((List<User>)userRepository.findAllById(userIds))
            .stream()
            .collect(Collectors.toMap(User::getId, u -> u));
            
        List<CommentResponse> responses = comments.stream()
            .map(c -> mapToResponse(c, userMap.getOrDefault(c.getUserId(), new User())))
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String id,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
            
        commentService.deleteComment(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    private CommentResponse mapToResponse(Comment comment, User author) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setResourceId(comment.getResourceId());
        response.setResourceType(comment.getResourceType());
        response.setUserId(comment.getUserId());
        response.setAuthorName(author.getFullName());
        response.setAuthorRole(author.getRole());
        response.setText(comment.getText());
        response.setParentCommentId(comment.getParentCommentId());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());
        return response;
    }
}
