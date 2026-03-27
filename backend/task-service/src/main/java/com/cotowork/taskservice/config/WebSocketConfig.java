package com.cotowork.taskservice.config;

import com.cotowork.taskservice.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwtUtil; // JwtUtil của project - chỉ dùng extract*() methods

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Server → Client: /queue (user-specific), /topic (broadcast)
        config.enableSimpleBroker("/queue", "/topic");
        // Client → Server
        config.setApplicationDestinationPrefixes("/app");
        // Prefix định danh kênh riêng từng user
        // convertAndSendToUser(userId, "/queue/notifications", ...) sẽ push đến
        // /user/{userId}/queue/notifications
        config.setUserDestinationPrefix("/user");
    }


    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // CORS: điều chỉnh nếu cần
                .withSockJS();                 // Fallback cho browser không support WS
    }

    /**
     * Xác thực JWT khi client gửi CONNECT frame.
     * Dùng đúng JwtUtil.extractUserId() / extractRole() / validateToken()
     * giống JwtAuthenticationFilter của project.
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {

            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor == null) return message;

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");

                    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                        log.warn("[WS] CONNECT rejected: missing Authorization header");
                        return null;
                    }

                    String token = authHeader.substring(7);

                    // Dùng đúng jwtUtil.validateToken() - giống JwtAuthenticationFilter
                    if (!jwtUtil.validateToken(token)) {
                        log.warn("[WS] CONNECT rejected: invalid token");
                        return null;
                    }

                    try {
                        Long userId   = jwtUtil.extractUserId(token);
                        String role   = jwtUtil.extractRole(token);

                        // Principal name = userId.toString()
                        // → SimpMessagingTemplate.convertAndSendToUser(userId.toString(), ...)
                        // sẽ push đúng kênh /user/{userId}/queue/notifications
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        userId.toString(), // ← principal name
                                        null,
                                        List.of(new SimpleGrantedAuthority("ROLE_" + role))
                                );
                        accessor.setUser(auth);

                        log.debug("[WS] Connected: userId={}, role={}", userId, role);

                    } catch (Exception e) {
                        log.error("[WS] CONNECT error: {}", e.getMessage());
                        return null;
                    }
                }

                return message;
            }
        });
    }
}