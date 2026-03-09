package com.vestil.dormfix.service;

import com.vestil.dormfix.entity.MaintenanceRequest;
import com.vestil.dormfix.entity.User;
import com.vestil.dormfix.repository.MaintenanceRequestRepository;
import com.vestil.dormfix.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MaintenanceRequestService {
    
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final UserRepository userRepository;
    
    public MaintenanceRequestService(MaintenanceRequestRepository maintenanceRequestRepository, 
                                    UserRepository userRepository) {
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.userRepository = userRepository;
    }
    
    public MaintenanceRequest createRequest(MaintenanceRequest request) {
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
        request.setStatus("OPEN");
        return maintenanceRequestRepository.save(request);
    }
    
    public MaintenanceRequest updateRequest(Long id, MaintenanceRequest requestDetails) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with id: " + id));
        
        request.setTitle(requestDetails.getTitle());
        request.setDescription(requestDetails.getDescription());
        request.setLocation(requestDetails.getLocation());
        request.setStatus(requestDetails.getStatus());
        request.setPriority(requestDetails.getPriority());
        request.setImageUrl(requestDetails.getImageUrl());
        request.setUpdatedAt(LocalDateTime.now());
        
        return maintenanceRequestRepository.save(request);
    }
    
    public MaintenanceRequest assignRequest(Long id, Long staffId) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with id: " + id));
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + staffId));
        
        request.setAssignedStaff(staff);
        request.setUpdatedAt(LocalDateTime.now());
        return maintenanceRequestRepository.save(request);
    }
    
    public MaintenanceRequest completeRequest(Long id) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with id: " + id));
        
        request.setStatus("COMPLETED");
        request.setCompletedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
        return maintenanceRequestRepository.save(request);
    }
    
    public Optional<MaintenanceRequest> getRequestById(Long id) {
        return maintenanceRequestRepository.findById(id);
    }
    
    public List<MaintenanceRequest> getRequestsByResident(Long residentId) {
        User resident = userRepository.findById(residentId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + residentId));
        return maintenanceRequestRepository.findByResident(resident);
    }
    
    public List<MaintenanceRequest> getRequestsByAssignedStaff(Long staffId) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + staffId));
        return maintenanceRequestRepository.findByAssignedStaff(staff);
    }
    
    public List<MaintenanceRequest> getRequestsByStatus(String status) {
        return maintenanceRequestRepository.findByStatus(status);
    }
    
    public List<MaintenanceRequest> getRequestsByPriority(String priority) {
        return maintenanceRequestRepository.findByPriority(priority);
    }
    
    public List<MaintenanceRequest> getAllRequests() {
        return maintenanceRequestRepository.findAll();
    }
    
    public void deleteRequest(Long id) {
        maintenanceRequestRepository.deleteById(id);
    }
}
