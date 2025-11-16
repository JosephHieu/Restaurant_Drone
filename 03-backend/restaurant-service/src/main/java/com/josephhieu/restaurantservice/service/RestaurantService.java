package com.josephhieu.restaurantservice.service;

import com.josephhieu.restaurantservice.dto.MenuItemPublicDto;
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
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;
    @Autowired
    private MenuItemRepository menuItemRepository;
    @Autowired
    private ModelMapper modelMapper;

    // === HÀM TIỆN ÍCH MỚI (SỬA LỖI 500) ===
    /**
     * Chuyển Entity sang DTO một cách an toàn (tránh Lazy Loading)
     */
    private MenuItemPublicDto convertToDto(MenuItem item) {
        // 1. Ánh xạ thủ công, không dùng ModelMapper
        MenuItemPublicDto dto = new MenuItemPublicDto();
        dto.setItemId(item.getItemId());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setPrice(item.getPrice());
        dto.setImageUri(item.getImageUri());
        dto.setAvailable(item.isAvailable());

        // 2. Lấy ID lồng nhau một cách an toàn
        if (item.getRestaurant() != null) {
            dto.setRestaurantId(item.getRestaurant().getRestaurantId());
        }
        return dto;
    }

    // === CÁC HÀM CŨ CỦA BẠN (GIỮ NGUYÊN LOGIC) ===

    public Restaurant getMyRestaurant(CustomUserDetails user) {
        return restaurantRepository.findAllByOwnerId(user.getId())
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "ownerId", user.getId()));
    }

    @Transactional
    public Restaurant ownerUpdateRestaurant(Integer restaurantId, UpdateRestaurantRequest request, CustomUserDetails user) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        checkOwnership(user, restaurant);
        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setPhone(request.getPhone());
        restaurant.setAddress(request.getAddress());
        restaurant.setLatitude(request.getLatitude());
        restaurant.setLongitude(request.getLongitude());
        if (request.getStatus() != null && (request.getStatus().equals("open") || request.getStatus().equals("closed"))) {
            restaurant.setStatus(request.getStatus());
        }
        return restaurantRepository.save(restaurant);
    }

    /**
     * (Thay thế cho hàm getMenuItemsByRestaurant cũ)
     * API: GET /api/restaurants/{id}/menu
     * Lấy thực đơn của 1 nhà hàng (cho public) và trả về DTO
     */
    public List<MenuItemPublicDto> getPublicMenuItemsByRestaurant(Integer restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant", "id", restaurantId);
        }
        List<MenuItem> menuItems = menuItemRepository.findAllByRestaurant_RestaurantId(restaurantId);

        // Chuyển sang DTO
        return menuItems.stream()
                .map(this::convertToDto) // Gọi hàm tiện ích
                .collect(Collectors.toList());
    }

    @Transactional
    public Restaurant updateMyRestaurant(CustomUserDetails user, UpdateRestaurantRequest request) {
        Restaurant restaurant = getMyRestaurant(user);
        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setPhone(request.getPhone());
        restaurant.setAddress(request.getAddress());
        restaurant.setLatitude(request.getLatitude());
        restaurant.setLongitude(request.getLongitude());
        if (request.getStatus().equals("open") || request.getStatus().equals("closed")) {
            restaurant.setStatus(request.getStatus());
        }
        return restaurantRepository.save(restaurant);
    }

    public List<Restaurant> getAllOpenRestaurants() {
        return restaurantRepository.findAllByStatus("open");
    }

    public Restaurant getRestaurantById(Integer id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", id));
    }

    // === SỬA HÀM NÀY (Sửa lỗi 500) ===
    public List<MenuItemPublicDto> getMenuItemsByRestaurant(Integer restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant", "id", restaurantId);
        }
        List<MenuItem> menuItems = menuItemRepository.findAllByRestaurant_RestaurantId(restaurantId);
        // Trả về DTO
        return menuItems.stream().map(this::convertToDto).collect(Collectors.toList());
    }


    public MenuItem getMenuItemById(Integer itemId) {
        return menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", itemId));
    }

    /**
     * API: GET /api/menu-items/{id}
     * Lấy chi tiết 1 món ăn và trả về DTO
     */
    public MenuItemPublicDto getMenuItemByIdAndReturnDto(Integer itemId) {
        // Lấy Entity (dùng hàm cũ)
        MenuItem menuItem = getMenuItemById(itemId);

        // Chuyển sang DTO
        return convertToDto(menuItem);
    }

    @Transactional
    public Restaurant createRestaurant(CreateRestaurantRequest request, CustomUserDetails user) {
        Restaurant restaurant = modelMapper.map(request, Restaurant.class);
        restaurant.setOwnerId(request.getOwnerId());
        restaurant.setStatus("pending");
        restaurant.setCoverImageUri(request.getCoverImageUri());

        restaurant.setLatitude(request.getLatitude());
        restaurant.setLongitude(request.getLongitude());

        return restaurantRepository.save(restaurant);
    }

    // Hàm createMenuItem CŨ (Giữ lại để dùng nội bộ)
    @Transactional
    public MenuItem createMenuItem(Integer restaurantId, CreateMenuItemRequest request, CustomUserDetails user) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        checkOwnership(user, restaurant);
        Optional<MenuItem> existingItem = menuItemRepository
                .findByRestaurant_RestaurantIdAndNameIgnoreCase(restaurantId, request.getName());
        if (existingItem.isPresent()) {
            throw new IllegalStateException("Lỗi: Tên món ăn này đã tồn tại trong nhà hàng của bạn.");
        }
        MenuItem menuItem = modelMapper.map(request, MenuItem.class);
        menuItem.setRestaurant(restaurant);
        return menuItemRepository.save(menuItem);
    }

    // === HÀM MỚI (Sửa lỗi 500) ===
    @Transactional
    public MenuItemPublicDto createMenuItemAndReturnDto(Integer restaurantId, CreateMenuItemRequest request, CustomUserDetails user) {
        MenuItem newMenuItem = createMenuItem(restaurantId, request, user);
        return convertToDto(newMenuItem); // Chuyển sang DTO
    }

    @Transactional
    public MenuItem updateMenuItem(Integer itemId, CreateMenuItemRequest request, CustomUserDetails user) {
        MenuItem menuItem = getMenuItemById(itemId);
        checkOwnership(user, menuItem.getRestaurant());
        modelMapper.map(request, menuItem);
        return menuItemRepository.save(menuItem);
    }

    // === HÀM MỚI (Sửa lỗi 500) ===
    @Transactional
    public MenuItemPublicDto updateMenuItemAndReturnDto(Integer itemId, CreateMenuItemRequest request, CustomUserDetails user) {
        MenuItem updatedMenuItem = updateMenuItem(itemId, request, user);
        return convertToDto(updatedMenuItem); // Chuyển sang DTO
    }

    @Transactional
    public void deleteMenuItem(Integer itemId, CustomUserDetails user) {
        MenuItem menuItem = getMenuItemById(itemId);
        checkOwnership(user, menuItem.getRestaurant());
        menuItemRepository.delete(menuItem);
    }

    private void checkOwnership(CustomUserDetails user, Restaurant restaurant) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ADMIN"));
        if (!isAdmin && !restaurant.getOwnerId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền thực hiện hành động này.");
        }
    }

    public boolean checkUserOwnership(Integer ownerId) {
        return restaurantRepository.existsByOwnerId(ownerId);
    }

    public List<Restaurant> getAllRestaurantsForAdmin() {
        return restaurantRepository.findAll();
    }

    public List<Restaurant> getAllRestaurantsByOwnerId(Integer ownerId) {
        return restaurantRepository.findAllByOwnerId(ownerId);
    }

    @Transactional
    public Restaurant approveRestaurant(Integer restaurantId) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        if (!restaurant.getStatus().equals("pending")) {
            throw new IllegalStateException("Nhà hàng này không ở trạng thái 'chờ duyệt'.");
        }
        restaurant.setStatus("open");
        return restaurantRepository.save(restaurant);
    }

    @Transactional
    public Restaurant updateRestaurantStatus(Integer restaurantId, AdminUpdateStatusRequest request) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        restaurant.setStatus(request.getStatus());
        return restaurantRepository.save(restaurant);
    }

    @Transactional
    public Restaurant adminUpdateRestaurant(Integer restaurantId, AdminUpdateRestaurantRequest request, CustomUserDetails user) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        boolean isAdmin = user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ADMIN"));
        if (!isAdmin) {
            throw new AccessDeniedException("Chỉ Admin mới có quyền sửa đổi toàn bộ.");
        }
        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setPhone(request.getPhone());
        restaurant.setAddress(request.getAddress());
        restaurant.setLatitude(request.getLatitude());
        restaurant.setLongitude(request.getLongitude());
        restaurant.setOwnerId(request.getOwnerId());
        restaurant.setStatus(request.getStatus());
        restaurant.setCoverImageUri(request.getCoverImageUri());

        return restaurantRepository.save(restaurant);
    }

    public List<MenuItemPublicDto> getMyMenu(CustomUserDetails user) {
        Restaurant restaurant = getMyRestaurant(user);
        List<MenuItem> menuItems = menuItemRepository.findAllByRestaurant_RestaurantId(restaurant.getRestaurantId());
        // Sửa: Ánh xạ thủ công
        return menuItems.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * API: GET /api/menu-items/public/all
     * Sửa: Thêm Optional restaurantId
     */
    public List<MenuItemPublicDto> getAllPublicMenuItems(Optional<Integer> restaurantId) {

        List<MenuItem> menuItems;

        // === SỬA LOGIC LỌC MỚI ===
        if (restaurantId.isPresent()) {
            // 1. Nếu có ID, lọc theo nhà hàng đó (và phải đang 'open')
            menuItems = menuItemRepository.findAllByRestaurant_StatusAndRestaurant_RestaurantId("open", restaurantId.get());
        } else {
            // 2. Nếu không có ID, lấy tất cả món từ các quán 'open' (như cũ)
            menuItems = menuItemRepository.findAllByRestaurant_Status("open");
        }

        // (Phần code map sang DTO giữ nguyên)
        return menuItems.stream()
                .map(this::convertToDto) // Gọi hàm tiện ích
                .collect(Collectors.toList());
    }
}