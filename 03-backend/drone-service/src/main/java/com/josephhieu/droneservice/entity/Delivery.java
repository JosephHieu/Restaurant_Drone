package com.josephhieu.droneservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity (Thực thể) đại diện cho một chuyến giao hàng.
 * Ánh xạ với bảng 'deliveries'.
 */
@Data
@Entity
@Table(name = "deliveries")
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer deliveryId;

    // Đây chỉ là một ID (từ OrderService), không phải quan hệ (relation)
    // vì Order nằm ở CSDL khác.
    @Column(unique = true) // Đảm bảo mỗi đơn hàng chỉ được giao 1 lần
    private Integer orderId;

    // Quan hệ nội bộ (với bảng 'drones' trong cùng CSDL này)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drone_id")
    @JsonIgnore // Tránh lặp vô hạn khi serialize JSON
    private Drone drone;

    @Column(name = "start_lat")
    private BigDecimal startLat;

    @Column(name = "start_lng")
    private BigDecimal startLng;

    @Column(name = "end_lat")
    private BigDecimal endLat;

    @Column(name = "end_lng")
    private BigDecimal endLng;

    // Trạng thái chuyến giao (ví dụ: 'ASSIGNED', 'PICKING_UP', 'DELIVERING', 'COMPLETED')
    private String status;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}