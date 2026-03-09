package com.vestil.dormfix.repository;

import com.vestil.dormfix.entity.MaintenanceRequest;
import com.vestil.dormfix.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByResident(User resident);
    List<MaintenanceRequest> findByAssignedStaff(User assignedStaff);
    List<MaintenanceRequest> findByStatus(String status);
    List<MaintenanceRequest> findByPriority(String priority);
}
