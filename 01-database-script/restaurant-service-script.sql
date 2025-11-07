use restaurant_service;

-- 1. Bảng `restaurants`
CREATE TABLE IF NOT EXISTS `restaurants` (
    `restaurant_id` INT AUTO_INCREMENT PRIMARY KEY,
    `owner_id` INT NOT NULL, -- Chỉ lưu ID, không có khóa ngoại
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `phone` VARCHAR(20),
    `address` TEXT NOT NULL,
    `rating` DECIMAL(3, 2) DEFAULT 0.00,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng `menu_items` (Thực đơn)
CREATE TABLE IF NOT EXISTS `menu_items` (
    `item_id` INT AUTO_INCREMENT PRIMARY KEY,
    `restaurant_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(10, 2) NOT NULL,
    `image_uri` VARCHAR(512),
    `is_available` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Khóa ngoại NỘI BỘ (từ menu_items sang restaurants)
    -- Điều này là HỢP LỆ vì chúng cùng 1 database
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`restaurant_id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 1. Thêm 3 Nhà hàng (liên kết với owner_id)
INSERT INTO `restaurants` 
    (`owner_id`, `name`, `description`, `phone`, `address`, `status`)
VALUES
    -- Nhà hàng này thuộc về user_id = 2 ("Chủ Quán Phở")
    (2, 'Phở Hùng Pasteur', 'Chuỗi phở bò gia truyền nổi tiếng Sài Gòn.', '02838244586', '260 Pasteur, Phường 8, Quận 3, TPHCM', 'open'),
    
    -- Nhà hàng này cũng thuộc về user_id = 2 ("Chủ Quán Phở")
    (2, 'Cơm Tấm Cali', 'Cơm tấm sườn bì chả ngon nhất khu vực.', '02839300000', '456 Lê Văn Sỹ, Phường 14, Quận 3, TPHCM', 'open'),
    
    -- Nhà hàng này thuộc về user_id = 1 ("Admin")
    (1, 'Trà Sữa Ocha House (Admin)', 'Trà sữa do admin quản lý (chờ duyệt).', '0901112222', '101 Nguyễn Huệ, Quận 1, TPHCM', 'pending');

-- 2. Thêm 3 Món ăn (liên kết với nhà hàng)
-- (Giả sử 3 nhà hàng vừa tạo có restaurant_id là 1, 2, 3)
INSERT INTO `menu_items` 
    (`restaurant_id`, `name`, `description`, `price`, `is_available`)
VALUES
    -- Món này thuộc nhà hàng "Phở Hùng" (restaurant_id = 1)
    (1, 'Phở Tái Nạm Gầu', 'Thịt bò tươi ngon, nước lèo đậm đà.', 65000.00, true),
    
    -- Món này cũng thuộc nhà hàng "Phở Hùng" (restaurant_id = 1)
    (1, 'Chén Trứng Trần', 'Trứng gà ta trần lòng đào.', 8000.00, true),
    
    -- Món này thuộc nhà hàng "Cơm Tấm Cali" (restaurant_id = 2)
    (2, 'Cơm Sườn Bì Chả Đặc Biệt', 'Sườn cốt lết ướp đậm vị, bì, chả hấp.', 55000.00, true);