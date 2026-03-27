package com.cotowork.userservice.dto;

import lombok.*;

import java.util.Map;

/**
 * DTO for user statistics
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatsDto {
    
    private Long totalUsers;
    private Long activeUsers;
    private Long inactiveUsers;
    private Map<String, Long> usersByRole;
    private Map<String, Long> usersByUnit;
    private Long usersCreatedThisMonth;
    private Long usersCreatedThisWeek;
}