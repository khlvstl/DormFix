package com.vestil.dormfix.service;

import com.vestil.dormfix.entity.Comment;
import com.vestil.dormfix.entity.MaintenanceRequest;
import com.vestil.dormfix.entity.User;
import com.vestil.dormfix.repository.CommentRepository;
import com.vestil.dormfix.repository.MaintenanceRequestRepository;
import com.vestil.dormfix.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CommentService {
    
    private final CommentRepository commentRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final UserRepository userRepository;
    
    public CommentService(CommentRepository commentRepository, 
                         MaintenanceRequestRepository maintenanceRequestRepository,
                         UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.userRepository = userRepository;
    }
    
    public Comment createComment(Long requestId, Long userId, String content) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with id: " + requestId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        
        Comment comment = new Comment();
        comment.setMaintenanceRequest(request);
        comment.setUser(user);
        comment.setContent(content);
        comment.setCreatedAt(LocalDateTime.now());
        
        return commentRepository.save(comment);
    }
    
    public Optional<Comment> getCommentById(Long id) {
        return commentRepository.findById(id);
    }
    
    public List<Comment> getCommentsByRequest(Long requestId) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with id: " + requestId));
        return commentRepository.findByMaintenanceRequest(request);
    }
    
    public List<Comment> getCommentsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        return commentRepository.findByUser(user);
    }
    
    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }
    
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }
}
