use order_service;

-- =====================
-- BẢNG ORDERS
-- =====================
CREATE TABLE orders (
    order_id VARCHAR(36) PRIMARY KEY,          -- VD: UUID '550e8400-e29b-41d4-a716-446655440000'
    order_code VARCHAR(50) UNIQUE NOT NULL,    -- VD: 'ORD-2025-0001'
    customer_id VARCHAR(36) NOT NULL,          -- ID từ User Service
    restaurant_id VARCHAR(36) NOT NULL,        -- ID từ Restaurant Service
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_address VARCHAR(255),
    payment_id VARCHAR(36),                    -- ID từ Payment Service
    delivery_id VARCHAR(36),                   -- ID từ Drone Service
    status ENUM('PENDING','ACCEPTED','PREPARING','DELIVERING','DELIVERED','COMPLETED','CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================
-- BẢNG ORDER_ITEMS
-- =====================
CREATE TABLE order_items (
    order_item_id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,       -- ID từ Restaurant Service
    product_name VARCHAR(100),
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) AS (quantity * price) STORED,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- =====================
-- BẢNG ORDER_STATUS_HISTORY
-- =====================
CREATE TABLE order_status_history (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);


INSERT INTO orders (order_id, order_code, customer_id, restaurant_id, total_amount, delivery_address, payment_id, delivery_id, status, created_at, updated_at)
VALUES
('a1b2c3d4-e001-4001-aaaa-000000000001', 'ORD-2025-0001', 'USR-001', 'RES-001', 250000, '12 Nguyễn Huệ, Q1, TP.HCM', 'PAY-001', 'DRONE-001', 'DELIVERED', NOW(), NOW()),
('a1b2c3d4-e002-4001-aaaa-000000000002', 'ORD-2025-0002', 'USR-002', 'RES-002', 180000, '45 Trần Hưng Đạo, Q5, TP.HCM', 'PAY-002', 'DRONE-002', 'DELIVERING', NOW(), NOW()),
('a1b2c3d4-e003-4001-aaaa-000000000003', 'ORD-2025-0003', 'USR-003', 'RES-001', 320000, '89 Lê Lợi, Q1, TP.HCM', 'PAY-003', 'DRONE-003', 'PREPARING', NOW(), NOW());

INSERT INTO order_items (order_item_id, order_id, product_id, product_name, quantity, price)
VALUES
-- Order 1
('it-0001', 'a1b2c3d4-e001-4001-aaaa-000000000001', 'PROD-001', 'Phở Bò Tái', 2, 50000),
('it-0002', 'a1b2c3d4-e001-4001-aaaa-000000000001', 'PROD-002', 'Trà Đào Cam Sả', 1, 50000),

-- Order 2
('it-0003', 'a1b2c3d4-e002-4001-aaaa-000000000002', 'PROD-010', 'Bún Chả Hà Nội', 2, 60000),
('it-0004', 'a1b2c3d4-e002-4001-aaaa-000000000002', 'PROD-011', 'Nước Suối', 1, 20000),

-- Order 3
('it-0005', 'a1b2c3d4-e003-4001-aaaa-000000000003', 'PROD-020', 'Cơm Gà Hải Nam', 2, 80000),
('it-0006', 'a1b2c3d4-e003-4001-aaaa-000000000003', 'PROD-021', 'Trà Tắc', 1, 60000);

INSERT INTO order_status_history (id, order_id, old_status, new_status, changed_at)
VALUES
-- Order 1
('st-001', 'a1b2c3d4-e001-4001-aaaa-000000000001', 'PENDING', 'ACCEPTED', NOW() - INTERVAL 30 MINUTE),
('st-002', 'a1b2c3d4-e001-4001-aaaa-000000000001', 'ACCEPTED', 'DELIVERING', NOW() - INTERVAL 15 MINUTE),
('st-003', 'a1b2c3d4-e001-4001-aaaa-000000000001', 'DELIVERING', 'DELIVERED', NOW()),

-- Order 2
('st-004', 'a1b2c3d4-e002-4001-aaaa-000000000002', 'PENDING', 'PREPARING', NOW() - INTERVAL 25 MINUTE),
('st-005', 'a1b2c3d4-e002-4001-aaaa-000000000002', 'PREPARING', 'DELIVERING', NOW() - INTERVAL 10 MINUTE),
('st-006', 'a1b2c3d4-e002-4001-aaaa-000000000002', 'DELIVERING', 'DELIVERING', NOW()),

-- Order 3
('st-007', 'a1b2c3d4-e003-4001-aaaa-000000000003', 'PENDING', 'ACCEPTED', NOW() - INTERVAL 40 MINUTE),
('st-008', 'a1b2c3d4-e003-4001-aaaa-000000000003', 'ACCEPTED', 'PREPARING', NOW() - INTERVAL 20 MINUTE),
('st-009', 'a1b2c3d4-e003-4001-aaaa-000000000003', 'PREPARING', 'PREPARING', NOW());

