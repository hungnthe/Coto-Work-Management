package com.cotowork.userservice.mapper;

import com.cotowork.userservice.dto.*;
import com.cotowork.userservice.entity.User;
import org.mapstruct.*;

import java.util.List;

/**
 * MapStruct mapper for User entity and DTOs
 * CRITICAL: Never map password field to response DTOs
 */
@Mapper(componentModel = "spring", uses = {UnitMapper.class})
public interface UserMapper {
    
    /**
     * Convert User entity to UserResponseDto
     * Password field is NEVER included in response
     */
    @Mapping(target = "unit", source = "unit")
    UserResponseDto toResponseDto(User user);
    
    List<UserResponseDto> toResponseDtoList(List<User> users);
    
    /**
     * Convert UserCreateDto to User entity
     * Password will be hashed separately in service layer
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true) // Set separately after hashing
    @Mapping(target = "unit", ignore = true) // Set separately from unitId
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "isActive", ignore = true) // Will be set to true by default in entity
    User toEntity(UserCreateDto dto);
    
    /**
     * Update existing User entity from UserUpdateDto
     * Only updates non-null fields
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "username", ignore = true) // Username cannot be changed
    @Mapping(target = "passwordHash", ignore = true) // Password changes handled separately
    @Mapping(target = "unit", ignore = true) // Set separately from unitId
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(UserUpdateDto dto, @MappingTarget User user);
}
