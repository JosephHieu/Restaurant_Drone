package com.josephhieu.restaurantservice.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "restaurants")
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer restaurantId;

    // Đây chỉ là một con số, không phải khóa ngoại
    private Integer ownerId;

    private String name;
    private String description;
    private String phone;
    private String address;

    @Column(precision = 10, scale = 8) // Cho phép độ chính xác cao
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8) // Longitude cần nhiều hơn 1 chữ số
    private BigDecimal longitude;
    private Double rating;
    private String status;
    @Column(name = "cover_image_uri")
    private String coverImageUri;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Một nhà hàng có nhiều món ăn
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MenuItem> menuItems;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}