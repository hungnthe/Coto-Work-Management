package com.cotowork.userservice.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder; // Import Unit
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cotowork.userservice.dto.UserAdminCreateDto; // Import ErrorCode
import com.cotowork.userservice.dto.UserResponseDto;
import com.cotowork.userservice.entity.Unit;
import com.cotowork.userservice.entity.User;
import com.cotowork.userservice.exception.DuplicateDataException;
import com.cotowork.userservice.exception.ErrorCode;
import com.cotowork.userservice.exception.ResourceNotFoundException;
import com.cotowork.userservice.mapper.UserMapper;
import com.cotowork.userservice.repository.UnitRepository;
import com.cotowork.userservice.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Admin Create User Service
 * Simple service for creating users from admin panel
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminCreateUserService {

    private final UserRepository userRepository;
    private final UnitRepository unitRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    
    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
    private static final SecureRandom random = new SecureRandom();

    /**
     * Create new user
     */
    public UserResponseDto createUser(UserAdminCreateDto dto) {
        log.info("Creating user: {}", dto.getUsername());
        
        // Validate username uniqueness
        if (userRepository.existsByUsername(dto.getUsername())) {
            // Sửa lỗi: Dùng ErrorCode thay vì String
            throw new DuplicateDataException(ErrorCode.DUPLICATE_DATA);
        }
        
        // Validate email uniqueness
        if (userRepository.existsByEmail(dto.getEmail())) {
            // Sửa lỗi: Dùng ErrorCode
            throw new DuplicateDataException(ErrorCode.EMAIL_EXISTED);
        }
        
        // Validate unit exists & Get Unit Object
        // Sửa lỗi logic: Phải lấy object Unit ra để set vào User
        Unit unit = unitRepository.findById(dto.getUnitId())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.RESOURCE_NOT_FOUND));
        
        // Create user entity
        User user = User.builder()
                .username(dto.getUsername())
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .unit(unit) // Sửa lỗi: Dùng unit() thay vì unitId()
                .role(dto.getRole())
                .phoneNumber(dto.getPhoneNumber())
                .avatarUrl(dto.getAvatarUrl())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        // Save user
        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());
        
        // Return response DTO (without password)
        return userMapper.toResponseDto(savedUser);
    }

    /**
     * Check if username is available
     */
    @Transactional(readOnly = true)
    public boolean isUsernameAvailable(String username) {
        log.debug("Checking username availability: {}", username);
        return !userRepository.existsByUsername(username);
    }

    /**
     * Check if email is available
     */
    @Transactional(readOnly = true)
    public boolean isEmailAvailable(String email) {
        log.debug("Checking email availability: {}", email);
        return !userRepository.existsByEmail(email);
    }

    /**
     * Generate random secure password
     */
    public String generateRandomPassword() {
        log.debug("Generating random password");
        
        StringBuilder password = new StringBuilder();
        
        // Ensure at least one uppercase letter
        password.append(getRandomChar("ABCDEFGHJKLMNPQRSTUVWXYZ"));
        
        // Ensure at least one lowercase letter
        password.append(getRandomChar("abcdefghijkmnpqrstuvwxyz"));
        
        // Ensure at least one number
        password.append(getRandomChar("23456789"));
        
        // Ensure at least one special character
        password.append(getRandomChar("!@#$%^&*"));
        
        // Fill remaining positions (total length: 12)
        for (int i = 4; i < 12; i++) {
            password.append(PASSWORD_CHARS.charAt(random.nextInt(PASSWORD_CHARS.length())));
        }
        
        // Shuffle the password to randomize positions
        return shuffleString(password.toString());
    }
    
    /**
     * Get random character from given string
     */
    private char getRandomChar(String chars) {
        return chars.charAt(random.nextInt(chars.length()));
    }
    
    /**
     * Shuffle string characters
     */
    private String shuffleString(String input) {
        char[] chars = input.toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = chars[i];
            chars[i] = chars[j];
            chars[j] = temp;
        }
        return new String(chars);
    }
}