package com.school.onlinelearning.dto.comment;

import com.school.onlinelearning.model.Comment;
import com.school.onlinelearning.model.UserRole;

import java.time.LocalDateTime;

public class CommentResponse {
    private String id;
    private String resourceId;
    private Comment.ResourceType resourceType;
    
    private String userId;
    private String authorName;
    private UserRole authorRole;
    
    private String text;
    private String parentCommentId;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CommentResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public Comment.ResourceType getResourceType() { return resourceType; }
    public void setResourceType(Comment.ResourceType resourceType) { this.resourceType = resourceType; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public UserRole getAuthorRole() { return authorRole; }
    public void setAuthorRole(UserRole authorRole) { this.authorRole = authorRole; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getParentCommentId() { return parentCommentId; }
    public void setParentCommentId(String parentCommentId) { this.parentCommentId = parentCommentId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
