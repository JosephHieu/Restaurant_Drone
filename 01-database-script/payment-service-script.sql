use payment_service;

/* * Script cho DATABASE MỚI: `payment_service_db`
 * (Sử dụng quy ước snake_case)
 */
CREATE TABLE IF NOT EXISTS `payments` (
    `payment_id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,     -- ID đơn hàng (Từ Order Service)
    `amount` DECIMAL(10, 2) NOT NULL, -- Số tiền
    `method` VARCHAR(50) NOT NULL, -- 'COD' hoặc 'VNPAY'
    `status` VARCHAR(50) NOT NULL, -- 'PENDING', 'COMPLETED', 'FAILED'
    `vnp_transaction_no` VARCHAR(255) NULL, -- Mã giao dịch của VNPay
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index (chỉ mục) để tìm kiếm đơn hàng nhanh
    INDEX `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;