/*
 * Script CREATE TABLE cho Drone Service (drone_service_db)
 */
USE drone_service;

-- 1. Bảng `drones` (Quản lý đội bay)
CREATE TABLE IF NOT EXISTS `drones` (
    `drone_id` INT AUTO_INCREMENT PRIMARY KEY,
    `model` VARCHAR(100) NOT NULL,
    `status` VARCHAR(50) NOT NULL, -- 'IDLE', 'DELIVERING', 'CHARGING', 'MAINTENANCE'
    `battery_level` INT NOT NULL,  -- Pin (ví dụ: 95 %)
    
    -- Vị trí GPS hiện tại (cập nhật theo thời gian thực)
    `current_lat` DECIMAL(10, 8) NOT NULL, 
    `current_lng` DECIMAL(11, 8) NOT NULL,
    
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng `deliveries` (Nhiệm vụ giao hàng)
CREATE TABLE IF NOT EXISTS `deliveries` (
    `delivery_id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL UNIQUE, -- ID đơn hàng (Từ Order Service)
    `drone_id` INT NOT NULL,        -- ID drone được gán
    
    -- Tọa độ điểm lấy (Nhà hàng)
    `start_lat` DECIMAL(10, 8) NOT NULL,
    `start_lng` DECIMAL(11, 8) NOT NULL,
    
    -- Tọa độ điểm giao (Khách hàng)
    `end_lat` DECIMAL(10, 8) NOT NULL,
    `end_lng` DECIMAL(11, 8) NOT NULL,
    
    `status` VARCHAR(50) NOT NULL, -- 'ASSIGNED', 'PICKING_UP', 'DELIVERING', 'COMPLETED'
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `completed_at` DATETIME NULL,
    
    FOREIGN KEY (`drone_id`) REFERENCES `drones`(`drone_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;