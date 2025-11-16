package com.josephhieu.droneservice.service;

import com.josephhieu.droneservice.dto.request.CreateDroneRequest;
import com.josephhieu.droneservice.dto.response.DroneStatsDto;
import com.josephhieu.droneservice.entity.Drone;
import com.josephhieu.droneservice.repository.DroneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DroneService {

    @Autowired
    private DroneRepository droneRepository;

    /**
     * Lấy tất cả drone, có thể lọc theo trạng thái
     */
    public List<Drone> getAllDrones(String status) {
        if (status != null && !status.isEmpty()) {
            return droneRepository.findAllByStatus(status);
        }
        return droneRepository.findAll();
    }

    /**
     * Lấy thông tin chi tiết 1 drone
     */
    public Drone getDroneById(Integer droneId) {
        return droneRepository.findById(droneId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy drone với ID: " + droneId));
    }

    /**
     * Đăng ký (tạo) một drone mới
     */
    @Transactional
    public Drone createDrone(CreateDroneRequest request) {
        Drone drone = new Drone();
        drone.setModel(request.getModel());
        drone.setBatteryLevel(request.getBatteryLevel());
        drone.setStatus("IDLE"); // Mặc định khi tạo mới là rảnh rỗi
        // currentLat và currentLng sẽ là null (hoặc vị trí trạm mặc định)
        drone.setCurrentLat(new BigDecimal("0.0"));
        drone.setCurrentLng(new BigDecimal("0.0"));
        return droneRepository.save(drone);
    }

    /**
     * Cập nhật trạng thái drone (ví dụ: cho đi bảo trì)
     */
    @Transactional
    public Drone updateDroneStatus(Integer droneId, String newStatus) {
        Drone drone = getDroneById(droneId);

        // Logic quan trọng: Không cho phép đổi status nếu drone đang giao hàng
        if (drone.getStatus().equals("DELIVERING")) {
            throw new IllegalStateException("Không thể thay đổi trạng thái khi drone đang giao hàng.");
        }

        // Các trạng thái hợp lệ (IDLE, MAINTENANCE, CHARGING...)
        drone.setStatus(newStatus);
        return droneRepository.save(drone);
    }

    /**
     * Xóa một drone (khi thanh lý)
     */
    @Transactional
    public void deleteDrone(Integer droneId) {
        Drone drone = getDroneById(droneId);
        if (drone.getStatus().equals("DELIVERING")) {
            throw new IllegalStateException("Không thể xóa drone khi đang giao hàng.");
        }
        droneRepository.delete(drone);
    }

    public DroneStatsDto getDroneStats() {
        long total = droneRepository.count();
        long idle = droneRepository.countByStatus("IDLE");
        long delivering = droneRepository.countByStatus("DELIVERING");

        return new DroneStatsDto(total, idle, delivering);
    }
}