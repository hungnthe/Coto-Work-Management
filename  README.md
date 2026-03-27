# 🏝️ CotoWork Management System

> **Hệ thống Quản lý Công việc Cô Tô** — Nền tảng quản lý công việc và nhân sự trực tuyến dành cho cơ quan hành chính huyện đảo Cô Tô, tỉnh Quảng Ninh.

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Tính năng đã hoàn thành](#-tính-năng-đã-hoàn-thành)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Cài đặt & Chạy](#-cài-đặt--chạy)
- [API Endpoints chính](#-api-endpoints-chính)
- [Tài khoản mặc định](#-tài-khoản-mặc-định)
- [Biến môi trường](#-biến-môi-trường)

---

## 🌊 Tổng quan

CotoWork là hệ thống quản lý công việc theo kiến trúc **Microservices**, được xây dựng để phục vụ nhu cầu quản lý nhân sự và phân công công việc nội bộ tại các đơn vị thuộc huyện đảo Cô Tô. Hệ thống hỗ trợ:

- Phân công công việc từ admin đến từng cá nhân hoặc phòng ban
- Theo dõi tiến độ qua lịch làm việc trực quan
- Thông báo realtime khi được giao việc
- Quản lý người dùng và cơ cấu tổ chức theo phân cấp

---

## ✅ Tính năng đã hoàn thành

### 👤 Quản lý người dùng
- Đăng nhập / Đăng xuất với JWT (Access Token + Refresh Token)
- Xem & chỉnh sửa hồ sơ cá nhân
- Đổi mật khẩu
- RBAC: phân quyền theo vai trò (ADMIN / UNIT_MANAGER / STAFF / VIEWER)

### 🏢 Quản lý đơn vị
- Danh sách đơn vị dạng **cây phân cấp** (expand/collapse)
- Thêm / Sửa / Xóa đơn vị
- Xem thành viên từng đơn vị

### 📋 Quản lý công việc
- **Lịch công việc** theo Tháng / Tuần / Ngày
- Tạo, sửa, xóa, kéo-thả công việc trên lịch
- Giao việc cho **1 người / nhiều người / cả phòng ban**
- Đánh dấu hoàn thành / mở lại
- Đính kèm tài liệu (link URL hoặc upload file từ máy)
- Lọc theo nhân viên (Admin)
- Xem chi tiết đầy đủ công việc

### 🔔 Thông báo realtime
- WebSocket (STOMP over SockJS) — thông báo ngay khi được giao việc
- Badge số lượng chưa đọc
- Toast popup góc phải màn hình
- Đánh dấu đã đọc / đọc tất cả
- Lịch sử thông báo có phân trang

### 📊 Dashboard Admin
- Biểu đồ tiến độ hoàn thành công việc theo tháng
- Thống kê theo trạng thái và độ ưu tiên
- Nút reset tháng mới
- Quản lý người dùng (xem, sửa, khóa/mở khóa)

### 🏠 Trang chủ
- Thống kê công việc cá nhân (cần làm / quá hạn / hoàn thành)
- Danh sách việc ưu tiên cao
- Bảng tin nội bộ (announcements)
- Form báo lỗi & góp ý

---

## 🛠️ Công nghệ sử dụng

### Backend
| Thành phần | Công nghệ |
|---|---|
| Ngôn ngữ | Java 21 |
| Framework | Spring Boot 3.x |
| API Gateway | Spring Cloud Gateway (WebFlux) |
| Service Discovery | HashiCorp Consul |
| Bảo mật | Spring Security + JWT |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Message Queue | RabbitMQ 3.12 |
| WebSocket | STOMP over SockJS |
| Build tool | Maven |
| Container | Docker + Docker Compose |

### Frontend
| Thành phần | Công nghệ |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios |
| WebSocket | @stomp/stompjs + sockjs-client |
| UI | Tailwind CSS + Heroicons + Lucide |
| Reverse Proxy | Nginx Alpine |

### Monitoring & Observability
| Thành phần | Công nghệ |
|---|---|
| Metrics | Prometheus + Grafana |
| Logging | ELK Stack (Elasticsearch + Logstash + Kibana) |
| Tracing | Zipkin |

---

## 🏗️ Kiến trúc hệ thống

```
Internet / Browser
        │
        ▼
   [Nginx :80]
   ├── /          → Frontend (React)
   ├── /api/**    → API Gateway :8080
   └── /ws/**     → API Gateway :8080 (WebSocket)
        │
        ▼
[Spring Cloud Gateway :8080]
   ├── /api/auth/**          → User Service :8083
   ├── /api/users/**         → User Service :8083
   ├── /api/units/**         → User Service :8083
   ├── /api/tasks/**         → Task Service :8084
   ├── /api/notifications/** → Task Service :8084
   ├── /api/files/**         → Task Service :8084
   └── /ws/**                → Task Service :8084 (WebSocket)
        │
        ├── [User Service :8083] ──── PostgreSQL user_service_db :5432
        │                      └──── Redis :6379
        │
        └── [Task Service :8084] ─── PostgreSQL task_service_db :5433
                               ├─── Redis :6379
                               ├─── RabbitMQ :5672
                               └─── /app/uploads (file storage)

[Consul :8500] ← Service Discovery (tất cả service đăng ký)
```

### Sơ đồ ports

| Service | Port | Mô tả |
|---|---|---|
| Nginx | **80** | Điểm vào duy nhất từ bên ngoài |
| API Gateway | 8080 | Điều phối request nội bộ |
| User Service | 8083 | Quản lý người dùng, auth, đơn vị |
| Task Service | 8084 | Quản lý công việc, thông báo, file |
| PostgreSQL (user) | 5432 | DB người dùng |
| PostgreSQL (task) | 5433 | DB công việc |
| Redis | 6379 | Cache & session |
| RabbitMQ | 5672 | Message queue |
| RabbitMQ UI | 15672 | Quản lý RabbitMQ |
| Consul | 8500 | Service discovery UI |
| Prometheus | 9090 | Thu thập metrics |
| Grafana | 3000 | Dashboard metrics |
| Kibana | 5601 | Log management |
| Zipkin | 9411 | Distributed tracing |

---

## 📁 Cấu trúc thư mục

```
CotoWorkManagement/
├── backend/
│   ├── user-service/               # Quản lý người dùng, auth, đơn vị
│   │   ├── src/main/java/com/cotowork/userservice/
│   │   │   ├── config/             # SecurityConfig, CorsConfig
│   │   │   ├── controller/         # UserController, AuthController, UnitController
│   │   │   ├── dto/                # Request/Response DTOs
│   │   │   ├── entity/             # User, Unit, UserRole
│   │   │   ├── repository/         # JPA repositories
│   │   │   ├── security/           # JWT, filters
│   │   │   └── service/            # Business logic
│   │   └── src/main/resources/
│   │       ├── application.properties
│   │       └── db/init-user-db.sql
│   │
│   └── task-service/               # Quản lý công việc, thông báo, file
│       ├── src/main/java/com/cotowork/taskservice/
│       │   ├── config/             # SecurityConfig, WebSocketConfig
│       │   ├── controller/         # TaskController, NotificationController, FileUploadController
│       │   ├── dto/                # TaskCreateDto, AssignTaskDto, ...
│       │   ├── entity/             # Task, Notification, TaskStatus, TaskPriority
│       │   ├── repository/         # TaskRepository, NotificationRepository
│       │   ├── security/           # JwtUtil, JwtAuthFilter
│       │   └── service/            # TaskService, NotificationService
│       └── src/main/resources/
│           └── application.properties
│
├── infrastructure/
│   ├── api-gateway/                # Spring Cloud Gateway
│   │   ├── src/main/java/.../GatewayConfig.java
│   │   └── src/main/resources/application.yml
│   └── monitoring/
│       ├── prometheus.yml
│       ├── grafana/
│       └── logstash/
│
├── frontend/                       # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── AdminLayout/    # Header, Sidebar, AdminLayout
│   │   │       └── ClientLayout/   # ClientLayout
│   │   ├── config/
│   │   │   └── assets.js           # Cấu hình ảnh & media
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx     # Global auth state
│   │   ├── features/
│   │   │   ├── notifications/      # NotificationBell, NotificationToast
│   │   │   └── users/              # UserProfileFeature
│   │   ├── hooks/
│   │   │   └── useNotifications.js # WebSocket + notification state
│   │   ├── pages/
│   │   │   ├── Admin/              # AdminDashboard, UserList, UserDetailPage, UnitManagementPage
│   │   │   ├── HomePage.jsx
│   │   │   ├── TaskManagementPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── NotificationPage.jsx
│   │   ├── services/
│   │   │   ├── api.ts              # Axios base instance
│   │   │   ├── authService.ts
│   │   │   ├── taskService.js      # + assignTask, getTaskStats
│   │   │   ├── userService.ts
│   │   │   ├── unitService.ts
│   │   │   ├── notificationService.js
│   │   │   └── fileService.js      # Upload file lên task-service
│   │   └── types/
│   │       └── api/                # TypeScript type definitions
│   ├── public/
│   │   └── images/
│   │       └── anh-co-to-1.jpg     # Ảnh nền trang chủ
│   └── Dockerfile
│
├── nginx/
│   └── nginx.conf                  # Reverse proxy config
├── docker-compose.yml              # Toàn bộ stack
└── README.md
```

---

## 🚀 Cài đặt & Chạy

### Yêu cầu
- Docker Desktop ≥ 4.x
- Docker Compose ≥ 2.x
- RAM khuyến nghị: ≥ 8GB

### Chạy toàn bộ hệ thống

```bash
# 1. Clone dự án
git clone https://github.com/your-org/CotoWorkManagement.git
cd CotoWorkManagement

# 2. Tạo file .env (copy từ mẫu)
cp .env.example .env
# Chỉnh sửa JWT_SECRET trong .env

# 3. Khởi động tất cả service
docker-compose up -d

# 4. Kiểm tra trạng thái
docker-compose ps
```

### Truy cập

| URL | Mô tả |
|---|---|
| http://localhost | Ứng dụng chính |
| http://localhost/admin | Trang quản trị |
| http://localhost:8500 | Consul UI |
| http://localhost:15672 | RabbitMQ UI (admin/admin123) |
| http://localhost:9090 | Prometheus |
| http://localhost:3000 | Grafana (admin/admin123) |
| http://localhost:5601 | Kibana |

### Deploy với ngrok (demo online)

```bash
# Cài ngrok, sau đó:
ngrok http 80

# Cập nhật CORS trong các file sau:
# infrastructure/api-gateway/src/main/resources/application.yml
#   → allowedOriginPatterns: thêm domain ngrok

# Cập nhật biến môi trường frontend:
# frontend/.env.local
VITE_API_BASE_URL=https://<your-ngrok>.ngrok-free.dev/api
VITE_TASK_API_BASE_URL=https://<your-ngrok>.ngrok-free.dev/api
VITE_TASK_WS_URL=wss://<your-ngrok>.ngrok-free.dev/ws/websocket

# Rebuild frontend
docker-compose up --build -d frontend
```

### Rebuild một service cụ thể

```bash
# Rebuild task-service
docker-compose up --build -d task-service

# Rebuild gateway
docker-compose up --build -d api-gateway

# Xem log realtime
docker logs task-service -f
docker logs api-gateway -f
```

---

## 📡 API Endpoints chính

### 🔐 Auth (`/api/auth`)
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/login` | Đăng nhập → trả JWT |
| POST | `/api/auth/logout` | Đăng xuất |
| POST | `/api/auth/refresh` | Làm mới Access Token |

### 👤 Users (`/api/users`)
| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| GET | `/api/users` | Danh sách người dùng | user:read |
| GET | `/api/users/{id}` | Chi tiết người dùng | user:read |
| PUT | `/api/users/{id}` | Cập nhật | user:update |
| GET | `/api/users/me` | Hồ sơ bản thân | auth |
| PUT | `/api/users/me` | Sửa hồ sơ bản thân | auth |
| PATCH | `/api/users/{id}/password` | Đổi mật khẩu | auth |

### 🏢 Units (`/api/units`)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/units` | Danh sách đơn vị |
| POST | `/api/units` | Tạo đơn vị mới |
| PUT | `/api/units/{id}` | Cập nhật đơn vị |
| DELETE | `/api/units/{id}` | Xóa đơn vị |

### 📋 Tasks (`/api/tasks`)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/tasks/calendar?start=&end=` | Lịch cá nhân |
| GET | `/api/tasks/calendar/all?start=&end=` | Lịch tất cả (Admin) |
| POST | `/api/tasks` | Tạo công việc |
| PUT | `/api/tasks/{id}` | Cập nhật |
| DELETE | `/api/tasks/{id}` | Xóa |
| POST | `/api/tasks/assign` | Giao việc (Admin) |
| PATCH | `/api/tasks/{id}/toggle-complete` | Đánh dấu hoàn thành |
| PATCH | `/api/tasks/{id}/move` | Kéo thả lịch |
| GET | `/api/tasks/stats?from=&to=` | Thống kê |

### 🔔 Notifications (`/api/notifications`)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/notifications?page=0&size=20` | Lịch sử thông báo |
| GET | `/api/notifications/unread-count` | Số chưa đọc |
| PATCH | `/api/notifications/{id}/read` | Đánh dấu đã đọc |
| PATCH | `/api/notifications/read-all` | Đọc tất cả |
| POST | `/api/notifications/send` | Gửi thông báo (Admin) |

### 📎 Files (`/api/files`)
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/files/upload` | Upload file (max 20MB) |
| GET | `/api/files/{userId}/{filename}` | Tải/xem file |
| DELETE | `/api/files/{userId}/{filename}` | Xóa file |

---

## 🔑 Tài khoản mặc định

| Tài khoản | Mật khẩu | Vai trò |
|---|---|---|
| `admin` | `Admin@123` | ADMIN — toàn quyền |
| `manager_it` | `Manager@123` | UNIT_MANAGER |
| `staff_it` | `Staff@123` | STAFF |

> ⚠️ Đổi mật khẩu ngay sau khi deploy production!

---

## ⚙️ Biến môi trường

### `.env` (root)
```env
JWT_SECRET=your-super-secret-key-at-least-32-chars
```

### `frontend/.env.local`
```env
# Local development
VITE_API_BASE_URL=http://localhost/api
VITE_TASK_API_BASE_URL=http://localhost/api
VITE_TASK_WS_URL=ws://localhost/ws/websocket

# Khi dùng ngrok
# VITE_API_BASE_URL=https://xxx.ngrok-free.dev/api
# VITE_TASK_API_BASE_URL=https://xxx.ngrok-free.dev/api
# VITE_TASK_WS_URL=wss://xxx.ngrok-free.dev/ws/websocket
```

---

## 🗄️ Database Schema

### user_service_db
- `users` — tài khoản người dùng
- `units` — đơn vị tổ chức (phân cấp)
- `roles` / `permissions` / `role_permissions` — RBAC
- `refresh_tokens` — JWT refresh tokens
- `user_audit_log` — lịch sử thao tác

### task_service_db (auto-created bởi Hibernate)
- `tasks` — công việc (có `document_urls` lưu JSON)
- `notifications` — thông báo realtime

---

## 🐛 Troubleshooting

| Vấn đề | Giải pháp |
|---|---|
| 502 Bad Gateway | Kiểm tra YAML `application.yml` của Gateway — không để comment inline trong `predicates` |
| 503 Service Unavailable | Circuit Breaker đang OPEN — `docker-compose restart api-gateway` |
| WebSocket 500 | Dùng `lb:ws://` thay vì `lb://` cho WS route trong Gateway |
| CORS error trên ngrok | Thêm domain vào `allowedOriginPatterns` trong Gateway config |
| Upload file không hoạt động | Thêm volume `task_uploads:/app/uploads` vào docker-compose |

---

## 👨‍💻 Tác giả

**Nguyễn Hùng** — Sinh viên FPT University  
Dự án thực tập tại huyện đảo Cô Tô, tỉnh Quảng Ninh — 2026

---

