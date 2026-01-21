package com.cotowork.userservice.repository;

import com.cotowork.userservice.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {
    
    Optional<Unit> findByUnitCode(String unitCode);
    
    boolean existsByUnitCode(String unitCode);
    
    List<Unit> findByParentUnitId(Long parentUnitId);
    
    List<Unit> findByIsActive(Boolean isActive);
    
    @Query("SELECT u FROM Unit u WHERE u.parentUnitId IS NULL")
    List<Unit> findRootUnits();
    
    @Query("SELECT u FROM Unit u WHERE u.unitName LIKE %:keyword% OR u.unitCode LIKE %:keyword%")
    List<Unit> searchUnits(@Param("keyword") String keyword);
}
