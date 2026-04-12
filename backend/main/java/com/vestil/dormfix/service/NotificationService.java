package com.vestil.dormfix.service;

import com.vestil.dormfix.entity.Notification;
import com.vestil.dormfix.entity.User;
import com.vestil.dormfix.entity.MaintenanceRequest;
import com.vestil.dormfix.repository.NotificationRepository;
import com.vestil.dormfix.repository.UserRepository;
import com.vestil.dormfix.repository.MaintenanceRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    
    public NotificationService(NotificationRepository notificationRepository,
                              UserRepository userRepository,
                              MaintenanceRequestRepository maintenanceRequestRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
    }
    
    public Notification createNotification(Long userId, Long requestId, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        MaintenanceRequest request = maintenanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with id: " + requestId));
        
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMaintenanceRequest(request);
        notification.setMessage(message);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        return notificationRepository.save(notification);
    }
    
    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }
    
    public List<Notification> getNotificationsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        return notificationRepository.findByUser(user);
    }
    
    public List<Notification> getUnreadNotificationsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        return notificationRepository.findByUserAndIsReadFalse(user);
    }
    
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with id: " + id));
        
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }
    
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }
    
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
}
