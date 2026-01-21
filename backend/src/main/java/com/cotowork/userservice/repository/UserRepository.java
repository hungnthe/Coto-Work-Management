package com.cotowork.userservice.repository;

import com.cotowork.userservice.entity.User;
import com.cotowork.userservice.entity.UserRole;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    List<User> findByUnitId(Long unitId);
    
    List<User> findByRole(UserRole role);
    
    List<User> findByIsActive(Boolean isActive);
    
    @Query("SELECT u FROM User u WHERE u.unit.id = :unitId AND u.isActive = true")
    List<User> findActiveUsersByUnitId(@Param("unitId") Long unitId);
    
    @Query("SELECT u FROM User u WHERE u.fullName LIKE %:keyword% OR u.username LIKE %:keyword% OR u.email LIKE %:keyword%")
    List<User> searchUsers(@Param("keyword") String keyword);
    
    // Authentication-specific methods
    Optional<User> findByUsernameAndIsActiveTrue(String username);
    
    Optional<User> findByIdAndIsActiveTrue(Long id);
    
    boolean existsByIdAndIsActiveTrue(Long id);
}
