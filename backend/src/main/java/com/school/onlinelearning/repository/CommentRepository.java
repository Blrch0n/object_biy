package com.school.onlinelearning.repository;

import com.school.onlinelearning.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByResourceIdAndResourceTypeOrderByCreatedAtAsc(String resourceId, Comment.ResourceType resourceType);
    List<Comment> findByParentCommentId(String parentCommentId);
    void deleteByResourceId(String resourceId);
}
