package com.josephhieu.orderservice.service;

import com.josephhieu.orderservice.client.RestaurantClient;
import com.josephhieu.orderservice.client.UserClient;
import com.josephhieu.orderservice.client.dto.CartDto;
import com.josephhieu.orderservice.client.dto.CartItemDto;
import com.josephhieu.orderservice.client.dto.MenuItemDto;
import com.josephhieu.orderservice.dto.OrderRequest;
import com.josephhieu.orderservice.client.PaymentClient; // <-- Import
import com.josephhieu.orderservice.client.dto.PaymentRequest; // <-- Import
import com.josephhieu.orderservice.client.dto.PaymentResponse; // <-- Import
import com.josephhieu.orderservice.dto.OrderResponseDto;// Sẽ tạo ở bước sau
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
import com.josephhieu.orderservice.client.dto.RestaurantDto; // <-- Import DTO
import com.josephhieu.orderservice.dto.UpdateOrderStatusRequest; // <-- Import DTO
import org.springframework.security.access.AccessDeniedException;

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

        // 3. GỌI USER-SERVICE: Xóa giỏ hàng
        userClient.clearCart(authHeader);

        // 4. === LOGIC MỚI: TẠO THANH TOÁN ===
        String paymentUrl = null;
        if ("VNPAY".equalsIgnoreCase(orderRequest.getPaymentMethod())) {

            // 4a. Tạo yêu cầu thanh toán
            PaymentRequest paymentRequest = new PaymentRequest();
            paymentRequest.setOrderId(savedOrder.getOrderId());
            paymentRequest.setAmount(savedOrder.getTotalPrice());

            // 4b. GỌI PAYMENT-SERVICE
            PaymentResponse paymentResponse = paymentClient.createVnPayPayment(paymentRequest, authHeader);
            paymentUrl = paymentResponse.getPaymentUrl();

        } else {
            // Nếu là COD
            paymentUrl = "COD";
            // (Bạn có thể thêm logic gửi tin nhắn cho DroneService ở đây nếu là COD)
        }

        // 5. Trả về Order và Payment URL
        return new OrderResponseDto(savedOrder, paymentUrl);
    }


    /**
     * API: GET /api/orders/my-history
     * Lấy lịch sử đơn hàng của user đang đăng nhập
     */
    public List<Order> getMyOrderHistory(CustomUserDetails user) {
        // Gọi thẳng hàm repository với ID của user đã đăng nhập
        return orderRepository.findAllByCustomerIdOrderByCreatedAtDesc(user.getId());
    }

    /**
     * API: GET /api/orders/{id}
     * Lấy chi tiết 1 đơn hàng VÀ kiểm tra quyền sở hữu
     */
    public Order getOrderById(Integer orderId, CustomUserDetails user) {
        // 1. Tìm đơn hàng
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // 2. KIỂM TRA BẢO MẬT:
        // User phải là Admin HOẶC là chủ của đơn hàng
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));

        if (!isAdmin && !order.getCustomerId().equals(user.getId())) {
            // Nếu không phải Admin VÀ không phải chủ đơn hàng -> Từ chối
            throw new AccessDeniedException("Bạn không có quyền xem đơn hàng này.");
        }

        // 3. Trả về đơn hàng (Bao gồm cả orderItems vì nó là EAGER)
        return order;
    }

    /**
     * API: GET /api/orders/restaurant/{restaurantId}
     * Lấy các đơn hàng (chưa hoàn thành) cho 1 nhà hàng
     */
    public List<Order> getRestaurantOrders(Integer restaurantId, CustomUserDetails user) {
        // 1. Kiểm tra bảo mật: User này có sở hữu nhà hàng này không?
        checkRestaurantOwnership(restaurantId, user);

        // 2. Lấy các đơn hàng đang 'Chờ' (PENDING) hoặc 'Đang chuẩn bị' (CONFIRMED)
        List<String> statusesToFetch = Arrays.asList("PENDING", "CONFIRMED");

        return orderRepository.findAllByRestaurantIdAndStatusInOrderByCreatedAtAsc(restaurantId, statusesToFetch);
    }

    /**
     * API: PUT /api/orders/{id}/status
     * Cập nhật trạng thái đơn hàng (do Chủ nhà hàng thực hiện)
     */
    @Transactional
    public Order updateOrderStatus(Integer orderId, UpdateOrderStatusRequest request, CustomUserDetails user) {
        // 1. Tìm đơn hàng
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // 2. Kiểm tra bảo mật: User này có sở hữu nhà hàng của đơn hàng này không?
        checkRestaurantOwnership(order.getRestaurantId(), user);

        // 3. Cập nhật trạng thái
        // (Thêm logic kiểm tra: Ví dụ, không cho phép đổi từ PENDING sang READY)
        order.setStatus(request.getStatus());

        // TODO: Nếu status là "READY_FOR_DELIVERY",
        // bạn sẽ gửi tin nhắn (RabbitMQ) cho DroneService ở đây

        return orderRepository.save(order);
    }

    // === HÀM TIỆN ÍCH BẢO MẬT ===

    private void checkRestaurantOwnership(Integer restaurantId, CustomUserDetails user) {
        // Gọi API (nội bộ) sang RestaurantService để lấy thông tin quán
        // (API này không cần token vì nó là public GET)
        RestaurantDto restaurant = restaurantClient.getRestaurantById(restaurantId);

        // Nếu user không phải là Admin VÀ không phải là chủ sở hữu
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ADMIN"));

        if (!isAdmin && !restaurant.getOwnerId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập đơn hàng của nhà hàng này.");
        }
    }
}