package com.vestil.dormfix.controller;

import com.vestil.dormfix.entity.MaintenanceRequest;
import com.vestil.dormfix.entity.Remark;
import com.vestil.dormfix.service.MaintenanceRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/maintenance-requests")
@CrossOrigin(origins = "*")
@Transactional
public class MaintenanceRequestController {
    
    private final MaintenanceRequestService maintenanceRequestService;
    
    public MaintenanceRequestController(MaintenanceRequestService maintenanceRequestService) {
        this.maintenanceRequestService = maintenanceRequestService;
    }
    
    @PostMapping
    public ResponseEntity<MaintenanceRequest> createRequest(@RequestBody MaintenanceRequest request) {
        MaintenanceRequest createdRequest = maintenanceRequestService.createRequest(request);
        return new ResponseEntity<>(createdRequest, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceRequest> getRequestById(@PathVariable Long id) {
        Optional<MaintenanceRequest> request = maintenanceRequestService.getRequestById(id);
        return request.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping
    public ResponseEntity<List<MaintenanceRequest>> getAllRequests() {
        List<MaintenanceRequest> requests = maintenanceRequestService.getAllRequests();
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/resident/{residentId}")
    public ResponseEntity<List<MaintenanceRequest>> getRequestsByResident(@PathVariable Long residentId) {
        try {
            List<MaintenanceRequest> requests = maintenanceRequestService.getRequestsByResident(residentId);
            return ResponseEntity.ok(requests);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<MaintenanceRequest>> getRequestsByAssignedStaff(@PathVariable Long staffId) {
        try {
            List<MaintenanceRequest> requests = maintenanceRequestService.getRequestsByAssignedStaff(staffId);
            return ResponseEntity.ok(requests);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<MaintenanceRequest>> getRequestsByStatus(@PathVariable String status) {
        List<MaintenanceRequest> requests = maintenanceRequestService.getRequestsByStatus(status);
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<MaintenanceRequest>> getRequestsByPriority(@PathVariable String priority) {
        List<MaintenanceRequest> requests = maintenanceRequestService.getRequestsByPriority(priority);
        return ResponseEntity.ok(requests);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceRequest> updateRequest(@PathVariable Long id, 
                                                           @RequestBody MaintenanceRequest requestDetails) {
        try {
            MaintenanceRequest updatedRequest = maintenanceRequestService.updateRequest(id, requestDetails);
            return ResponseEntity.ok(updatedRequest);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/assign/{staffId}")
    public ResponseEntity<MaintenanceRequest> assignRequest(@PathVariable Long id, @PathVariable Long staffId) {
        try {
            MaintenanceRequest assignedRequest = maintenanceRequestService.assignRequest(id, staffId);
            return ResponseEntity.ok(assignedRequest);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/complete")
    public ResponseEntity<MaintenanceRequest> completeRequest(@PathVariable Long id) {
        try {
            MaintenanceRequest completedRequest = maintenanceRequestService.completeRequest(id);
            return ResponseEntity.ok(completedRequest);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        maintenanceRequestService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{requestId}/remarks")
    public ResponseEntity<Remark> addRemark(@PathVariable Long requestId, 
                                           @RequestParam Long staffId, 
                                           @RequestBody RemarkRequest remarkRequest) {
        Remark remark = maintenanceRequestService.addRemark(requestId, staffId, remarkRequest.getContent());
        return new ResponseEntity<>(remark, HttpStatus.CREATED);
    }
    
    @GetMapping("/{requestId}/remarks")
    public ResponseEntity<List<Remark>> getRemarks(@PathVariable Long requestId) {
        List<Remark> remarks = maintenanceRequestService.getRemarksByRequest(requestId);
        return ResponseEntity.ok(remarks);
    }
    
    // Simple DTO for remark requests
    public static class RemarkRequest {
        private String content;
        
        public String getContent() {
            return content;
        }
        
        public void setContent(String content) {
            this.content = content;
        }
    }
}
