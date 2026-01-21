package com.cotowork.userservice.service;

import com.cotowork.userservice.dto.*;
import com.cotowork.userservice.entity.User;
import com.cotowork.userservice.entity.UserRole;
import com.cotowork.userservice.entity.Unit;
import com.cotowork.userservice.exception.ResourceNotFoundException;
import com.cotowork.userservice.exception.DuplicateResourceException;
import com.cotowork.userservice.mapper.UserMapper;
import com.cotowork.userservice.repository.UserRepository;
import com.cotowork.userservice.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserService {
    
    private final UserRepository userRepository;
    private final UnitRepository unitRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder; // BCryptPasswordEncoder
    
    /**
     * Get all users
     * NEVER returns password field
     */
    public List<UserResponseDto> getAllUsers() {
        log.info("Fetching all users");
        List<User> users = userRepository.findAll();
        return userMapper.toResponseDtoList(users);
    }
    
    /**
     * Get user by ID
     * NEVER returns password field
     */
    public UserResponseDto getUserById(Long id) {
        log.info("Fetching user with id: {}", id);
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toResponseDto(user);
    }
    
    /**
     * Get user by username
     * NEVER returns password field
     */
    public UserResponseDto getUserByUsername(String username) {
        log.info("Fetching user with username: {}", username);
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return userMapper.toResponseDto(user);
    }
    
    /**
     * Create new user
     * Password is hashed with BCrypt before storing
     */
    @Transactional
    public UserResponseDto createUser(UserCreateDto dto) {
        log.info("Creating new user with username: {}", dto.getUsername());
        
        // Check for duplicates
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new DuplicateResourceException("Username already exists: " + dto.getUsername());
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + dto.getEmail());
        }
        
        // Verify unit exists
        Unit unit = unitRepository.findById(dto.getUnitId())
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + dto.getUnitId()));
        
        // Map DTO to entity
        User user = userMapper.toEntity(dto);
        
        // CRITICAL: Hash password with BCrypt before storing
        String hashedPassword = passwordEncoder.encode(dto.getPassword());
        user.setPasswordHash(hashedPassword);
        
        // Set unit
        user.setUnit(unit);
        
        // Save user
        User savedUser = userRepository.save(user);
        log.info("User created successfully with id: {}", savedUser.getId());
        
        // Return DTO without password
        return userMapper.toResponseDto(savedUser);
    }
    
    /**
     * Update existing user
     * Password changes handled separately
     */
    @Transactional
    public UserResponseDto updateUser(Long id, UserUpdateDto dto) {
        log.info("Updating user with id: {}", id);
        
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        // Check email uniqueness if changed
        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new DuplicateResourceException("Email already exists: " + dto.getEmail());
            }
        }
        
        // Update unit if changed
        if (dto.getUnitId() != null && !dto.getUnitId().equals(user.getUnit().getId())) {
            Unit newUnit = unitRepository.findById(dto.getUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + dto.getUnitId()));
            user.setUnit(newUnit);
        }
        
        // Update other fields
        userMapper.updateEntityFromDto(dto, user);
        
        User updatedUser = userRepository.save(user);
        log.info("User updated successfully with id: {}", updatedUser.getId());
        
        return userMapper.toResponseDto(updatedUser);
    }
    
    /**
     * Change user password
     * Separate method for security
     */
    @Transactional
    public void changePassword(Long id, String oldPassword, String newPassword) {
        log.info("Changing password for user with id: {}", id);
        
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }
        
        // Hash and set new password
        String hashedPassword = passwordEncoder.encode(newPassword);
        user.setPasswordHash(hashedPassword);
        
        userRepository.save(user);
        log.info("Password changed successfully for user with id: {}", id);
    }
    
    /**
     * Delete user (soft delete by setting isActive = false)
     */
    @Transactional
    public void deleteUser(Long id) {
        log.info("Deleting user with id: {}", id);
        
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        user.setIsActive(false);
        userRepository.save(user);
        
        log.info("User soft deleted successfully with id: {}", id);
    }
    
    /**
     * Get users by unit
     */
    public List<UserResponseDto> getUsersByUnit(Long unitId) {
        log.info("Fetching users for unit id: {}", unitId);
        List<User> users = userRepository.findByUnitId(unitId);
        return userMapper.toResponseDtoList(users);
    }
    
    /**
     * Get users by role
     */
    public List<UserResponseDto> getUsersByRole(UserRole role) {
        log.info("Fetching users with role: {}", role);
        List<User> users = userRepository.findByRole(role);
        return userMapper.toResponseDtoList(users);
    }
    
    /**
     * Search users by keyword
     */
    public List<UserResponseDto> searchUsers(String keyword) {
        log.info("Searching users with keyword: {}", keyword);
        List<User> users = userRepository.searchUsers(keyword);
        return userMapper.toResponseDtoList(users);
    }
}
