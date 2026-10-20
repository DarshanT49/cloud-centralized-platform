package com.cloudBackend.auth.service;

import com.cloudBackend.auth.dto.AuthResponse;
import com.cloudBackend.auth.dto.LoginRequest;
import com.cloudBackend.auth.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
