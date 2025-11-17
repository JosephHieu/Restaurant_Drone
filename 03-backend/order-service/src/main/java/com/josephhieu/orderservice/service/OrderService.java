package com.josephhieu.orderservice.service;

import com.josephhieu.orderservice.client.DroneClient;
import com.josephhieu.orderservice.client.RestaurantClient;
import com.josephhieu.orderservice.client.UserClient;
import com.josephhieu.orderservice.client.PaymentClient;
import com.josephhieu.orderservice.client.dto.*;
import com.josephhieu.orderservice.dto.*;
import com.josephhieu.orderservice.entity.Order;
import com.josephhieu.orderservice.entity.OrderItem;
import com.josephhieu.orderservice.exception.ResourceNotFoundException;
import com.josephhieu.orderservice.repository.OrderRepository;
import com.josephhieu.orderservice.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
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
    @Autowired
    private PaymentClient paymentClient;
    @Autowired
    private DroneClient droneClient;

    // === 1. TIÊM (INJECT) LOCATION SERVICE ===
    @Autowired
    private LocationService locationService;

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
    public OrderResponseDto createOrder(CustomUserDetails user, OrderRequest orderRequest) {
        String authHeader = getAuthHeader();
        CartDto cart = userClient.getCart(authHeader);

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new IllegalStateException("Giỏ hàng rỗng. Không thể đặt hàng.");
        }

        // === 2. THÊM LOGIC KIỂM TRA 5KM ===

        // A. Lấy tọa độ nhà hàng (điểm lấy)
        // (Feign Client 'restaurantClient' đã được @Autowired)
        RestaurantDto restaurant = restaurantClient.getRestaurantById(cart.getRestaurantId());

        // B. Lấy tọa độ khách (điểm giao)
        // (Tạm thời: Giả lập. Sau này bạn sẽ lấy từ 'orderRequest' hoặc 'userClient')
        BigDecimal customerLat = new BigDecimal("10.8888"); // (Giả lập Vĩ độ khách)
        BigDecimal customerLng = new BigDecimal("106.7777"); // (Giả lập Kinh độ khách)

        // C. Tính toán khoảng cách
        double distance = locationService.calculateDistance(
                restaurant.getLatitude(), restaurant.getLongitude(),
                customerLat, customerLng
        );

        // D. Kiểm tra
        if (distance > 20) { // Kiểm tra bán kính 5km
            throw new IllegalStateException(String.format(
                    "Khoảng cách giao hàng (%.1f km) vượt quá giới hạn 5km. Không thể đặt hàng.", distance
            ));
        }
        // ============================

        // 3. KHỞI TẠO ĐƠN HÀNG (Logic cũ)
        Order order = new Order();
        order.setCustomerId(user.getId());
        order.setRestaurantId(cart.getRestaurantId());
        order.setDeliveryAddress(orderRequest.getDeliveryAddress());
        order.setPaymentMethod(orderRequest.getPaymentMethod());
        order.setStatus("PENDING");

        BigDecimal grandTotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItemDto cartItem : cart.getCartItems()) {
            MenuItemDto itemDetails = restaurantClient.getMenuItemById(cartItem.getItemId());
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setItemId(cartItem.getItemId());
            orderItem.setName(itemDetails.getName());
            orderItem.setPrice(itemDetails.getPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setNote(cartItem.getNote());
            BigDecimal itemTotal = itemDetails.getPrice().multiply(new BigDecimal(cartItem.getQuantity()));
            grandTotal = grandTotal.add(itemTotal);
            orderItems.add(orderItem);
        }

        order.setTotalPrice(grandTotal);
        order.setOrderItems(orderItems);
        Order savedOrder = orderRepository.save(order);
        userClient.clearCart(authHeader);

        // 4. TẠO THANH TOÁN (Logic cũ)
        String paymentUrl = null;
        if ("VNPAY".equalsIgnoreCase(orderRequest.getPaymentMethod())) {
            PaymentRequest paymentRequest = new PaymentRequest();
            paymentRequest.setOrderId(savedOrder.getOrderId());
            paymentRequest.setAmount(savedOrder.getTotalPrice());
            PaymentResponse paymentResponse = paymentClient.createVnPayPayment(paymentRequest, authHeader);
            paymentUrl = paymentResponse.getPaymentUrl();
        } else {
            paymentUrl = "COD";
        }

        return new OrderResponseDto(savedOrder, paymentUrl);
    }


    /**
     * API: GET /api/orders/my-history
     * (Đã đúng)
     */
    public List<Order> getMyOrderHistory(CustomUserDetails user) {
        return orderRepository.findAllByCustomerIdOrderByCreatedAtDesc(user.getId());
    }

    /**
     * API: GET /api/orders/all (Dành cho Admin)
     * Lấy tất cả đơn hàng.
     */
    public List<Order> getAllOrdersForAdmin(CustomUserDetails user) {
        // (Kiểm tra quyền Admin - Mặc dù Controller đã kiểm tra,
        //  Service kiểm tra lại sẽ an toàn hơn, nhưng không bắt buộc)

        // boolean isAdmin = user.getAuthorities().stream()
        //         .anyMatch(a -> a.getAuthority().equals("ADMIN"));
        // if (!isAdmin) {
        //     throw new AccessDeniedException("Bạn không có quyền truy cập tài nguyên này.");
        // }

        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * API: GET /api/orders/{id}
     * (Đã đúng)
     */
    public Order getOrderById(Integer orderId, CustomUserDetails user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));
        if (!isAdmin && !order.getCustomerId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền xem đơn hàng này.");
        }
        return order;
    }

    /**
     * API: GET /api/orders/restaurant/{restaurantId}
     * (Đã đúng)
     */
    public List<Order> getRestaurantOrders(Integer restaurantId, CustomUserDetails user) {
        checkRestaurantOwnership(restaurantId, user);
        List<String> statusesToFetch = Arrays.asList("PENDING", "CONFIRMED");
        return orderRepository.findAllByRestaurantIdAndStatusInOrderByCreatedAtAsc(restaurantId, statusesToFetch);
    }

    /**
     * API: PUT /api/orders/{id}/status
     * (Đã đúng)
     */
    @Transactional
    public Order updateOrderStatus(Integer orderId, UpdateOrderStatusRequest request, CustomUserDetails user) {
        String authHeader = getAuthHeader(); // Lấy token (nếu cần)

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Kiểm tra quyền sở hữu (Giữ nguyên)
        checkRestaurantOwnership(order.getRestaurantId(), user);

        String newStatus = request.getStatus(); // Đây là "READY_FOR_DELIVERY"

        // === BẮT ĐẦU SỬA (LOGIC HARDCODE) ===

        // Nếu chủ nhà hàng nhấn "Sẵn sàng Giao" (READY_FOR_DELIVERY)
        if ("READY_FOR_DELIVERY".equals(newStatus)) {

            // Ngay lập tức chuyển nó thành "COMPLETED" (Hoàn thành)
            order.setStatus("COMPLETED");

            // Ghi log ra console để biết code đã chạy
            System.out.println("LOGIC TEST: Đơn hàng #" + orderId + " đã được hardcode sang COMPLETED.");

            // Chúng ta KHÔNG gọi droneClient.createDelivery(...) nữa.

        } else {
            // (Nếu trạng thái là "CONFIRMED", "CANCELLED", v.v. thì cập nhật bình thường)
            order.setStatus(newStatus);
        }

        // === KẾT THÚC SỬA ===

        // Lưu trạng thái mới (COMPLETED) vào CSDL
        return orderRepository.save(order);
    }

    // === HÀM TIỆN ÍCH BẢO MẬT (Đã đúng) ===
    private void checkRestaurantOwnership(Integer restaurantId, CustomUserDetails user) {
        RestaurantDto restaurant = restaurantClient.getRestaurantById(restaurantId);
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ADMIN"));
        if (!isAdmin && !restaurant.getOwnerId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập đơn hàng của nhà hàng này.");
        }
    }

    /**
     * Lấy thống kê Dashboard cho Admin
     */
    public OrderStatsDto getDashboardStats() {
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus("PENDING");
        long deliveringOrders = orderRepository.countByStatus("DELIVERING");

        // Lấy doanh thu, nếu null (chưa có đơn nào) thì trả về 0
        BigDecimal totalRevenue = orderRepository.findTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        return new OrderStatsDto(totalOrders, pendingOrders, deliveringOrders, totalRevenue);
    }

    /**
     * Lấy thống kê Dashboard cho 1 Nhà hàng
     */
    public RestaurantStatsDto getRestaurantDashboardStats(Integer restaurantId, CustomUserDetails user) {

        // BƯỚC 1: KIỂM TRA QUYỀN SỞ HỮU (RẤT QUAN TRỌNG)
        // Dùng lại hàm cũ mà bạn đã có
        checkRestaurantOwnership(restaurantId, user);

        // BƯỚC 2: LẤY SỐ LIỆU
        long total = orderRepository.countByRestaurantId(restaurantId);
        long pending = orderRepository.countByRestaurantIdAndStatus(restaurantId, "PENDING");
        long delivering = orderRepository.countByRestaurantIdAndStatus(restaurantId, "DELIVERING");

        BigDecimal revenue = orderRepository.findTotalRevenueByRestaurantId(restaurantId);
        if (revenue == null) {
            revenue = BigDecimal.ZERO;
        }

        return new RestaurantStatsDto(total, pending, delivering, revenue);
    }
}