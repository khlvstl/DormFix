package com.vestil.dormfix.repository;

import com.vestil.dormfix.entity.Remark;
import com.vestil.dormfix.entity.MaintenanceRequest;
import com.vestil.dormfix.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RemarkRepository extends JpaRepository<Remark, Long> {
    List<Remark> findByMaintenanceRequest(MaintenanceRequest maintenanceRequest);
    List<Remark> findByStaff(User staff);
}
