-- Setup Test Data for CoTo User Service API Testing
-- Run this script before running Postman tests

-- Create test units
INSERT INTO units (unit_code, unit_name, description, address, phone_number, is_active, created_at, updated_at) 
VALUES 
    ('ADMIN', 'Administration', 'System Administration Unit', 'Building A, Floor 1', '0123456780', true, NOW(), NOW()),
    ('HR_DEPT', 'Human Resources', 'Human Resources Department', 'Building A, Floor 2', '0123456781', true, NOW(), NOW()),
    ('FINANCE', 'Finance Department', 'Finance and Accounting', 'Building B, Floor 1', '0123456782', true, NOW(), NOW())
ON CONFLICT (unit_code) DO NOTHING;

-- Create admin user (password: Admin123456)
-- BCrypt hash for "Admin123456" with strength 12
INSERT INTO users (username, full_name, email, password_hash, unit_id, role, phone_number, is_active, created_at, updated_at)
VALUES (
    'admin',
    'System Administrator',
    'admin@cotowork.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfBPdkJ8jAlK3AK', -- Admin123456
    (SELECT id FROM units WHERE unit_code = 'ADMIN'),
    'ADMIN',
    '0123456789',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (username) DO NOTHING;

-- Create test manager user (password: Manager123456)
-- BCrypt hash for "Manager123456" with strength 12
INSERT INTO users (username, full_name, email, password_hash, unit_id, role, phone_number, is_active, created_at, updated_at)
VALUES (
    'manager',
    'HR Manager',
    'manager@cotowork.com',
    '$2a$12$8Ry3o1zqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfBPdkJ8jAlK3BL', -- Manager123456
    (SELECT id FROM units WHERE unit_code = 'HR_DEPT'),
    'MANAGER',
    '0123456788',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (username) DO NOTHING;

-- Create test staff user (password: Staff123456)
-- BCrypt hash for "Staff123456" with strength 12
INSERT INTO users (username, full_name, email, password_hash, unit_id, role, phone_number, is_active, created_at, updated_at)
VALUES (
    'staff',
    'Finance Staff',
    'staff@cotowork.com',
    '$2a$12$9Sz4p2aqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfBPdkJ8jAlK3CM', -- Staff123456
    (SELECT id FROM units WHERE unit_code = 'FINANCE'),
    'STAFF',
    '0123456787',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (username) DO NOTHING;

-- Verify data
SELECT 'Units created:' as info;
SELECT id, unit_code, unit_name FROM units WHERE unit_code IN ('ADMIN', 'HR_DEPT', 'FINANCE');

SELECT 'Users created:' as info;
SELECT id, username, full_name, role, u.unit_name 
FROM users us 
JOIN units u ON us.unit_id = u.id 
WHERE us.username IN ('admin', 'manager', 'staff');

-- Display login credentials for testing
SELECT 'Login Credentials for Testing:' as info;
SELECT 
    username,
    'Password: ' || 
    CASE 
        WHEN username = 'admin' THEN 'Admin123456'
        WHEN username = 'manager' THEN 'Manager123456'
        WHEN username = 'staff' THEN 'Staff123456'
    END as password,
    role,
    full_name
FROM users 
WHERE username IN ('admin', 'manager', 'staff')
ORDER BY 
    CASE role 
        WHEN 'ADMIN' THEN 1 
        WHEN 'MANAGER' THEN 2 
        WHEN 'STAFF' THEN 3 
    END;