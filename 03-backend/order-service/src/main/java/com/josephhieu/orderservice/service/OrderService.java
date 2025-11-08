package com.josephhieu.orderservice.service;

import com.josephhieu.orderservice.client.RestaurantClient;
import com.josephhieu.orderservice.client.UserClient;
import com.josephhieu.orderservice.client.dto.CartDto;
import com.josephhieu.orderservice.client.dto.CartItemDto;
import com.josephhieu.orderservice.client.dto.MenuItemDto;
import com.josephhieu.orderservice.entity.Order;
import com.josephhieu.orderservice.entity.OrderItem;
import com.josephhieu.orderservice.exception.ResourceNotFoundException;
import com.josephhieu.orderservice.repository.OrderRepository;
import com.josephhieu.orderservice.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserClient userClient;

    @Autowired
    private RestaurantClient restaurantClient;

    // Hàm tiện ích lấy token từ request (Bắt buộc cho Feign)
    private String getAuthHeader() {
        return ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes())
                .getRequest().getHeader("Authorization");
    }

    /**
     * API: POST /api/orders
     * Tạo đơn hàng mới từ giỏ hàng
     */
    @Transactional
    public Order createOrder(CustomUserDetails user) {
        String authHeader = getAuthHeader();

        // 1. GIAO TIẾP VỚI USER-SERVICE: Lấy giỏ hàng
        CartDto cart = userClient.getCart(authHeader);

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new IllegalStateException("Giỏ hàng rỗng. Không thể đặt hàng.");
        }

        // 2. KHỞI TẠO ĐƠN HÀNG VÀ TÍNH TỔNG TIỀN
        Order order = new Order();
        order.setCustomerId(user.getId());
        order.setRestaurantId(cart.getRestaurantId());
        order.setDeliveryAddress("Địa chỉ giao hàng mặc định"); // TODO: Lấy từ User Details
        order.setStatus("PENDING");
        order.setPaymentMethod("COD"); // TODO: Lấy từ request frontend

        BigDecimal grandTotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        // 3. GIAO TIẾP VỚI RESTAURANT-SERVICE: Lấy snapshot giá
        for (CartItemDto cartItem : cart.getCartItems()) {
            // Lấy chi tiết món ăn (giá, tên)
            MenuItemDto itemDetails = restaurantClient.getMenuItemById(cartItem.getItemId());

            // Xây dựng Order Item (SNAPSHOT)
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setItemId(cartItem.getItemId());
            orderItem.setName(itemDetails.getName());
            orderItem.setPrice(itemDetails.getPrice()); // <-- LƯU SNAPSHOT GIÁ
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setNote(cartItem.getNote());

            // Tính tổng
            BigDecimal itemTotal = itemDetails.getPrice().multiply(new BigDecimal(cartItem.getQuantity()));
            grandTotal = grandTotal.add(itemTotal);

            orderItems.add(orderItem);
        }

        // 4. LƯU GIAO DỊCH
        order.setTotalPrice(grandTotal);
        order.setOrderItems(orderItems); // Hibernate sẽ tự động lưu items
        Order savedOrder = orderRepository.save(order);

        // 5. GIAO TIẾP VỚI USER-SERVICE: Xóa giỏ hàng
        userClient.clearCart(authHeader);

        return savedOrder;
    }
}