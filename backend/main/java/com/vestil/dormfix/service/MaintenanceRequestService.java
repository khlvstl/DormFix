package com.vestil.dormfix.service;

import com.vestil.dormfix.entity.MaintenanceRequest;
import com.vestil.dormfix.entity.Remark;
import com.vestil.dormfix.entity.User;
import com.vestil.dormfix.repository.MaintenanceRequestRepository;
import com.vestil.dormfix.repository.RemarkRepository;
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
    private final RemarkRepository remarkRepository;
    
    public MaintenanceRequestService(MaintenanceRequestRepository maintenanceRequestRepository, 
                                    UserRepository userRepository,
                                    RemarkRepository remarkRepository) {
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.userRepository = userRepository;
        this.remarkRepository = remarkRepository;
    }
    
    // Helper method to normalize status from OPEN to PENDING
    private MaintenanceRequest normalizeStatus(MaintenanceRequest request) {
        if (request != null && "OPEN".equalsIgnoreCase(request.getStatus())) {
            request.setStatus("PENDING");
        }
        return request;
    }
    
    // Helper method to normalize status in a list
    private List<MaintenanceRequest> normalizeStatusList(List<MaintenanceRequest> requests) {
        if (requests != null) {
            requests.forEach(this::normalizeStatus);
        }
        return requests;
    }
    
    public MaintenanceRequest createRequest(MaintenanceRequest request) {
        // Validate and load the resident user
        if (request.getResident() == null || request.getResident().getId() == null) {
            throw new IllegalArgumentException("Resident user is required");
        }
        
        User resident = userRepository.findById(request.getResident().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + request.getResident().getId()));
        
        request.setResident(resident);
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
        if (request.getStatus() == null) {
            request.setStatus("PENDING");
        }
        return normalizeStatus(maintenanceRequestRepository.save(request));
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
        
        return normalizeStatus(maintenanceRequestRepository.save(request));
    }
    
    public MaintenanceRequest assignRequest(Long id, Long staffId) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with id: " + id));
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + staffId));
        
        request.setAssignedStaff(staff);
        request.setUpdatedAt(LocalDateTime.now());
        return normalizeStatus(maintenanceRequestRepository.save(request));
    }
    
    public MaintenanceRequest completeRequest(Long id) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with id: " + id));
        
        request.setStatus("COMPLETED");
        request.setCompletedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
        return normalizeStatus(maintenanceRequestRepository.save(request));
    }
    
    public Optional<MaintenanceRequest> getRequestById(Long id) {
        return maintenanceRequestRepository.findById(id).map(this::normalizeStatus);
    }
    
    public List<MaintenanceRequest> getRequestsByResident(Long residentId) {
        User resident = userRepository.findById(residentId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + residentId));
        return normalizeStatusList(maintenanceRequestRepository.findByResident(resident));
    }
    
    public List<MaintenanceRequest> getRequestsByAssignedStaff(Long staffId) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + staffId));
        return normalizeStatusList(maintenanceRequestRepository.findByAssignedStaff(staff));
    }
    
    public List<MaintenanceRequest> getRequestsByStatus(String status) {
        return normalizeStatusList(maintenanceRequestRepository.findByStatus(status));
    }
    
    public List<MaintenanceRequest> getRequestsByPriority(String priority) {
        return maintenanceRequestRepository.findByPriority(priority);
    }
    
    public List<MaintenanceRequest> getAllRequests() {
        return normalizeStatusList(maintenanceRequestRepository.findAll());
    }
    
    public void deleteRequest(Long id) {
        maintenanceRequestRepository.deleteById(id);
    }
    
    public Remark addRemark(Long requestId, Long staffId, String content) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with id: " + requestId));
        
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found with id: " + staffId));
        
        Remark remark = new Remark();
        remark.setMaintenanceRequest(request);
        remark.setStaff(staff);
        remark.setContent(content);
        
        return remarkRepository.save(remark);
    }
    
    public List<Remark> getRemarksByRequest(Long requestId) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with id: " + requestId));
        return remarkRepository.findByMaintenanceRequest(request);
    }
}
