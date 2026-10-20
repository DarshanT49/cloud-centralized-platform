package com.cloudBackend.auth.service;

import com.cloudBackend.auth.dto.AuthResponse;
import com.cloudBackend.auth.dto.LoginRequest;
import com.cloudBackend.auth.dto.RegisterRequest;
import com.cloudBackend.auth.dto.UserSummaryDto;
import com.cloudBackend.auth.entity.User;
import com.cloudBackend.auth.repository.UserRepository;
import com.cloudBackend.config.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("An account with this email address already exists.");
        }

        // Hash the password securely with BCrypt
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(hashedPassword);
        user.setRole("ROLE_USER");

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser);

        UserSummaryDto userSummary = new UserSummaryDto(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getCreatedAt()
        );

        return new AuthResponse(true, "Account created successfully!", userSummary, token);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email address or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email address or password.");
        }

        String token = jwtService.generateToken(user);

        UserSummaryDto userSummary = new UserSummaryDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );

        return new AuthResponse(true, "Welcome back, " + user.getFullName() + "!", userSummary, token);
    }
}
