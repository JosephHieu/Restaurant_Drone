use order_service;

/*
 * Script CREATE TABLE cho Order Service (order_service_db)
 */

-- 1. Bảng `orders` (Đơn hàng chính)
CREATE TABLE IF NOT EXISTS `orders` (
    `order_id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_id` INT NOT NULL,     -- ID khách hàng (Từ User Service)
    `restaurant_id` INT NOT NULL,   -- ID nhà hàng (Từ Restaurant Service)
    `total_price` DECIMAL(10, 2) NOT NULL,
    `delivery_address` TEXT NOT NULL,
    `status` VARCHAR(50) NOT NULL, -- Ví dụ: 'PENDING', 'CONFIRMED', 'DELIVERING', 'COMPLETED'
    `payment_method` VARCHAR(50) NOT NULL, -- 'COD' hoặc 'VNPay'
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng `order_items` (Chi tiết đơn hàng - Snapshot)
CREATE TABLE IF NOT EXISTS `order_items` (
    `order_item_id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `item_id` INT NOT NULL,          -- ID món ăn (Từ Restaurant Service)
    `name` VARCHAR(255) NOT NULL,    -- Snapshot Tên món
    `price` DECIMAL(10, 2) NOT NULL, -- Snapshot Giá
    `quantity` INT NOT NULL,
    `note` VARCHAR(255),
    
    -- Khóa ngoại nội bộ (từ item sang order)
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng `reviews` (Đánh giá)
CREATE TABLE IF NOT EXISTS `reviews` (
    `review_id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL UNIQUE, -- Mỗi đơn hàng chỉ có 1 review
    `rating` INT NOT NULL,          -- Xếp hạng từ 1 đến 5
    `comment` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Khóa ngoại nội bộ (từ review sang order)
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chèn dữ liệu cho Order Service

-- 1. Thêm 3 Đơn hàng (giả định customer_id 3, 4 là khách hàng thường)
INSERT INTO `orders` 
    (`customer_id`, `restaurant_id`, `total_price`, `delivery_address`, `status`, `payment_method`)
VALUES
    -- Đơn hàng 1: Khách 3 mua ở Quán 1 (Phở Hùng)
    (3, 1, 115000.00, '789 Đường Khách, Q.Tân Bình, TPHCM', 'COMPLETED', 'COD'), 
    
    -- Đơn hàng 2: Khách 4 mua ở Quán 5 (Hàn Xẻng)
    (4, 5, 205000.00, '101 Đường B, Q7, TPHCM', 'DELIVERING', 'VNPay'),  
    
    -- Đơn hàng 3: Chủ quán Park Jung Ku (ID 10) mua ở Quán 2 (Cơm Tấm Cali)
    (10, 2, 80000.00, 'Gò Vấp, TPHCM', 'PENDING', 'COD'); 
    
-- 2. Thêm Chi tiết đơn hàng (Order Items)
INSERT INTO `order_items` 
    (`order_id`, `item_id`, `name`, `price`, `quantity`, `note`)
VALUES
    -- Thuộc Order 1 (Item 1 + Item 11)
    (1, 1, 'Phở Tái Nạm Gầu', 65000.00, 1, NULL),     
    (1, 11, 'Chả Giò Chiên', 50000.00, 1, 'Thêm tương ớt'),      
    
    -- Thuộc Order 2 (Item 3 + Item 13)
    (2, 3, 'Cơm Sườn Bì Chả Đặc Biệt', 55000.00, 1, 'Không bì'), 
    (2, 13, 'Mực rim mắm me', 150000.00, 1, NULL),
    
    -- Thuộc Order 3 (Item 2)
    (3, 2, 'Cơm Gà Xối Mỡ', 80000.00, 1, 'Nước mắm nhiều'); 
    
-- 3. Thêm 2 Đánh giá (Reviews)
INSERT INTO `reviews` 
    (`order_id`, `rating`, `comment`)
VALUES
    (1, 5, 'Giao hàng nhanh và món ăn rất nóng!'), -- Đánh giá cho Order 1
    (2, 4, 'Đồ ăn ổn, chờ giao hàng.'); -- Đánh giá cho Order 2