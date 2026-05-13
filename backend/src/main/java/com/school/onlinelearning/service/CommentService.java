package com.school.onlinelearning.service;

import com.school.onlinelearning.model.Comment;
import java.util.List;

public interface CommentService {
    Comment createComment(String resourceId, Comment.ResourceType resourceType, String userId, String text, String parentCommentId);
    List<Comment> getComments(String resourceId, Comment.ResourceType resourceType);
    void deleteComment(String commentId, String userId);
}
