package com.josephhieu.orderservice.service;

import com.josephhieu.orderservice.client.RestaurantClient;
import com.josephhieu.orderservice.client.UserClient;
import com.josephhieu.orderservice.client.dto.CartDto;
import com.josephhieu.orderservice.client.dto.CartItemDto;
import com.josephhieu.orderservice.client.dto.MenuItemDto;
import com.josephhieu.orderservice.dto.OrderRequest; // Sẽ tạo ở bước sau
import com.josephhieu.orderservice.entity.Order;
import com.josephhieu.orderservice.entity.OrderItem;
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
import java.util.Objects;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private UserClient userClient;
    @Autowired
    private RestaurantClient restaurantClient;

    // Hàm tiện ích lấy token "Bearer ..." từ request
    private String getAuthHeader() {
        return ((ServletRequestAttributes) Objects.requireNonNull(RequestContextHolder.getRequestAttributes()))
                .getRequest().getHeader("Authorization");
    }

    /**
     * API: POST /api/orders
     * Tạo đơn hàng mới từ giỏ hàng
     */
    @Transactional
    public Order createOrder(CustomUserDetails user, OrderRequest orderRequest) {
        String authHeader = getAuthHeader();

        // 1. GỌI USER-SERVICE: Lấy giỏ hàng
        CartDto cart = userClient.getCart(authHeader);

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new IllegalStateException("Giỏ hàng rỗng. Không thể đặt hàng.");
        }

        // 2. KHỞI TẠO ĐƠN HÀNG
        Order order = new Order();
        order.setCustomerId(user.getId());
        order.setRestaurantId(cart.getRestaurantId());

        // Lấy địa chỉ và phương thức thanh toán từ frontend
        order.setDeliveryAddress(orderRequest.getDeliveryAddress());
        order.setPaymentMethod(orderRequest.getPaymentMethod());
        order.setStatus("PENDING"); // Trạng thái chờ (VNPAY/COD)

        BigDecimal grandTotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        // 3. GỌI RESTAURANT-SERVICE: Lấy snapshot giá
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
        order.setOrderItems(orderItems);
        Order savedOrder = orderRepository.save(order);

        // 5. GỌI USER-SERVICE: Xóa giỏ hàng
        userClient.clearCart(authHeader);

        return savedOrder;
    }

    // (Bạn có thể thêm các hàm GET /api/orders/my-history ở đây)
}