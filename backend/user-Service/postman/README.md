# Postman Collections for CoTo User Service

## Collections

### 1. Frontend Type Safety Verification ⭐ MỚI

**File:** `Frontend-Type-Safety-Verification.postman_collection.json`

**Mục đích:** Verify backend JSON response format để đảm bảo compatibility với frontend TypeScript types.

**Sử dụng:**
1. Import collection và environment vào Postman
2. Chọn environment: "Frontend Type Safety Verification Environment"
3. Đọc hướng dẫn chi tiết trong: `TYPE-VERIFICATION-GUIDE.md`
4. Chạy từng request và ghi lại kết quả
5. So sánh với frontend types và update nếu cần

**Critical Checks:**
- ✅ ID types (number vs string)
- ✅ UserRole enum values
- ✅ Permission format
- ✅ Nullable fields
- ✅ Date serialization format
- ✅ JWT token structure

---

## Environment

**File:** `Frontend-Type-Safety-Verification.postman_environment.json`

**Variables:**
- `baseUrl`: http://localhost:8083/api
- `accessToken`: Auto-saved after login
- `refreshToken`: Auto-saved after login

---

## Quick Start

### 1. Start Backend
```bash
cd backend
mvn spring-boot:run
```

### 2. Import vào Postman
- Import collection: `Frontend-Type-Safety-Verification.postman_collection.json`
- Import environment: `Frontend-Type-Safety-Verification.postman_environment.json`

### 3. Run Verification
1. Select environment
2. Run "1.1 Health Check"
3. Run "1.2 Login" → tokens auto-saved
4. Run remaining requests
5. Verify response formats

### 4. Check Results
- Xem `TYPE-VERIFICATION-GUIDE.md` để biết cách verify
- Điền checklist trong guide
- So sánh với `../.kiro/specs/frontend-api-type-safety/BACKEND_FRONTEND_COMPARISON_REPORT.md`

---

## Requests Overview

### Authentication (3 requests)
1. Health Check
2. Login - Verify Response Format
3. Refresh Token - Verify Response Format

### User Operations (2 requests)
1. Get All Users - Verify Array Response
2. Get User By ID - Verify Single Response

### Unit Operations (2 requests)
1. Get All Units - Verify Array Response
2. Get Unit By ID - Verify Single Response

**Total:** 7 requests

---

## Expected Issues (Based on Code Analysis)

### 🔴 Critical Issues

1. **ID Types Mismatch**
   - Backend: `Long` (number)
   - Frontend: `string`
   - **Fix:** Change frontend to `number`

2. **UserRole Enum Mismatch**
   - Backend: `ADMIN`, `UNIT_MANAGER`, `STAFF`, `VIEWER`
   - Frontend: `ADMIN`, `USER`, `MANAGER`, `VIEWER`
   - **Fix:** Sync enums

3. **Permission Format Mismatch**
   - Backend: `"user:read"`, `"unit:create"`
   - Frontend: `"USER_READ"`, `"UNIT_WRITE"`
   - **Fix:** Update frontend enum

### ⚠️ Medium Issues

4. **Nullable Boolean**
   - Backend: `Boolean` (can be null)
   - Frontend: `boolean` (not null)
   - **Fix:** Change to `boolean | null` or ensure backend never returns null

---

## Troubleshooting

### Backend not running
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Login failed
Check if admin user exists in database:
```sql
SELECT * FROM users WHERE username = 'admin';
```

### 401 Unauthorized
Token expired. Re-run login request.

---

## Next Steps After Verification

1. ✅ Complete checklist in `TYPE-VERIFICATION-GUIDE.md`
2. ✅ Update `BACKEND_FRONTEND_COMPARISON_REPORT.md` with actual values
3. ✅ Fix frontend type definitions based on actual backend response
4. ✅ Re-run TypeScript compiler
5. ✅ Test frontend integration with backend

---

## Files in This Directory

- `Frontend-Type-Safety-Verification.postman_collection.json` - Main collection
- `Frontend-Type-Safety-Verification.postman_environment.json` - Environment variables
- `TYPE-VERIFICATION-GUIDE.md` - Detailed verification guide with checklist
- `README.md` - This file
- `setup-test-data.sql` - SQL script to setup test data (if needed)

---

## Support

Nếu có vấn đề:
1. Kiểm tra backend logs
2. Verify database connection
3. Check JWT configuration
4. Review `TYPE-VERIFICATION-GUIDE.md` troubleshooting section
