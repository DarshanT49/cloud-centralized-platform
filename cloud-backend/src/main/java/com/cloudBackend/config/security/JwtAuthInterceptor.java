package com.cloudBackend.config.security;

import com.cloudBackend.auth.entity.User;
import com.cloudBackend.auth.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Optional;

@Component
public class JwtAuthInterceptor implements HandlerInterceptor {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthInterceptor(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Allow CORS preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String email = jwtService.extractEmail(token);
                if (email != null && !jwtService.isTokenExpired(token)) {
                    Optional<User> userOpt = userRepository.findByEmail(email);
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        request.setAttribute("currentUser", user);
                        request.setAttribute("userId", user.getId());
                        request.setAttribute("userEmail", user.getEmail());
                    }
                }
            } catch (Exception e) {
                // Invalid or expired token - request proceeds unauthenticated
            }
        }

        return true;
    }
}
