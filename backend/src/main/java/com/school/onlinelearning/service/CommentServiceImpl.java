package com.school.onlinelearning.service;

import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Comment;
import com.school.onlinelearning.model.Notification;
import com.school.onlinelearning.model.User;
import com.school.onlinelearning.repository.CommentRepository;
import com.school.onlinelearning.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public CommentServiceImpl(CommentRepository commentRepository,
                               UserRepository userRepository,
                               NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    public Comment createComment(String resourceId, Comment.ResourceType resourceType,
                                  String userId, String text, String parentCommentId) {
        if (parentCommentId != null) {
            if (!commentRepository.existsById(parentCommentId)) {
                throw new ResourceNotFoundException("Parent comment not found");
            }
        }

        Comment comment = new Comment();
        comment.setResourceId(resourceId);
        comment.setResourceType(resourceType);
        comment.setUserId(userId);
        comment.setText(text);
        comment.setParentCommentId(parentCommentId);

        Comment saved = commentRepository.save(comment);

        // If this is a reply, notify the parent comment author
        if (parentCommentId != null) {
            commentRepository.findById(parentCommentId).ifPresent(parent -> {
                if (!parent.getUserId().equals(userId)) {
                    User author = userRepository.findById(userId).orElse(null);
                    String authorName = author != null ? author.getFullName() : "Хэрэглэгч";
                    notificationService.createNotification(
                            parent.getUserId(),
                            "Хариулт ирлээ",
                            authorName + " таны сэтгэгдэлд хариулт үлдээлээ.",
                            Notification.NotificationType.COMMENT,
                            "/courses/" + resourceId
                    );
                }
            });
        }

        return saved;
    }

    @Override
    public List<Comment> getComments(String resourceId, Comment.ResourceType resourceType) {
        return commentRepository.findByResourceIdAndResourceTypeOrderByCreatedAtAsc(resourceId, resourceType);
    }

    @Override
    public void deleteComment(String commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Only author or ADMIN/TEACHER can delete
        if (!comment.getUserId().equals(userId)
                && user.getRole() != com.school.onlinelearning.model.UserRole.TEACHER
                && user.getRole() != com.school.onlinelearning.model.UserRole.ADMIN) {
            throw new IllegalArgumentException("Not authorized to delete this comment");
        }

        deleteCommentAndReplies(commentId);
    }

    private void deleteCommentAndReplies(String commentId) {
        List<Comment> replies = commentRepository.findByParentCommentId(commentId);
        for (Comment reply : replies) {
            deleteCommentAndReplies(reply.getId());
        }
        commentRepository.deleteById(commentId);
    }
}
