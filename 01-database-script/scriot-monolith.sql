use quanlyquanan;

-- 1. Bảng `roles` (Sở hữu bởi UserService)
CREATE TABLE IF NOT EXISTS `roles` (
    `roleId` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng `users` (Sở hữu bởi UserService)
CREATE TABLE IF NOT EXISTS `users` (
    `userId` INT AUTO_INCREMENT PRIMARY KEY,
    `fullName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `phone` VARCHAR(20) UNIQUE,
    `passwordHash` VARCHAR(255) NOT NULL,
    `address` TEXT,
    `status` VARCHAR(50) NOT NULL DEFAULT 'active', -- ví dụ: 'active', 'inactive', 'banned'
    `roleId` INT NOT NULL,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`roleId`) REFERENCES `roles`(`roleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng `restaurants` (Sở hữu bởi RestaurantService)
CREATE TABLE IF NOT EXISTS `restaurants` (
    `restaurantId` INT AUTO_INCREMENT PRIMARY KEY,
    `ownerId` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `phone` VARCHAR(20),
    `address` TEXT NOT NULL,
    `rating` DECIMAL(3, 2) DEFAULT 0.00, -- Ví dụ: 4.50
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'open', 'closed', 'banned'
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`ownerId`) REFERENCES `users`(`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng `menu_items` (Sở hữu bởi RestaurantService)
CREATE TABLE IF NOT EXISTS `menu_items` (
    `itemId` INT AUTO_INCREMENT PRIMARY KEY,
    `restaurantId` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(10, 2) NOT NULL,
    `imageUri` VARCHAR(512),
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`restaurantId`) ON DELETE CASCADE -- Xóa menu khi nhà hàng bị xóa
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng `carts` (Sở hữu bởi UserService)
CREATE TABLE IF NOT EXISTS `carts` (
    `cartId` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `restaurantId` INT, -- Cho biết giỏ hàng này đang mua ở quán nào
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`userId`) REFERENCES `users`(`userId`),
    FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`restaurantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng `cart_items` (Mối quan hệ N-N giữa `carts` và `menu_items`)
-- Đây là bảng thay thế cho "Embedded Document" `cartItems`
CREATE TABLE IF NOT EXISTS `cart_items` (
    `cartItemId` INT AUTO_INCREMENT PRIMARY KEY,
    `cartId` INT NOT NULL,
    `itemId` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `note` VARCHAR(255),
    `addedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`cartId`) REFERENCES `carts`(`cartId`) ON DELETE CASCADE,
    FOREIGN KEY (`itemId`) REFERENCES `menu_items`(`itemId`),
    UNIQUE KEY `cart_item_pair` (`cartId`, `itemId`) -- Đảm bảo mỗi món chỉ có 1 dòng trong giỏ hàng
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bảng `orders` (Sở hữu bởi OrderService)
CREATE TABLE IF NOT EXISTS `orders` (
    `orderId` INT AUTO_INCREMENT PRIMARY KEY,
    `customerId` INT NOT NULL,
    `restaurantId` INT NOT NULL,
    `totalPrice` DECIMAL(10, 2) NOT NULL,
    `deliveryAddress` TEXT NOT NULL, -- "Snapshot" địa chỉ tại thời điểm đặt
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'cooking', 'delivering', 'completed', 'cancelled'
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`customerId`) REFERENCES `users`(`userId`),
    FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`restaurantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bảng `order_items` (Chi tiết đơn hàng)
-- Đây là bảng thay thế cho "Embedded Document" `orderItems`
-- **TỐI ƯU QUAN TRỌNG**: Chúng ta lưu (snapshot) `name` và `price`
-- để giữ lịch sử đơn hàng, phòng trường hợp nhà hàng đổi tên hoặc giá món ăn.
CREATE TABLE IF NOT EXISTS `order_items` (
    `orderItemId` INT AUTO_INCREMENT PRIMARY KEY,
    `orderId` INT NOT NULL,
    `itemId` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL, -- Snapshot tên món
    `price` DECIMAL(10, 2) NOT NULL, -- Snapshot giá món
    `quantity` INT NOT NULL,
    `note` VARCHAR(255),
    FOREIGN KEY (`orderId`) REFERENCES `orders`(`orderId`) ON DELETE CASCADE,
    FOREIGN KEY (`itemId`) REFERENCES `menu_items`(`itemId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Bảng `reviews` (Sở hữu bởi OrderService)
CREATE TABLE IF NOT EXISTS `reviews` (
    `reviewId` INT AUTO_INCREMENT PRIMARY KEY,
    `orderId` INT NOT NULL UNIQUE, -- Mỗi đơn hàng chỉ có 1 review
    `rating` INT NOT NULL, -- Rating từ 1 đến 5
    `comment` TEXT,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`orderId`) REFERENCES `orders`(`orderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Bảng `payments` (Sở hữu bởi PaymentService)
CREATE TABLE IF NOT EXISTS `payments` (
    `paymentId` INT AUTO_INCREMENT PRIMARY KEY,
    `orderId` INT NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `method` VARCHAR(50) NOT NULL, -- 'COD' hoặc 'VNPay'
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`orderId`) REFERENCES `orders`(`orderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Bảng `drones` (Sở hữu bởi DroneService)
CREATE TABLE IF NOT EXISTS `drones` (
    `droneId` INT AUTO_INCREMENT PRIMARY KEY,
    `model` VARCHAR(100),
    `capacity` DECIMAL(5, 2) NOT NULL, -- Sức chứa (ví dụ: 5.00 kg)
    `battery` DECIMAL(5, 2) NOT NULL DEFAULT 100.00, -- % pin
    `status` VARCHAR(50) NOT NULL DEFAULT 'idle' -- 'idle', 'charging', 'delivering', 'returning', 'maintenance'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Bảng `deliveries` (Sở hữu bởi DroneService)
CREATE TABLE IF NOT EXISTS `deliveries` (
    `deliveryId` INT AUTO_INCREMENT PRIMARY KEY,
    `orderId` INT NOT NULL UNIQUE, -- Mỗi đơn hàng chỉ có 1 cuốc giao
    `droneId` INT NOT NULL,
    `startLocation` VARCHAR(255), -- Địa chỉ nhà hàng
    `endLocation` VARCHAR(255), -- Địa chỉ khách
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
    `startedAt` DATETIME,
    `deliveredAt` DATETIME,
    FOREIGN KEY (`orderId`) REFERENCES `orders`(`orderId`),
    FOREIGN KEY (`droneId`) REFERENCES `drones`(`droneId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Bảng `locations` (Sở hữu bởi DroneService)
CREATE TABLE IF NOT EXISTS `locations` (
    `locationId` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `droneId` INT NOT NULL,
    `latitude` DECIMAL(9, 6) NOT NULL,
    `longitude` DECIMAL(9, 6) NOT NULL,
    `recordedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`droneId`) REFERENCES `drones`(`droneId`) ON DELETE CASCADE,
    -- Index quan trọng để truy vấn lịch sử vị trí của drone
    INDEX `idx_drone_time` (`droneId`, `recordedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Kết thúc script --