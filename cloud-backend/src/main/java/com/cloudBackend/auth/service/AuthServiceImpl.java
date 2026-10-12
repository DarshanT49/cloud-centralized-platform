package com.cloudBackend.auth.service;

import com.cloudBackend.auth.dto.AuthResponse;
import com.cloudBackend.auth.dto.RegisterRequest;
import com.cloudBackend.auth.dto.UserSummaryDto;
import com.cloudBackend.auth.entity.User;
import com.cloudBackend.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
        user.setStorageUsed(0L);
        user.setStorageLimit(10737418240L); // 10 GB initial cloud storage

        User savedUser = userRepository.save(user);

        UserSummaryDto userSummary = new UserSummaryDto(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getStorageUsed(),
                savedUser.getStorageLimit(),
                savedUser.getCreatedAt()
        );

        return new AuthResponse(true, "Account created successfully!", userSummary);
    }
}
