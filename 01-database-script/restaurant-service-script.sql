use restaurant_service;



-- Xóa dữ liệu cũ để tránh trùng lặp khóa chính
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `reviews`;
TRUNCATE TABLE `cart_items`;
TRUNCATE TABLE `carts`;
TRUNCATE TABLE `menu_items`;
TRUNCATE TABLE `restaurants`;
SET FOREIGN_KEY_CHECKS = 1;

-- =================================================================
-- Sample Data Script for Restaurant Service
-- =================================================================

-- Xóa dữ liệu cũ để tránh trùng lặp khóa chính
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `reviews`;
TRUNCATE TABLE `cart_items`;
TRUNCATE TABLE `carts`;
TRUNCATE TABLE `menu_items`;
TRUNCATE TABLE `restaurants`;
SET FOREIGN_KEY_CHECKS = 1;

-- --- Biến tạm để lưu các ID ---
SET @restaurant_id = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
SET @owner_id = 'owner-uuid-1111-2222-3333-4444555566';
SET @user_id = 'user-uuid-aaaa-bbbb-cccc-ddddeeeefff';
SET @cart_id = 'cart-uuid-a1a1-b2b2-c3c3-d4d4e5e5f6f';

SET @menu_item_1 = 'menu-item-uuid-0001';
SET @menu_item_2 = 'menu-item-uuid-0002';
SET @menu_item_3 = 'menu-item-uuid-0003';
SET @menu_item_4 = 'menu-item-uuid-0004';

-- =================================================================
-- 1. Thêm 1 nhà hàng
-- =================================================================
INSERT INTO `restaurants` (`id`, `owner_id`, `name`, `description`, `phone`, `address`, `rating`, `status`, `created_at`, `updated_at`)
VALUES
(@restaurant_id, @owner_id, 'Bún Chả Đắc Kim', 'Bún chả gia truyền số 1 Hàng Mành, nổi tiếng với chả miếng nướng than hoa thơm lừng.', '0987654321', '1 Hàng Mành, Hoàn Kiếm, Hà Nội', 4.80, 'active', NOW(), NOW());

-- =================================================================
-- 2. Thêm 4 món ăn cho nhà hàng trên
-- =================================================================
INSERT INTO `menu_items` (`id`, `restaurant_id`, `name`, `description`, `price`, `image_url`, `is_available`, `created_at`, `updated_at`)
VALUES
(@menu_item_1, @restaurant_id, 'Bún Chả Suất Thường', 'Một suất đầy đủ bao gồm bún, chả miếng, chả băm và rau sống.', 60000.00, 'https://example.com/images/bun_cha.jpg', TRUE, NOW(), NOW()),
(@menu_item_2, @restaurant_id, 'Nem Cua Bể (1 cái)', 'Nem cua bể Hải Phòng giòn rụm, đầy ắp nhân thịt và cua.', 15000.00, 'https://example.com/images/nem_cua_be.jpg', TRUE, NOW(), NOW()),
(@menu_item_3, @restaurant_id, 'Trà Đá', 'Trà đá mát lạnh giải nhiệt.', 5000.00, 'https://example.com/images/tra_da.jpg', TRUE, NOW(), NOW()),
(@menu_item_4, @restaurant_id, 'Thêm Bún', 'Phần bún thêm cho khách có nhu cầu.', 10000.00, 'https://example.com/images/them_bun.jpg', TRUE, NOW(), NOW());

-- =================================================================
-- 3. Thêm 1 giỏ hàng (cho @user_id tại @restaurant_id)
-- =================================================================
INSERT INTO `carts` (`id`, `user_id`, `restaurant_id`, `created_at`, `updated_at`)
VALUES
(@cart_id, @user_id, @restaurant_id, NOW(), NOW());

-- =================================================================
-- 4. Thêm 4 món vào giỏ hàng trên
-- =================================================================
INSERT INTO `cart_items` (`id`, `cart_id`, `menu_item_id`, `quantity`, `price`, `added_at`)
VALUES
('cart-item-uuid-1', @cart_id, @menu_item_1, 1, 60000.00, NOW()), -- 1 suất Bún chả
('cart-item-uuid-2', @cart_id, @menu_item_2, 2, 15000.00, NOW()), -- 2 cái Nem cua bể
('cart-item-uuid-3', @cart_id, @menu_item_3, 2, 5000.00, NOW()),  -- 2 cốc Trà đá
('cart-item-uuid-4', @cart_id, @menu_item_4, 1, 10000.00, NOW()); -- 1 phần bún thêm

-- =================================================================
-- 5. Thêm 4 đánh giá cho nhà hàng trên (từ cùng user, cho 4 order khác nhau)
-- =================================================================
INSERT INTO `reviews` (`id`, `user_id`, `restaurant_id`, `order_id`, `rating`, `comment`, `created_at`, `updated_at`)
VALUES
('review-uuid-0001', @user_id, @restaurant_id, 'order-uuid-aaaa', 5, 'Bún chả ngon tuyệt vời, chả thơm, nước chấm đậm đà. Sẽ quay lại!', NOW(), NOW()),
('review-uuid-0002', @user_id, @restaurant_id, 'order-uuid-bbbb', 5, 'Nem cua bể ở đây là đỉnh nhất mình từng ăn. Vỏ giòn tan, nhân đầy đặn.', NOW(), NOW()),
('review-uuid-0003', @user_id, @restaurant_id, 'order-uuid-cccc', 4, 'Quán hơi đông nhưng phục vụ nhanh. Đồ ăn chất lượng, giá cả hợp lý.', NOW(), NOW()),
('review-uuid-0004', @user_id, @restaurant_id, 'order-uuid-dddd', 5, 'Giao hàng nhanh, đồ ăn vẫn còn nóng hổi. Rất hài lòng.', NOW(), NOW());
