package com.school.onlinelearning.dto.comment;

import com.school.onlinelearning.model.Comment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CommentRequest {
    @NotBlank
    private String resourceId;
    
    @NotNull
    private Comment.ResourceType resourceType;
    
    @NotBlank
    private String text;
    
    private String parentCommentId;

    public CommentRequest() {}

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public Comment.ResourceType getResourceType() { return resourceType; }
    public void setResourceType(Comment.ResourceType resourceType) { this.resourceType = resourceType; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getParentCommentId() { return parentCommentId; }
    public void setParentCommentId(String parentCommentId) { this.parentCommentId = parentCommentId; }
}
