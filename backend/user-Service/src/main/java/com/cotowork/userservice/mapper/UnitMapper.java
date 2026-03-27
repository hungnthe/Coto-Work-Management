package com.cotowork.userservice.mapper;

import com.cotowork.userservice.dto.*;
import com.cotowork.userservice.entity.Unit;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UnitMapper {
    
    /**
     * Convert Unit entity to UnitResponseDto
     * Note: Users field is not included to avoid circular reference
     */
    UnitResponseDto toResponseDto(Unit unit);
    
    /**
     * Convert Unit entity to UnitSummaryDto (lightweight, no users)
     */
    UnitSummaryDto toSummaryDto(Unit unit);
    
    List<UnitResponseDto> toResponseDtoList(List<Unit> units);
    
    List<UnitSummaryDto> toSummaryDtoList(List<Unit> units);
    
    /**
     * Convert UnitCreateDto to Unit entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "users", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "isActive", ignore = true) // Will be set to true by default in entity
    Unit toEntity(UnitCreateDto dto);
    
    /**
     * Update existing Unit entity from UnitCreateDto
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "users", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "isActive", ignore = true) // isActive should not be updated via this method
    void updateEntityFromDto(UnitCreateDto dto, @MappingTarget Unit unit);
}
