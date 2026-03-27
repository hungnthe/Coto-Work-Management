package com.cotowork.userservice.service;

import com.cotowork.userservice.dto.UnitCreateDto;
import com.cotowork.userservice.dto.UnitResponseDto;
import com.cotowork.userservice.dto.UnitSummaryDto;
import com.cotowork.userservice.entity.Unit;
import com.cotowork.userservice.exception.DuplicateResourceException;
import com.cotowork.userservice.exception.ResourceNotFoundException;
import com.cotowork.userservice.mapper.UnitMapper;
import com.cotowork.userservice.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UnitService {
    
    private final UnitRepository unitRepository;
    private final UnitMapper unitMapper;
    
    public List<UnitSummaryDto> getAllUnits() {
        log.info("Fetching all units");
        List<Unit> units = unitRepository.findAll();
        return unitMapper.toSummaryDtoList(units);
    }
    
    public UnitResponseDto getUnitById(Long id) {
        log.info("Fetching unit with id: {}", id);
        Unit unit = unitRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));
        return unitMapper.toResponseDto(unit);
    }
    
    public UnitResponseDto getUnitByCode(String unitCode) {
        log.info("Fetching unit with code: {}", unitCode);
        Unit unit = unitRepository.findByUnitCode(unitCode)
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found with code: " + unitCode));
        return unitMapper.toResponseDto(unit);
    }
    
    @Transactional
    public UnitResponseDto createUnit(UnitCreateDto dto) {
        log.info("Creating new unit with code: {}", dto.getUnitCode());
        
        if (unitRepository.existsByUnitCode(dto.getUnitCode())) {
            throw new DuplicateResourceException("Unit code already exists: " + dto.getUnitCode());
        }
        
        // Verify parent unit exists if specified
        if (dto.getParentUnitId() != null) {
            unitRepository.findById(dto.getParentUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent unit not found with id: " + dto.getParentUnitId()));
        }
        
        Unit unit = unitMapper.toEntity(dto);
        Unit savedUnit = unitRepository.save(unit);
        
        log.info("Unit created successfully with id: {}", savedUnit.getId());
        return unitMapper.toResponseDto(savedUnit);
    }
    
    @Transactional
    public UnitResponseDto updateUnit(Long id, UnitCreateDto dto) {
        log.info("Updating unit with id: {}", id);
        
        Unit unit = unitRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));
        
        // Check unit code uniqueness if changed
        if (!dto.getUnitCode().equals(unit.getUnitCode())) {
            if (unitRepository.existsByUnitCode(dto.getUnitCode())) {
                throw new DuplicateResourceException("Unit code already exists: " + dto.getUnitCode());
            }
        }
        
        // Verify parent unit exists if changed
        if (dto.getParentUnitId() != null && !dto.getParentUnitId().equals(unit.getParentUnitId())) {
            unitRepository.findById(dto.getParentUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent unit not found with id: " + dto.getParentUnitId()));
        }
        
        unitMapper.updateEntityFromDto(dto, unit);
        Unit updatedUnit = unitRepository.save(unit);
        
        log.info("Unit updated successfully with id: {}", updatedUnit.getId());
        return unitMapper.toResponseDto(updatedUnit);
    }
    
    @Transactional
    public void deleteUnit(Long id) {
        log.info("Deleting unit with id: {}", id);
        
        Unit unit = unitRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));
        
        unit.setIsActive(false);
        unitRepository.save(unit);
        
        log.info("Unit soft deleted successfully with id: {}", id);
    }
    
    public List<UnitSummaryDto> getChildUnits(Long parentId) {
        log.info("Fetching child units for parent id: {}", parentId);
        List<Unit> units = unitRepository.findByParentUnitId(parentId);
        return unitMapper.toSummaryDtoList(units);
    }
    
    public List<UnitSummaryDto> getRootUnits() {
        log.info("Fetching root units");
        List<Unit> units = unitRepository.findRootUnits();
        return unitMapper.toSummaryDtoList(units);
    }
    
    public List<UnitSummaryDto> searchUnits(String keyword) {
        log.info("Searching units with keyword: {}", keyword);
        List<Unit> units = unitRepository.searchUnits(keyword);
        return unitMapper.toSummaryDtoList(units);
    }
}
