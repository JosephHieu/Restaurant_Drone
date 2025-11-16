package com.josephhieu.droneservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // <-- Đây là chìa khóa!
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Cấu hình một message broker đơn giản, gửi tin nhắn tới các đích bắt đầu bằng "/topic"
        config.enableSimpleBroker("/topic");
        // Tiền tố cho các endpoint mà client sẽ gửi tin nhắn đến (ví dụ: /app/chat)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Đăng ký một endpoint "/ws" để client kết nối WebSocket
        // .withSockJS() là để hỗ trợ các trình duyệt không hỗ trợ WebSocket
        registry.addEndpoint("/ws").withSockJS();
    }
}