use user_service;

/*
 * Script SQL cho User Service
 * Bao gồm: roles, users, carts, cart_items
 */

-- 1. Bảng `roles`
CREATE TABLE IF NOT EXISTS `roles` (
    `roleId` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng `users`
CREATE TABLE IF NOT EXISTS `users` (
    `userId` INT AUTO_INCREMENT PRIMARY KEY,
    `fullName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `phone` VARCHAR(20) UNIQUE,
    `passwordHash` VARCHAR(255) NOT NULL,
    `address` TEXT,
    `status` VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'banned'
    `roleId` INT NOT NULL,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`roleId`) REFERENCES `roles`(`roleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng `carts`
CREATE TABLE IF NOT EXISTS `carts` (
    `cartId` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `restaurantId` INT, -- ID của nhà hàng mà giỏ hàng này đang mua
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`userId`) REFERENCES `users`(`userId`)
    -- Không đặt khóa ngoại cho restaurantId vì nó thuộc service khác
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng `cart_items`
CREATE TABLE IF NOT EXISTS `cart_items` (
    `cartItemId` INT AUTO_INCREMENT PRIMARY KEY,
    `cartId` INT NOT NULL,
    `itemId` INT NOT NULL, -- ID của món ăn (từ RestaurantService)
    `quantity` INT NOT NULL DEFAULT 1,
    `note` VARCHAR(255),
    `addedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`cartId`) REFERENCES `carts`(`cartId`) ON DELETE CASCADE,
    UNIQUE KEY `cart_item_pair` (`cartId`, `itemId`) -- Đảm bảo mỗi món chỉ có 1 dòng/giỏ
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `roles` (`name`)
VALUES
    ('USER'), 
    ('RESTAURANT_OWNER'),
    ('ADMIN'),
    ('SHIPPER'),  -- (Vai trò dự phòng)
    ('MANAGER')   -- (Vai trò dự phòng)
ON DUPLICATE KEY UPDATE `name`=`name`;

INSERT INTO `users` (`fullName`, `email`, `phone`, `passwordHash`, `address`, `status`, `roleId`)
VALUES
    ('Admin Quản Trị', 'admin@foodfast.com', '0900000001', '$2a$10$uMPoSos031uG5tbI3Cl.iuxBs3xID/kflRTQ.JeONo7dTyfUZNWyO', '123 Đường Admin, Q1, TPHCM', 'active', 3),
    ('Chủ Quán Phở', 'owner.pho@gmail.com', '0900000002', '$2a$10$uMPoSos031uG5tbI3Cl.iuxBs3xID/kflRTQ.JeONo7dTyfUZNWyO', '456 Đường Nhà Hàng, Q3, TPHCM', 'active', 2),
    ('Nguyễn Văn A', 'customer1@gmail.com', '0912345678', '$2a$10$uMPoSos031uG5tbI3Cl.iuxBs3xID/kflRTQ.JeONo7dTyfUZNWyO', '789 Đường Khách, Q.Tân Bình, TPHCM', 'active', 1),
    ('Trần Thị B', 'customer2@gmail.com', '0987654321', '$2a$10$uMPoSos031uG5tbI3Cl.iuxBs3xID/kflRTQ.JeONo7dTyfUZNWyO', '101 Đường B, Q7, TPHCM', 'active', 1),
    ('Lê Văn C', 'customer3@gmail.com', '0905558888', '$2a$10$uMPoSos031uG5tbI3Cl.iuxBs3xID/kflRTQ.JeONo7dTyfUZNWyO', '202 Đường C, Q.Gò Vấp, TPHCM', 'active', 1);
    
-- Giả sử 5 user bạn vừa tạo có userId từ 1 đến 5
INSERT INTO `carts` (`userId`, `restaurantId`)
VALUES
    (1, NULL), -- Giỏ của Admin (userId=1)
    (2, NULL), -- Giỏ của Chủ quán (userId=2)
    (3, 1),    -- Giỏ của Khách 1 (userId=3) - Giả sử đang mua ở quán (restaurantId) 1
    (4, 2),    -- Giỏ của Khách 2 (userId=4) - Giả sử đang mua ở quán (restaurantId) 2
    (5, 1);    -- Giỏ của Khách 3 (userId=5) - Giả sử đang mua ở quán (restaurantId) 1
    
-- Giả sử 5 giỏ hàng bạn vừa tạo có cartId từ 1 đến 5
INSERT INTO `cart_items` (`cartId`, `itemId`, `quantity`, `note`)
VALUES
    -- 2 món cho Khách 1 (cartId=3)
    (3, 101, 2, 'Ít cay, không hành'),
    (3, 102, 1, NULL),
    
    -- 1 món cho Khách 2 (cartId=4)
    (4, 201, 1, 'Thêm phô mai'),
    
    -- 2 món cho Khách 3 (cartId=5)
    (5, 101, 1, 'Nhiều sốt'),
    (5, 103, 3, 'Để riêng đá');