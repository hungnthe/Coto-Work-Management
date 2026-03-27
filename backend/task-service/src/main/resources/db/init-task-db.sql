-- ============================================================
-- TASK SERVICE - Database Initialization
-- File: init.sql
-- Mount vào: /docker-entrypoint-initdb.d/init.sql
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- 2. ENUM TYPES
-- ============================================================
DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- 3. TASKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
                                     id              BIGSERIAL       PRIMARY KEY,
                                     title           VARCHAR(300)    NOT NULL,
                                     description     VARCHAR(2000),
                                     start_date      DATE,
                                     due_date        DATE,
                                     start_time      TIME,
                                     end_time        TIME,
                                     status          VARCHAR(20)     NOT NULL DEFAULT 'TODO',
                                     priority        VARCHAR(20)     NOT NULL DEFAULT 'MEDIUM',
                                     category        VARCHAR(20)     DEFAULT 'work',
                                     assignee_id     BIGINT,
                                     assignee_name   VARCHAR(100),
                                     creator_id      BIGINT          NOT NULL,
                                     creator_name    VARCHAR(100),
                                     unit_id         BIGINT,
                                     unit_name       VARCHAR(200),
                                     is_all_day      BOOLEAN         NOT NULL DEFAULT FALSE,
                                     location        VARCHAR(200),
                                     is_completed    BOOLEAN         NOT NULL DEFAULT FALSE,
                                     completed_at    TIMESTAMP,
                                     created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. NOTIFICATIONS TABLE (MỚI THÊM)
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
                                             id              BIGSERIAL       PRIMARY KEY,
                                             recipient_id    BIGINT          NOT NULL,
                                             recipient_name  VARCHAR(100),
                                             sender_id       BIGINT          NOT NULL,
                                             sender_name     VARCHAR(100),
                                             title           VARCHAR(300)    NOT NULL,
                                             message         TEXT,
                                             type            VARCHAR(30)     NOT NULL DEFAULT 'TASK_ASSIGNED',
                                             task_id         BIGINT,
                                             task_title      VARCHAR(300),
                                             is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
                                             read_at         TIMESTAMP,
                                             created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. INDEXES - TASKS
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_task_assignee       ON tasks (assignee_id);
CREATE INDEX IF NOT EXISTS idx_task_creator        ON tasks (creator_id);
CREATE INDEX IF NOT EXISTS idx_task_due_date       ON tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_task_start_date     ON tasks (start_date);
CREATE INDEX IF NOT EXISTS idx_task_status         ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_task_priority       ON tasks (priority);
CREATE INDEX IF NOT EXISTS idx_task_unit           ON tasks (unit_id);
CREATE INDEX IF NOT EXISTS idx_task_completed      ON tasks (is_completed);
CREATE INDEX IF NOT EXISTS idx_task_category       ON tasks (category);
CREATE INDEX IF NOT EXISTS idx_task_date_range     ON tasks (start_date, due_date);
CREATE INDEX IF NOT EXISTS idx_task_assignee_date  ON tasks (assignee_id, start_date, due_date);
CREATE INDEX IF NOT EXISTS idx_task_creator_date   ON tasks (creator_id, start_date, due_date);
CREATE INDEX IF NOT EXISTS idx_task_unit_date      ON tasks (unit_id, start_date, due_date);
CREATE INDEX IF NOT EXISTS idx_task_title_trgm     ON tasks USING gin (title gin_trgm_ops);

-- ============================================================
-- 6. INDEXES - NOTIFICATIONS
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_notif_recipient     ON notifications (recipient_id);
CREATE INDEX IF NOT EXISTS idx_notif_unread        ON notifications (recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notif_created       ON notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_task          ON notifications (task_id);

-- ============================================================
-- 7. TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tasks_updated_at ON tasks;
CREATE TRIGGER trigger_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 8. SEED DATA
-- ============================================================
INSERT INTO tasks (title, description, start_date, due_date, start_time, end_time,
                   status, priority, category, assignee_id, assignee_name,
                   creator_id, creator_name, unit_id, unit_name, is_all_day, location)
VALUES
    ('Họp giao ban đầu tuần', 'Họp tổng kết công việc tuần trước và phân công tuần mới',
     CURRENT_DATE, CURRENT_DATE, '08:00', '09:00', 'TODO', 'HIGH', 'meeting',
     1, 'Admin', 1, 'Admin', 1, 'Phòng Hành chính', FALSE, 'Phòng họp A1'),
    ('Báo cáo tiến độ dự án Cô Tô', 'Hoàn thành báo cáo tiến độ tháng cho ban lãnh đạo',
     CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days', '09:00', '17:00', 'IN_PROGRESS', 'URGENT', 'deadline',
     1, 'Admin', 1, 'Admin', 1, 'Phòng Hành chính', FALSE, NULL),
    ('Kiểm tra hạ tầng CNTT', 'Kiểm tra server, network, backup hệ thống',
     CURRENT_DATE, CURRENT_DATE, '10:00', '12:00', 'TODO', 'MEDIUM', 'work',
     1, 'Admin', 1, 'Admin', 1, 'Phòng Hành chính', FALSE, 'Phòng server'),
    ('Đào tạo nhân viên mới', 'Hướng dẫn sử dụng hệ thống quản lý cho nhân viên mới',
     CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '3 days', '14:00', '16:00', 'TODO', 'MEDIUM', 'event',
     1, 'Admin', 1, 'Admin', 1, 'Phòng Hành chính', FALSE, 'Phòng đào tạo B2'),
    ('Cập nhật tài liệu quy trình', 'Cập nhật SOP cho quy trình xử lý công việc mới',
     CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', NULL, NULL, 'TODO', 'LOW', 'work',
     1, 'Admin', 1, 'Admin', 1, 'Phòng Hành chính', TRUE, NULL),
    ('Review code sprint 5', 'Review pull requests và merge vào nhánh chính',
     CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '8 days', '08:30', '12:00', 'TODO', 'MEDIUM', 'work',
     1, 'Admin', 1, 'Admin', 1, 'Phòng Hành chính', FALSE, NULL),
    ('Bảo trì hệ thống định kỳ', 'Backup database, cập nhật patches, kiểm tra logs',
     CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '5 days', '22:00', '23:59', 'TODO', 'HIGH', 'deadline',
     1, 'Admin', 1, 'Admin', 1, 'Phòng Hành chính', FALSE, 'Remote'),
    ('Hoàn thành khóa học online', 'Khóa học Spring Boot Microservices trên Udemy',
     CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', NULL, NULL, 'IN_PROGRESS', 'LOW', 'personal',
     1, 'Admin', 1, 'Admin', NULL, NULL, TRUE, NULL),
    ('Cài đặt môi trường dev', 'Setup Docker, PostgreSQL, IDE cho team',
     CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '1 day', NULL, NULL, 'COMPLETED', 'MEDIUM', 'work',
     1, 'Admin', 1, 'Admin', 1, 'Phòng Hành chính', TRUE, NULL)
ON CONFLICT DO NOTHING;

UPDATE tasks
SET is_completed = TRUE, completed_at = CURRENT_TIMESTAMP
WHERE status = 'COMPLETED' AND is_completed = FALSE;

-- ============================================================
-- 9. VERIFY
-- ============================================================
DO $$
    DECLARE
        task_count         INTEGER;
        notif_table_exists BOOLEAN;
    BEGIN
        SELECT COUNT(*) INTO task_count FROM tasks;
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_name = 'notifications'
        ) INTO notif_table_exists;
        RAISE NOTICE '✅ tasks: % rows | notifications table: %', task_count, notif_table_exists;
    END $$;