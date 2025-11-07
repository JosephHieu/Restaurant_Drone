package com.josephhieu.restaurantservice.service;

import com.josephhieu.restaurantservice.dto.request.*;
import com.josephhieu.restaurantservice.entity.MenuItem;
import com.josephhieu.restaurantservice.entity.Restaurant;
import com.josephhieu.restaurantservice.exception.ResourceNotFoundException;
import com.josephhieu.restaurantservice.repository.MenuItemRepository;
import com.josephhieu.restaurantservice.repository.RestaurantRepository;
import com.josephhieu.restaurantservice.security.CustomUserDetails;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private ModelMapper modelMapper;

    /**
     * API: GET /api/restaurants/my
     * Lấy thông tin nhà hàng của chủ quán đang đăng nhập
     */
    public Restaurant getMyRestaurant(CustomUserDetails user) {
        // Dùng user.getId() để tìm nhà hàng
        return restaurantRepository.findAllByOwnerId(user.getId())
                .stream()
                .findFirst()
                // THAY THẾ AccessDeniedException BẰNG ResourceNotFoundException
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "ownerId", user.getId()));
    }

    // === HÀM MỚI: Dùng cho OWNER (PUT /{id}) ===
    @Transactional
    public Restaurant ownerUpdateRestaurant(Integer restaurantId, UpdateRestaurantRequest request, CustomUserDetails user) {

        // 1. Tìm nhà hàng
        Restaurant restaurant = getRestaurantById(restaurantId);

        // 2. Kiểm tra quyền sở hữu (BẮT BUỘC)
        // Nếu user không phải là Admin VÀ không phải là chủ sở hữu
        checkOwnership(user, restaurant);

        // 3. Cập nhật thông tin (Chủ nhà hàng không được sửa ownerId, status)
        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setPhone(request.getPhone());
        restaurant.setAddress(request.getAddress());

        // 4. Nếu owner gửi status, ta cho phép đổi giữa open/closed
        if (request.getStatus() != null && (request.getStatus().equals("open") || request.getStatus().equals("closed"))) {
            restaurant.setStatus(request.getStatus());
        }

        return restaurantRepository.save(restaurant);
    }

    /**
     * API: PUT /api/restaurants/my
     * Cập nhật thông tin nhà hàng
     */
    @Transactional
    public Restaurant updateMyRestaurant(CustomUserDetails user, UpdateRestaurantRequest request) {
        // 1. Lấy nhà hàng. Nếu user không sở hữu, hàm trên ném ra 404.
        Restaurant restaurant = getMyRestaurant(user);

        // 2. Không cần kiểm tra checkOwnership() hay AccessDeniedException nữa

        // 3. Cập nhật thông tin
        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setPhone(request.getPhone());
        restaurant.setAddress(request.getAddress());

        if (request.getStatus().equals("open") || request.getStatus().equals("closed")) {
            restaurant.setStatus(request.getStatus());
        }

        return restaurantRepository.save(restaurant);
    }

    // === CÁC HÀM PUBLIC (CHO KHÁCH HÀNG) ===

    /**
     * API: GET /api/restaurants
     * Lấy tất cả nhà hàng đang 'open'
     */
    public List<Restaurant> getAllOpenRestaurants() {
        return restaurantRepository.findAllByStatus("open");
    }

    /**
     * API: GET /api/restaurants/{id}
     * Lấy chi tiết 1 nhà hàng
     */
    public Restaurant getRestaurantById(Integer id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", id));
    }

    /**
     * API: GET /api/restaurants/{id}/menu
     * Lấy thực đơn của 1 nhà hàng
     */
    public List<MenuItem> getMenuItemsByRestaurant(Integer restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant", "id", restaurantId);
        }
        return menuItemRepository.findAllByRestaurant_RestaurantId(restaurantId);
    }

    /**
     * API: GET /api/menu-items/{id}
     * (Dùng cho nội bộ, ví dụ: CartService)
     */
    public MenuItem getMenuItemById(Integer itemId) {
        return menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", itemId));
    }

    // === CÁC HÀM PROTECTED (CHO CHỦ NHÀ HÀNG / ADMIN) ===

    /**
     * API: POST /api/restaurants
     * Tạo nhà hàng mới
     */
    @Transactional
    public Restaurant createRestaurant(CreateRestaurantRequest request, CustomUserDetails user) {
        Restaurant restaurant = modelMapper.map(request, Restaurant.class);

        // Gán chủ sở hữu là user đang đăng nhập
        restaurant.setOwnerId(request.getOwnerId());

        // Trạng thái mặc định là "pending" (chờ Admin duyệt)
        restaurant.setStatus("pending");

        return restaurantRepository.save(restaurant);
    }

    /**
     * API: POST /api/restaurants/{id}/menu-items
     * Thêm món ăn mới vào nhà hàng
     */
    @Transactional
    public MenuItem createMenuItem(Integer restaurantId, CreateMenuItemRequest request, CustomUserDetails user) {
        Restaurant restaurant = getRestaurantById(restaurantId);

        // Bảo mật: Kiểm tra xem user có phải chủ nhà hàng hoặc Admin không
        checkOwnership(user, restaurant);

        MenuItem menuItem = modelMapper.map(request, MenuItem.class);
        menuItem.setRestaurant(restaurant); // Liên kết với nhà hàng

        return menuItemRepository.save(menuItem);
    }

    /**
     * API: PUT /api/menu-items/{id}
     * Cập nhật món ăn
     */
    @Transactional
    public MenuItem updateMenuItem(Integer itemId, CreateMenuItemRequest request, CustomUserDetails user) {
        MenuItem menuItem = getMenuItemById(itemId);

        // Bảo mật: Kiểm tra quyền sở hữu
        checkOwnership(user, menuItem.getRestaurant());

        // Ánh xạ các trường từ DTO
        modelMapper.map(request, menuItem);

        return menuItemRepository.save(menuItem);
    }

    /**
     * API: DELETE /api/menu-items/{id}
     * Xóa món ăn
     */
    @Transactional
    public void deleteMenuItem(Integer itemId, CustomUserDetails user) {
        MenuItem menuItem = getMenuItemById(itemId);

        // Bảo mật: Kiểm tra quyền sở hữu
        checkOwnership(user, menuItem.getRestaurant());

        // === THÊM LOGIC KIỂM TRA ĐƠN HÀNG (Internal Communication) ===
        // GIẢ LẬP: Nếu đã có OrderService
        // boolean hasOrders = orderService.checkIfMenuItemHasOrders(itemId);
        // if (hasOrders) {
        //     // Nếu đã có đơn hàng, chỉ chuyển trạng thái (Soft Delete)
        //     menuItem.setAvailable(false);
        //     // Hoặc ném lỗi và yêu cầu dùng nút Switch
        //     throw new IllegalStateException("Không thể xóa món này vĩnh viễn vì nó đã có trong đơn hàng.");
        // }
        //

        menuItemRepository.delete(menuItem);
    }

    // Hàm tiện ích để kiểm tra bảo mật
    private void checkOwnership(CustomUserDetails user, Restaurant restaurant) {
        // Lấy vai trò của user từ token
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ADMIN"));

        // Nếu user không phải là Admin VÀ không phải là chủ sở hữu
        if (!isAdmin && !restaurant.getOwnerId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền thực hiện hành động này.");
        }
    }

    // HÀM MỚI
    public boolean checkUserOwnership(Integer ownerId) {
        return restaurantRepository.existsByOwnerId(ownerId);
    }

    /**
     * API: GET /api/restaurants/all
     * (Dùng cho Admin - Lấy tất cả nhà hàng, kể cả 'pending' và 'closed')
     */
    public List<Restaurant> getAllRestaurantsForAdmin() {
        // Đơn giản là gọi findAll()
        return restaurantRepository.findAll();
    }

    public List<Restaurant> getAllRestaurantsByOwnerId(Integer ownerId) {
        return restaurantRepository.findAllByOwnerId(ownerId);
    }

    /**
     * API: PUT /api/restaurants/{id}/approve
     * (Dùng cho Admin - Phê duyệt nhà hàng)
     */
    @Transactional
    public Restaurant approveRestaurant(Integer restaurantId) {
        // 1. Tìm nhà hàng
        Restaurant restaurant = getRestaurantById(restaurantId); // Dùng lại hàm cũ

        // 2. Chỉ phê duyệt nếu đang ở trạng thái 'pending'
        if (!restaurant.getStatus().equals("pending")) {
            throw new IllegalStateException("Nhà hàng này không ở trạng thái 'chờ duyệt'.");
        }

        // 3. Đổi trạng thái
        restaurant.setStatus("open");

        // 4. Lưu lại
        return restaurantRepository.save(restaurant);
    }

    /**
     * API: PUT /api/restaurants/{id}/status
     * (Dùng cho Admin - Cập nhật trạng thái (approve, ban, close))
     */
    @Transactional
    public Restaurant updateRestaurantStatus(Integer restaurantId, AdminUpdateStatusRequest request) {
        // 1. Tìm nhà hàng
        Restaurant restaurant = getRestaurantById(restaurantId); // Dùng lại hàm cũ

        // 2. Cập nhật trạng thái
        // (Bạn có thể thêm logic kiểm tra xem 'status' có hợp lệ không)
        restaurant.setStatus(request.getStatus());

        // 3. Lưu lại
        return restaurantRepository.save(restaurant);
    }

    /**
     * API: PUT /api/restaurants/{id}
     * (Dùng cho Admin - Cập nhật toàn bộ thông tin nhà hàng)
     */
    @Transactional
    public Restaurant adminUpdateRestaurant(Integer restaurantId, AdminUpdateRestaurantRequest request) {
        // 1. Tìm nhà hàng
        Restaurant restaurant = getRestaurantById(restaurantId); // Dùng lại hàm cũ

        // 2. Cập nhật tất cả các trường từ DTO
        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setPhone(request.getPhone());
        restaurant.setAddress(request.getAddress());
        restaurant.setOwnerId(request.getOwnerId()); // Admin gán chủ mới
        restaurant.setStatus(request.getStatus());   // Admin gán trạng thái mới

        // 3. Lưu lại
        return restaurantRepository.save(restaurant);
    }

    /**
     * API: GET /api/restaurants/my/menu
     * Lấy toàn bộ thực đơn của nhà hàng MẶC ĐỊNH
     */
    public List<MenuItem> getMyMenu(CustomUserDetails user) {
        Restaurant restaurant = getMyRestaurant(user);
        // Lấy tất cả menu items có restaurant_id này
        return menuItemRepository.findAllByRestaurant_RestaurantId(restaurant.getRestaurantId());
    }

}