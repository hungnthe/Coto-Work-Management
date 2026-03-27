# Quick Start - Backend API Verification

## 🚀 3 Bước Nhanh

### 1️⃣ Start Backend (1 phút)
```bash
cd backend
mvn spring-boot:run
```

Đợi thấy: `Started UserServiceApplication`

### 2️⃣ Import Postman (1 phút)
1. Mở Postman
2. Click **Import** button
3. Drag & drop 2 files:
   - `Frontend-Type-Safety-Verification.postman_collection.json`
   - `Frontend-Type-Safety-Verification.postman_environment.json`
4. Select environment dropdown → chọn "Frontend Type Safety Verification Environment"

### 3️⃣ Run & Verify (5 phút)
1. **Health Check** → Click Send → Verify "healthy"
2. **Login** → Click Send → **COPY accessToken**
3. **Decode JWT** → Vào https://jwt.io → Paste token → **GHI LẠI KẾT QUẢ**
4. **Get All Users** → Click Send → **GHI LẠI KẾT QUẢ**
5. **Get All Units** → Click Send → **GHI LẠI KẾT QUẢ**

---

## 📝 Ghi Lại Kết Quả (Copy Template Này)

### Login Response
```json
{
  "userId": _____ (number/string?),
  "unitId": _____ (number/string?),
  "role": "_____ (ADMIN/UNIT_MANAGER/STAFF/VIEWER?)",
  "permissions": ["_____ (user:read/USER_READ?)"],
  "expiresIn": _____ (number/null?)
}
```

### JWT Payload
```json
{
  "userId": _____ (number/string?),
  "unitId": _____ (number/string?),
  "role": "_____",
  "permissions": ["_____"]
}
```

### User Response
```json
{
  "id": _____ (number/string?),
  "unit": {
    "id": _____ (number/string?),
    "parentUnitId": _____ (number/string/null?)
  },
  "role": "_____",
  "isActive": _____ (true/false/null?),
  "createdAt": "_____ (ISO 8601?)",
  "phoneNumber": _____ (string/null?)
}
```

### Unit Response
```json
{
  "id": _____ (number/string?),
  "parentUnitId": _____ (number/string/null?),
  "isActive": _____ (true/false/null?),
  "createdAt": "_____ (ISO 8601?)"
}
```

---

## ✅ Checklist Nhanh

- [ ] Backend đang chạy (health check OK)
- [ ] Login thành công (có accessToken)
- [ ] JWT decoded (xem được payload)
- [ ] Ghi lại userId type
- [ ] Ghi lại unitId type
- [ ] Ghi lại role value
- [ ] Ghi lại permissions format
- [ ] Ghi lại User.id type
- [ ] Ghi lại Unit.id type
- [ ] Ghi lại date format
- [ ] Ghi lại nullable fields

---

## 🎯 Kết Quả Mong Đợi

### Sẽ Thấy (Dự đoán)
- ✅ `userId`: **number** (không phải string!)
- ✅ `unitId`: **number** (không phải string!)
- ✅ `role`: **"UNIT_MANAGER"** hoặc **"STAFF"** (không phải USER/MANAGER!)
- ✅ `permissions`: **"user:read"** (không phải USER_READ!)
- ✅ `id`: **number** (không phải string!)
- ✅ `createdAt`: **"2024-02-24T10:30:00"** (ISO 8601)

### Vấn Đề Sẽ Gặp
- ❌ Frontend expect `string` nhưng backend trả `number`
- ❌ Frontend có enum `USER`, `MANAGER` nhưng backend trả `UNIT_MANAGER`, `STAFF`
- ❌ Frontend expect `"USER_READ"` nhưng backend trả `"user:read"`

---

## 🔧 Sau Khi Verify

### Nếu Kết Quả Khớp Dự Đoán
1. Update frontend types:
   - Thay `string` → `number` cho tất cả IDs
   - Thay UserRole enum
   - Thay Permission enum
2. Re-run TypeScript compiler
3. Test frontend

### Nếu Kết Quả Khác Dự Đoán
1. Ghi lại actual values
2. Update `BACKEND_FRONTEND_COMPARISON_REPORT.md`
3. Tạo plan mới dựa trên actual values

---

## 🆘 Troubleshooting

### Backend không start
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Login failed
Thử credentials:
- Username: `admin` / Password: `Admin123456`

### 401 Unauthorized
Token expired → Run lại Login request

---

## 📚 Chi Tiết Hơn

Xem file `TYPE-VERIFICATION-GUIDE.md` để có:
- Hướng dẫn chi tiết từng bước
- Checklist đầy đủ
- Troubleshooting guide
- Next steps

---

## ⏱️ Tổng Thời Gian

- Setup: 2 phút
- Run requests: 5 phút
- Ghi lại kết quả: 3 phút
- **Total: ~10 phút**

---

## 🎯 Mục Tiêu

Sau 10 phút, bạn sẽ có:
1. ✅ Actual backend response format
2. ✅ List of mismatches với frontend
3. ✅ Clear action items để fix

**LET'S GO! 🚀**
