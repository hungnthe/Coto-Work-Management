package com.cotowork.taskservice.repository;

import com.cotowork.taskservice.entity.Task;
import com.cotowork.taskservice.entity.TaskPriority;
import com.cotowork.taskservice.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // ============================================================
    // CALENDAR - Lấy task theo khoảng ngày
    // ============================================================

    @Query("SELECT t FROM Task t WHERE " +
            "t.assigneeId = :userId AND (" +
            "(t.startDate <= :rangeEnd AND t.dueDate >= :rangeStart) OR " +
            "(t.startDate IS NULL AND t.dueDate >= :rangeStart AND t.dueDate <= :rangeEnd) OR " +
            "(t.dueDate IS NULL AND t.startDate >= :rangeStart AND t.startDate <= :rangeEnd))")
    List<Task> findByAssigneeAndDateRange(@Param("userId") Long userId,
                                          @Param("rangeStart") LocalDate rangeStart,
                                          @Param("rangeEnd") LocalDate rangeEnd);

    @Query("SELECT t FROM Task t WHERE " +
            "t.creatorId = :userId AND (" +
            "(t.startDate <= :rangeEnd AND t.dueDate >= :rangeStart) OR " +
            "(t.startDate IS NULL AND t.dueDate >= :rangeStart AND t.dueDate <= :rangeEnd) OR " +
            "(t.dueDate IS NULL AND t.startDate >= :rangeStart AND t.startDate <= :rangeEnd))")
    List<Task> findByCreatorAndDateRange(@Param("userId") Long userId,
                                         @Param("rangeStart") LocalDate rangeStart,
                                         @Param("rangeEnd") LocalDate rangeEnd);

    @Query("SELECT t FROM Task t WHERE " +
            "(t.startDate <= :rangeEnd AND t.dueDate >= :rangeStart) OR " +
            "(t.startDate IS NULL AND t.dueDate >= :rangeStart AND t.dueDate <= :rangeEnd) OR " +
            "(t.dueDate IS NULL AND t.startDate >= :rangeStart AND t.startDate <= :rangeEnd)")
    List<Task> findAllInDateRange(@Param("rangeStart") LocalDate rangeStart,
                                  @Param("rangeEnd") LocalDate rangeEnd);

    @Query("SELECT t FROM Task t WHERE " +
            "t.unitId = :unitId AND (" +
            "(t.startDate <= :rangeEnd AND t.dueDate >= :rangeStart) OR " +
            "(t.startDate IS NULL AND t.dueDate >= :rangeStart AND t.dueDate <= :rangeEnd) OR " +
            "(t.dueDate IS NULL AND t.startDate >= :rangeStart AND t.startDate <= :rangeEnd))")
    List<Task> findByUnitAndDateRange(@Param("unitId") Long unitId,
                                      @Param("rangeStart") LocalDate rangeStart,
                                      @Param("rangeEnd") LocalDate rangeEnd);

    // ============================================================
    // BASIC
    // ============================================================

    List<Task> findByAssigneeId(Long assigneeId);
    List<Task> findByCreatorId(Long creatorId);
    List<Task> findByStatus(TaskStatus status);
    List<Task> findByUnitId(Long unitId);

    @Query("SELECT t FROM Task t WHERE t.dueDate < :today AND t.status != 'COMPLETED' AND t.status != 'CANCELLED'")
    List<Task> findOverdueTasks(@Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.assigneeId = :userId OR t.creatorId = :userId")
    List<Task> findMyTasks(@Param("userId") Long userId);

    @Query("SELECT t FROM Task t WHERE t.title LIKE %:keyword% OR t.description LIKE %:keyword%")
    List<Task> searchTasks(@Param("keyword") String keyword);

    long countByStatus(TaskStatus status);
    long countByAssigneeIdAndStatus(Long assigneeId, TaskStatus status);

    @Query("SELECT t FROM Task t WHERE " +
            "(:status IS NULL OR t.status = :status) AND " +
            "(:priority IS NULL OR t.priority = :priority) AND " +
            "(:assigneeId IS NULL OR t.assigneeId = :assigneeId) AND " +
            "(:unitId IS NULL OR t.unitId = :unitId)")
    Page<Task> findByFilters(@Param("status") TaskStatus status,
                             @Param("priority") TaskPriority priority,
                             @Param("assigneeId") Long assigneeId,
                             @Param("unitId") Long unitId,
                             Pageable pageable);
}