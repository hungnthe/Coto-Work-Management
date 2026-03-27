package com.cotowork.userservice.controller;

import com.cotowork.userservice.dto.UnitCreateDto;
import com.cotowork.userservice.dto.UnitResponseDto;
import com.cotowork.userservice.dto.UnitSummaryDto;
import com.cotowork.userservice.service.UnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Unit management
 * Uses Role-Based Access Control (RBAC) for authorization
 */
@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
@Slf4j
public class UnitController {
    
    private final UnitService unitService;
    
    @GetMapping
    @PreAuthorize("hasAuthority('unit:read')")
    public ResponseEntity<List<UnitSummaryDto>> getAllUnits() {
        log.info("GET /api/units - Fetching all units");
        List<UnitSummaryDto> units = unitService.getAllUnits();
        return ResponseEntity.ok(units);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('unit:read')")
    public ResponseEntity<UnitResponseDto> getUnitById(@PathVariable Long id) {
        log.info("GET /api/units/{} - Fetching unit by id", id);
        UnitResponseDto unit = unitService.getUnitById(id);
        return ResponseEntity.ok(unit);
    }
    
    @GetMapping("/code/{unitCode}")
    @PreAuthorize("hasAuthority('unit:read')")
    public ResponseEntity<UnitResponseDto> getUnitByCode(@PathVariable String unitCode) {
        log.info("GET /api/units/code/{} - Fetching unit by code", unitCode);
        UnitResponseDto unit = unitService.getUnitByCode(unitCode);
        return ResponseEntity.ok(unit);
    }
    
    @PostMapping
    @PreAuthorize("hasAuthority('unit:create')")
    public ResponseEntity<UnitResponseDto> createUnit(@Valid @RequestBody UnitCreateDto dto) {
        log.info("POST /api/units - Creating new unit");
        UnitResponseDto unit = unitService.createUnit(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(unit);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('unit:update')")
    public ResponseEntity<UnitResponseDto> updateUnit(
            @PathVariable Long id,
            @Valid @RequestBody UnitCreateDto dto) {
        log.info("PUT /api/units/{} - Updating unit", id);
        UnitResponseDto unit = unitService.updateUnit(id, dto);
        return ResponseEntity.ok(unit);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('unit:delete')")
    public ResponseEntity<Void> deleteUnit(@PathVariable Long id) {
        log.info("DELETE /api/units/{} - Deleting unit", id);
        unitService.deleteUnit(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/parent/{parentId}")
    @PreAuthorize("hasAuthority('unit:read')")
    public ResponseEntity<List<UnitSummaryDto>> getChildUnits(@PathVariable Long parentId) {
        log.info("GET /api/units/parent/{} - Fetching child units", parentId);
        List<UnitSummaryDto> units = unitService.getChildUnits(parentId);
        return ResponseEntity.ok(units);
    }
    
    @GetMapping("/roots")
    @PreAuthorize("hasAuthority('unit:read')")
    public ResponseEntity<List<UnitSummaryDto>> getRootUnits() {
        log.info("GET /api/units/roots - Fetching root units");
        List<UnitSummaryDto> units = unitService.getRootUnits();
        return ResponseEntity.ok(units);
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasAuthority('unit:read')")
    public ResponseEntity<List<UnitSummaryDto>> searchUnits(@RequestParam String keyword) {
        log.info("GET /api/units/search?keyword={} - Searching units", keyword);
        List<UnitSummaryDto> units = unitService.searchUnits(keyword);
        return ResponseEntity.ok(units);
    }
}
