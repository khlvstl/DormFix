package com.vestil.dormfix.repository;

import com.vestil.dormfix.entity.Comment;
import com.vestil.dormfix.entity.MaintenanceRequest;
import com.vestil.dormfix.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByMaintenanceRequest(MaintenanceRequest maintenanceRequest);
    List<Comment> findByUser(User user);
}
