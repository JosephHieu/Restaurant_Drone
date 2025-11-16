package com.josephhieu.droneservice.controller;

import com.josephhieu.droneservice.dto.request.CreateDroneRequest;
import com.josephhieu.droneservice.dto.request.UpdateStatusRequest;
import com.josephhieu.droneservice.dto.response.DroneStatsDto;
import com.josephhieu.droneservice.entity.Drone;
import com.josephhieu.droneservice.service.DroneService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controller này dùng cho Admin/Nhà hàng quản lý đội drone
 */
@RestController
@RequestMapping("/api/drones")
public class DroneController {

    @Autowired
    private DroneService droneService;

    /**
     * API đăng ký drone mới vào hệ thống
     * [POST] /api/drones
     */
    @PostMapping
    public ResponseEntity<Drone> createDrone(@Valid @RequestBody CreateDroneRequest request) {
        Drone newDrone = droneService.createDrone(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(newDrone);
    }

    /**
     * API lấy danh sách tất cả drone (có thể lọc theo trạng thái)
     * [GET] /api/drones
     * [GET] /api/drones?status=IDLE
     */
    @GetMapping
    public ResponseEntity<List<Drone>> getAllDrones(@RequestParam(required = false) String status) {
        List<Drone> drones = droneService.getAllDrones(status);
        return ResponseEntity.ok(drones);
    }

    /**
     * API lấy thông tin chi tiết 1 drone
     * [GET] /api/drones/1
     */
    @GetMapping("/{droneId}")
    public ResponseEntity<Drone> getDroneById(@PathVariable Integer droneId) {
        Drone drone = droneService.getDroneById(droneId);
        return ResponseEntity.ok(drone);
    }

    /**
     * API cập nhật trạng thái (ví dụ: bảo trì)
     * [PUT] /api/drones/1/status
     */
    @PutMapping("/{droneId}/status")
    public ResponseEntity<Drone> updateDroneStatus(@PathVariable Integer droneId,
                                                   @Valid @RequestBody UpdateStatusRequest request) {
        Drone updatedDrone = droneService.updateDroneStatus(droneId, request.getStatus());
        return ResponseEntity.ok(updatedDrone);
    }

    /**
     * API Xóa drone (khi thanh lý)
     * [DELETE] /api/drones/1
     */
    @DeleteMapping("/{droneId}")
    public ResponseEntity<Void> deleteDrone(@PathVariable Integer droneId) {
        droneService.deleteDrone(droneId);
        return ResponseEntity.noContent().build(); // Trả về 204 No Content
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<DroneStatsDto> getDroneStats() {
        return ResponseEntity.ok(droneService.getDroneStats());
    }
}