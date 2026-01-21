-- User Service Database Initialization Script
-- Run this script to create the user_db database and initial data

-- Create database (run as postgres superuser)
-- CREATE DATABASE user_db;

-- Connect to user_db
\c user_db;

-- Create tables (Spring JPA will auto-create, but this is for reference)

-- Units table
CREATE TABLE IF NOT EXISTS units (
    id BIGSERIAL PRIMARY KEY,
    unit_code VARCHAR(50) UNIQUE NOT NULL,
    unit_name VARCHAR(200) NOT NULL,
    parent_unit_id BIGINT REFERENCES units(id),
    description VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    address VARCHAR(100),
    phone_number VARCHAR(20)
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    unit_id BIGINT NOT NULL REFERENCES units(id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'UNIT_MANAGER', 'STAFF', 'VIEWER')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    phone_number VARCHAR(20),
    avatar_url VARCHAR(500)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_unit_id ON users(unit_id);
CREATE INDEX IF NOT EXISTS idx_unit_code ON units(unit_code);
CREATE INDEX IF NOT EXISTS idx_parent_unit ON units(parent_unit_id);

-- Insert sample data

-- Root unit
INSERT INTO units (unit_code, unit_name, description, is_active) 
VALUES ('ROOT', 'Sở Thông tin và Truyền thông', 'Đơn vị cấp cao nhất', true)
ON CONFLICT (unit_code) DO NOTHING;

-- Child units
INSERT INTO units (unit_code, unit_name, parent_unit_id, description, is_active)
VALUES 
    ('IT_DEPT', 'Phòng Công nghệ Thông tin', 1, 'Quản lý hệ thống IT', true),
    ('HR_DEPT', 'Phòng Tổ chức Hành chính', 1, 'Quản lý nhân sự', true),
    ('FINANCE_DEPT', 'Phòng Tài chính Kế toán', 1, 'Quản lý tài chính', true)
ON CONFLICT (unit_code) DO NOTHING;

-- Sample users (password: Admin@123 - BCrypt hashed)
-- Note: In production, create users via API to ensure proper password hashing
INSERT INTO users (username, full_name, email, password_hash, unit_id, role, is_active)
VALUES 
    ('admin', 'System Administrator', 'admin@cotowork.vn', 
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIR.ub4W8u', 
     1, 'ADMIN', true),
    ('manager_it', 'IT Manager', 'it.manager@cotowork.vn',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIR.ub4W8u',
     2, 'UNIT_MANAGER', true),
    ('staff_it', 'IT Staff', 'it.staff@cotowork.vn',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIR.ub4W8u',
     2, 'STAFF', true)
ON CONFLICT (username) DO NOTHING;

-- Verify data
SELECT 'Units created:' as info, COUNT(*) as count FROM units;
SELECT 'Users created:' as info, COUNT(*) as count FROM users;

COMMENT ON TABLE users IS 'User accounts with BCrypt hashed passwords';
COMMENT ON TABLE units IS 'Organizational units (departments)';
COMMENT ON COLUMN users.password_hash IS 'BCrypt hashed password - NEVER expose in API responses';
