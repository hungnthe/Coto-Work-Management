package com.cotowork.userservice.repository;

import com.cotowork.userservice.entity.User;
import com.cotowork.userservice.entity.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
       List<User> findByIsActiveTrue();
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.unit.id = :unitId")
    List<User> findByUnitId(@Param("unitId") Long unitId);
    
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
    
    // Admin-specific methods for filtering and pagination
    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:unitId IS NULL OR u.unit.id = :unitId) AND " +
           "(:isActive IS NULL OR u.isActive = :isActive)")
    Page<User> findByFilters(@Param("role") UserRole role, 
                            @Param("unitId") Long unitId, 
                            @Param("isActive") Boolean isActive, 
                            Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:unitId IS NULL OR u.unit.id = :unitId) AND " +
           "(:isActive IS NULL OR u.isActive = :isActive) AND " +
           "(u.fullName LIKE %:search% OR u.username LIKE %:search% OR u.email LIKE %:search%)")
    Page<User> findByFiltersWithSearch(@Param("role") UserRole role, 
                                      @Param("unitId") Long unitId, 
                                      @Param("isActive") Boolean isActive, 
                                      @Param("search") String search, 
                                      Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:unitId IS NULL OR u.unit.id = :unitId) AND " +
           "(:isActive IS NULL OR u.isActive = :isActive)")
    List<User> findByFiltersForExport(@Param("role") UserRole role, 
                                     @Param("unitId") Long unitId, 
                                     @Param("isActive") Boolean isActive);
    
    // Statistics methods
    long countByIsActive(Boolean isActive);
    
    long countByRole(UserRole role);
    
    long countByCreatedAtAfter(LocalDateTime date);

    @Query("SELECT u.unit.id, COUNT(u) FROM User u GROUP BY u.unit.id")
    List<Object[]> findUserCountByUnit();
    
    // Inactive users (users who haven't been updated recently)
    @Query("SELECT u FROM User u WHERE u.updatedAt < :cutoffDate AND u.isActive = true")
    List<User> findInactiveUsers(@Param("cutoffDate") LocalDateTime cutoffDate);
}
