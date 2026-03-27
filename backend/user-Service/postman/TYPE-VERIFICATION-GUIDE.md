# Frontend Type Safety Verification Guide

## Mục Đích

Collection này được tạo để verify format JSON response từ backend trước khi test với frontend TypeScript. Mục tiêu là xác định chính xác:

1. **ID Types:** Backend trả về `number` hay `string`?
2. **Enum Values:** UserRole và Permission có giá trị gì?
3. **Nullable Fields:** Field nào có thể null?
4. **Date Format:** LocalDateTime serialize thành format gì?
5. **JWT Structure:** Token có chứa đúng claims không?

---

## Setup

### 1. Import vào Postman

1. Mở Postman
2. Click **Import** button
3. Chọn file: `Frontend-Type-Safety-Verification.postman_collection.json`
4. Chọn file: `Frontend-Type-Safety-Verification.postman_environment.json`

### 2. Chọn Environment

1. Click dropdown ở góc trên bên phải
2. Chọn: **Frontend Type Safety Verification Environment**

### 3. Đảm Bảo Backend Đang Chạy

```bash
# Kiểm tra backend
curl http://localhost:8083/api/auth/health
```

Nếu backend chưa chạy:
```bash
cd backend
mvn spring-boot:run
```

---

## Cách Sử Dụng

### Bước 1: Run Health Check

1. Mở folder **1. Authentication**
2. Click request **1.1 Health Check**
3. Click **Send**
4. Verify response: `"Authentication service is healthy"`

### Bước 2: Login và Verify Response Format

1. Click request **1.2 Login - Verify Response Format**
2. Click **Send**
3. **QUAN TRỌNG:** Xem tab **Body** của response

#### Kiểm Tra Chi Tiết Response:

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": ???,          // ← Kiểm tra: number hay null?
  "userId": ???,             // ← CRITICAL: number hay string?
  "username": "admin",
  "fullName": "Administrator",
  "email": "admin@example.com",
  "role": "???",             // ← CRITICAL: ADMIN, UNIT_MANAGER, STAFF, hay VIEWER?
  "unitId": ???,             // ← CRITICAL: number hay string?
  "unitName": "Root Unit",
  "permissions": [           // ← CRITICAL: format gì?
    "???",                   // "user:read" hay "USER_READ"?
    "???"
  ]
}
```

#### Ghi Chú Kết Quả:

| Field | Expected (Frontend) | Actual (Backend) | Match? |
|-------|---------------------|------------------|--------|
| userId | string | ??? | ❌/✅ |
| unitId | string | ??? | ❌/✅ |
| expiresIn | number | ??? | ❌/✅ |
| role | ADMIN/USER/MANAGER/VIEWER | ??? | ❌/✅ |
| permissions[0] | USER_READ | ??? | ❌/✅ |

### Bước 3: Decode JWT Token (Quan Trọng!)

1. Copy giá trị `accessToken` từ response
2. Vào https://jwt.io
3. Paste token vào decoder
4. Kiểm tra payload:

```json
{
  "sub": "admin",
  "userId": ???,           // ← Kiểm tra type
  "role": "???",           // ← Kiểm tra value
  "unitId": ???,           // ← Kiểm tra type
  "permissions": [         // ← Kiểm tra format
    "???"
  ],
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Lưu ý:** JWT payload luôn serialize number thành number, không phải string!

### Bước 4: Test Refresh Token

1. Click request **1.3 Refresh Token - Verify Response Format**
2. Click **Send**
3. Verify response format giống như login response

### Bước 5: Get All Users

1. Mở folder **2. User Operations**
2. Click request **2.1 Get All Users - Verify Array Response**
3. Click **Send**
4. **QUAN TRỌNG:** Xem response array

#### Kiểm Tra Chi Tiết User Object:

```json
[
  {
    "id": ???,                    // ← CRITICAL: number hay string?
    "username": "admin",
    "fullName": "Administrator",
    "email": "admin@example.com",
    "unit": {
      "id": ???,                  // ← CRITICAL: number hay string?
      "unitCode": "ROOT",
      "unitName": "Root Unit",
      "parentUnitId": ???         // ← CRITICAL: number, string, hay null?
    },
    "role": "???",                // ← CRITICAL: enum value?
    "isActive": ???,              // ← Kiểm tra: true/false hay có thể null?
    "createdAt": "???",           // ← Kiểm tra format: ISO 8601?
    "updatedAt": "???",           // ← Kiểm tra format: ISO 8601?
    "phoneNumber": ???,           // ← Có thể null?
    "avatarUrl": ???              // ← Có thể null?
  }
]
```

#### Ghi Chú Kết Quả:

| Field | Expected (Frontend) | Actual (Backend) | Match? |
|-------|---------------------|------------------|--------|
| id | string | ??? | ❌/✅ |
| unit.id | string | ??? | ❌/✅ |
| unit.parentUnitId | string \| null | ??? | ❌/✅ |
| role | enum | ??? | ❌/✅ |
| isActive | boolean | ??? | ❌/✅ |
| createdAt | ISO 8601 string | ??? | ❌/✅ |
| phoneNumber | string \| null | ??? | ❌/✅ |

### Bước 6: Get All Units

1. Mở folder **3. Unit Operations**
2. Click request **3.1 Get All Units - Verify Array Response**
3. Click **Send**
4. Verify response format

#### Kiểm Tra Chi Tiết Unit Object:

```json
[
  {
    "id": ???,                    // ← CRITICAL: number hay string?
    "unitCode": "ROOT",
    "unitName": "Root Unit",
    "parentUnitId": ???,          // ← CRITICAL: number, string, hay null?
    "description": ???,           // ← Có thể null?
    "isActive": ???,              // ← true/false hay có thể null?
    "createdAt": "???",           // ← ISO 8601?
    "updatedAt": "???",           // ← ISO 8601?
    "address": ???,               // ← Có thể null?
    "phoneNumber": ???            // ← Có thể null?
  }
]
```

---

## Checklist Verification

Sau khi chạy tất cả requests, điền vào checklist này:

### ✅ Authentication (Login Response)

- [ ] `userId` type: __________ (number/string)
- [ ] `unitId` type: __________ (number/string)
- [ ] `expiresIn` type: __________ (number/null/number|null)
- [ ] `role` value: __________ (ADMIN/UNIT_MANAGER/STAFF/VIEWER)
- [ ] `permissions` format: __________ (user:read / USER_READ)
- [ ] `tokenType` value: __________ (Bearer)

### ✅ JWT Token Claims

- [ ] JWT `userId` type: __________ (number/string)
- [ ] JWT `unitId` type: __________ (number/string)
- [ ] JWT `role` value: __________
- [ ] JWT `permissions` format: __________

### ✅ User Response

- [ ] `id` type: __________ (number/string)
- [ ] `unit.id` type: __________ (number/string)
- [ ] `unit.parentUnitId` type: __________ (number/string/null)
- [ ] `role` value: __________
- [ ] `isActive` nullable: __________ (yes/no)
- [ ] `createdAt` format: __________ (ISO 8601?)
- [ ] `updatedAt` format: __________ (ISO 8601?)
- [ ] `phoneNumber` nullable: __________ (yes/no)
- [ ] `avatarUrl` nullable: __________ (yes/no)

### ✅ Unit Response

- [ ] `id` type: __________ (number/string)
- [ ] `parentUnitId` type: __________ (number/string/null)
- [ ] `isActive` nullable: __________ (yes/no)
- [ ] `createdAt` format: __________ (ISO 8601?)
- [ ] `updatedAt` format: __________ (ISO 8601?)
- [ ] `description` nullable: __________ (yes/no)
- [ ] `address` nullable: __________ (yes/no)
- [ ] `phoneNumber` nullable: __________ (yes/no)

---

## Kết Quả Mong Đợi

Dựa trên phân tích code backend, kết quả dự kiến:

### ID Types
- ✅ Backend trả về `Long` → JSON serialize thành **number**
- ❌ Frontend expect **string**
- **Action:** Cần thay đổi frontend từ `string` sang `number`

### UserRole Enum
- ✅ Backend có: `ADMIN`, `UNIT_MANAGER`, `STAFF`, `VIEWER`
- ❌ Frontend có: `ADMIN`, `USER`, `MANAGER`, `VIEWER`
- **Action:** Cần đồng bộ enum

### Permission Format
- ✅ Backend format: `"user:read"`, `"unit:create"`, etc.
- ❌ Frontend format: `"USER_READ"`, `"UNIT_WRITE"`, etc.
- **Action:** Cần thay đổi frontend Permission enum

### Date Format
- ✅ Backend `LocalDateTime` → JSON serialize thành ISO 8601 string
- ✅ Frontend expect ISO 8601 string
- **Action:** Không cần thay đổi (nếu Jackson configured đúng)

### Nullable Fields
- ⚠️ Backend `Boolean isActive` → có thể null
- ❌ Frontend `boolean` → không null
- **Action:** Cần thay đổi frontend thành `boolean | null` hoặc đảm bảo backend không trả null

---

## Sau Khi Verify

1. **Ghi lại tất cả kết quả** vào checklist
2. **So sánh với frontend types** trong `.kiro/specs/frontend-api-type-safety/BACKEND_FRONTEND_COMPARISON_REPORT.md`
3. **Update report** với actual values từ backend
4. **Tạo danh sách changes** cần thực hiện cho frontend types
5. **Fix frontend types** dựa trên actual backend response

---

## Troubleshooting

### Backend không chạy
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Login failed - User not found
Kiểm tra database có user admin chưa:
```sql
SELECT * FROM users WHERE username = 'admin';
```

Nếu chưa có, chạy script:
```bash
# Xem file backend/postman/setup-test-data.sql
```

### 401 Unauthorized
- Token đã expire
- Chạy lại request **1.2 Login** để lấy token mới

### JWT decode failed
- Token format không đúng
- Kiểm tra backend JwtUtil configuration

---

## Next Steps

Sau khi verify xong:

1. ✅ Update `BACKEND_FRONTEND_COMPARISON_REPORT.md` với actual values
2. ✅ Fix frontend type definitions
3. ✅ Re-run TypeScript compiler
4. ✅ Test frontend với backend
5. ✅ Update manual testing guide nếu cần

---

## Notes

- Collection này chỉ verify response format, không test business logic
- Focus vào type compatibility giữa backend và frontend
- Tất cả requests đều có description chi tiết về critical checks
- Environment variables tự động save tokens sau login
