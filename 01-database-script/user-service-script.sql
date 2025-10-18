-- 1️⃣ Tạo database
CREATE DATABASE IF NOT EXISTS user_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2️⃣ Sử dụng database
USE user_service;

-- 3️⃣ Tạo bảng roles
CREATE TABLE roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- 4️⃣ Tạo bảng users (UUID thay cho INT)
CREATE TABLE users (
  user_id CHAR(36) PRIMARY KEY,  -- 🔄 UUID có độ dài 36 ký tự (bao gồm dấu '-')
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role_id INT,
  address VARCHAR(255),
  status ENUM('active','inactive') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
) ENGINE=InnoDB;

-- 5️⃣ Thêm dữ liệu mẫu vào bảng roles
INSERT INTO roles (name)
VALUES ('Admin'), ('Customer'), ('RestaurantOwner');

-- 6️⃣ Thêm dữ liệu mẫu vào bảng users (sử dụng UUID)
INSERT INTO users (user_id, full_name, email, phone, password_hash, role_id, address)
VALUES
(UUID(), 'Nguyen Van A', 'vana@example.com', '0901234567', 'hashed_password_123', 1, 'Hà Nội'),
(UUID(), 'Tran Thi B', 'thib@example.com', '0907654321', 'hashed_password_456', 2, 'TP. Hồ Chí Minh'),
(UUID(), 'Le Quang C', 'quangc@example.com', '0909999999', 'hashed_password_789', 3, 'Đà Nẵng');
