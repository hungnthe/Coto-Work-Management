# Tài liệu Thiết kế: Hệ thống CoTo Work Management

## Tổng quan

Hệ thống CoTo Work Management là một ứng dụng Spring Boot REST API toàn diện cung cấp khả năng quản lý công việc, tin tức, dự án và cơ sở vật chất cho ủy ban. Hệ thống tuân theo kiến trúc phân lớp với sự tách biệt rõ ràng các mối quan tâm, triển khai các nguyên tắc RESTful cho thiết kế API và JPA cho lưu trữ dữ liệu.

Hệ thống hỗ trợ cả truy cập công khai để xem nội dung và truy cập được xác thực cho các hoạt động quản lý. Nó bao gồm khả năng tải lên file, dashboard KPI tổng hợp, và hệ thống audit logging toàn diện.

## Kiến trúc

Hệ thống tuân theo kiến trúc Spring Boot phân lớp truyền thống:

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (REST Controllers, DTOs, Validation)   │
├─────────────────────────────────────────┤
│            Service Layer                │
│   (Business Logic, Security, Audit)     │
├─────────────────────────────────────────┤
│           Repository Layer              │
│     (JPA Repositories, Entities)        │
├─────────────────────────────────────────┤
│            Database Layer               │
│        (MySQL/PostgreSQL)               │
└─────────────────────────────────────────┘
```

**Quyết định Kiến trúc Chính:**
- Thiết kế API RESTful tuân theo best practices của Spring Boot
- JPA/Hibernate cho ORM với các mối quan hệ entity phù hợp
- Lưu trữ file sử dụng filesystem với theo dõi metadata trong database
- Kiểm soát truy cập dựa trên vai trò sử dụng Spring Security
- Pattern DTO để cách ly API request/response
- Audit logging toàn diện cho các hoạt động hệ thống
- Dashboard tổng hợp KPI từ tất cả nghiệp vụ

## Các Thành phần và Giao diện

### REST Controllers

**NewsController**
- `GET /api/news` - Lấy danh sách tin tức có phân trang (công khai)
- `GET /api/news/{id}` - Lấy chi tiết bài tin (công khai)
- `POST /api/news` - Tạo bài tin (xác thực, cán bộ nhập liệu/quản trị file)
- `PUT /api/news/{id}` - Cập nhật bài tin (xác thực, cán bộ nhập liệu/quản trị file)
- `DELETE /api/news/{id}` - Xóa bài tin (xác thực, quản trị file)
- `PATCH /api/news/{id}/visibility` - Chuyển đổi hiển thị bài viết (xác thực, quản trị file)

**NotificationController**
- `GET /api/notifications` - Lấy danh sách thông báo có phân trang (người dùng đã xác thực)
- `GET /api/notifications/{id}` - Lấy chi tiết thông báo (người dùng đã xác thực)
- `POST /api/notifications` - Tạo thông báo (xác thực, cán bộ nhập liệu/quản trị file)
- `PUT /api/notifications/{id}` - Cập nhật thông báo (xác thực, cán bộ nhập liệu/quản trị file)
- `DELETE /api/notifications/{id}` - Xóa thông báo (xác thực, quản trị file)

**TaskController (NHIEM_VU)**
- `GET /api/tasks` - Lấy danh sách nhiệm vụ có phân trang và lọc
- `GET /api/tasks/{id}` - Lấy chi tiết nhiệm vụ
- `POST /api/tasks` - Tạo nhiệm vụ mới (các đơn vị quản lý)
- `PUT /api/tasks/{id}` - Cập nhật nhiệm vụ (cán bộ nhập liệu)
- `PATCH /api/tasks/{id}/status` - Cập nhật trạng thái nhiệm vụ (cán bộ nhập liệu)
- `GET /api/tasks/{id}/logs` - Lấy lịch sử thay đổi nhiệm vụ

**UnitController (DON_VI)**
- `GET /api/units` - Lấy danh sách đơn vị
- `GET /api/units/{id}` - Lấy chi tiết đơn vị
- `POST /api/units` - Tạo đơn vị mới (quản trị file)
- `PUT /api/units/{id}` - Cập nhật đơn vị (quản trị file)
- `DELETE /api/units/{id}` - Xóa đơn vị (quản trị file)

**FacilityController (CO_SO)**
- `GET /api/facilities` - Lấy danh sách cơ sở vật chất
- `GET /api/facilities/{id}` - Lấy chi tiết cơ sở
- `POST /api/facilities` - Tạo cơ sở mới (quản trị file)
- `PUT /api/facilities/{id}` - Cập nhật cơ sở (quản trị file)
- `DELETE /api/facilities/{id}` - Xóa cơ sở (quản trị file)
- `GET /api/facilities/{id}/history` - Lấy lịch sử thay đổi cơ sở

**ProjectController (DU_AN_DTXD)**
- `GET /api/projects` - Lấy danh sách dự án DTXD
- `GET /api/projects/{id}` - Lấy chi tiết dự án
- `POST /api/projects` - Tạo dự án mới (cán bộ nhập liệu)
- `PUT /api/projects/{id}` - Cập nhật dự án (cán bộ nhập liệu)
- `DELETE /api/projects/{id}` - Xóa dự án (quản trị file)
- `GET /api/projects/{id}/documents` - Lấy tài liệu dự án

**DocumentController (TAI_LIEU_DTXD)**
- `POST /api/documents/upload` - Upload tài liệu dự án
- `GET /api/documents/{id}` - Tải xuống tài liệu
- `DELETE /api/documents/{id}` - Xóa tài liệu (quản trị file)

**KPIController**
- `GET /api/kpi/summary` - Lấy tổng hợp KPI tất cả đơn vị
- `GET /api/kpi/units/{unitId}` - Lấy KPI của đơn vị cụ thể
- `GET /api/kpi/dashboard` - Lấy dữ liệu dashboard tổng hợp
- `POST /api/kpi/calculate` - Tính toán lại KPI (quản trị file)

**DVCTTController**
- `GET /api/dvctt` - Lấy danh sách DVCTT
- `GET /api/dvctt/statistics` - Thống kê DVCTT theo cấp độ
- `POST /api/dvctt` - Tạo DVCTT mới (cán bộ nhập liệu)
- `PUT /api/dvctt/{id}` - Cập nhật DVCTT (cán bộ nhập liệu)

**FileController**
- `POST /api/files/upload` - Upload files (ảnh bìa, đính kèm, tài liệu)
- `GET /api/files/{fileId}` - Tải xuống/phục vụ files
- `DELETE /api/files/{fileId}` - Xóa files (quản trị file)

### Service Layer

**NewsService**
- Logic nghiệp vụ cho các hoạt động bài tin
- Xác thực nội dung tin tức và metadata
- Tích hợp với quản lý file cho ảnh bìa
- Audit logging cho tất cả hoạt động

**NotificationService**
- Logic nghiệp vụ cho các hoạt động thông báo
- Quản lý file đính kèm thông báo
- Xác thực nội dung thông báo
- Audit logging cho tất cả hoạt động

**TaskService (NhiemVuService)**
- Logic nghiệp vụ cho quản lý nhiệm vụ
- Tự động sinh mã nhiệm vụ từ TASK_SEQ
- Quản lý trạng thái và workflow nhiệm vụ
- Tích hợp với NHIEM_VU_LOG cho audit trail

**UnitService (DonViService)**
- Quản lý thông tin đơn vị và cấu trúc tổ chức
- Xử lý phân cấp đơn vị
- Tích hợp với USER và NHIEM_VU

**FacilityService (CoSoService)**
- Logic nghiệp vụ cho quản lý cơ sở vật chất
- Tự động tạo audit trail trong CO_SO_CAP_NHAT
- Quản lý trạng thái và lịch sử cơ sở

**ProjectService (DuAnService)**
- Quản lý dự án đầu tư xây dựng
- Tích hợp với TAI_LIEU_DTXD cho quản lý tài liệu
- Theo dõi tiến độ và ngân sách dự án

**KPIService**
- Tính toán và tổng hợp KPI từ tất cả nghiệp vụ
- Cập nhật KPI_TONG_HOP định kỳ
- Tạo báo cáo dashboard tổng hợp

**DVCTTService**
- Quản lý danh mục dịch vụ công trực tuyến
- Thống kê theo cấp độ và trạng thái
- Báo cáo tiến độ triển khai

**FileService**
- Hoạt động upload/download file
- Xác thực loại file và giới hạn kích thước
- Lưu trữ và truy xuất file an toàn
- Quản lý metadata file

**AuditService**
- Audit logging tập trung
- Theo dõi hoạt động với user context
- Audit trail cho tuân thủ và debug

### Security Components

**AuthenticationService**
- Xác thực người dùng và quản lý session
- Tích hợp với hệ thống quản lý USER hiện có

**AuthorizationService**
- Kiểm soát truy cập dựa trên vai trò
- Xác thực quyền cho các hoạt động theo actor (Cán bộ nhập liệu, Quản trị file, Các đơn vị quản lý)
- Quản lý security context

## Mô hình Dữ liệu

### News Entity
```java
@Entity
@Table(name = "News")
public class News {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long newsId;
    
    @Column(nullable = false, length = 255)
    private String title;
    
    @Column(length = 500)
    private String summary;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(length = 500)
    private String thumbnailUrl;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private String createdBy;
    
    @Column(nullable = false)
    private Boolean isPublished = false;
}
```

### Notification Entity
```java
@Entity
@Table(name = "NOTIFICATION")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notifId;
    
    @Column(nullable = false, length = 255)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(nullable = false)
    private String type;
    
    @Column(length = 500)
    private String attachmentUrl;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
}
```

### NhiemVu Entity
```java
@Entity
@Table(name = "NHIEM_VU")
public class NhiemVu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long taskId;
    
    @Column(nullable = false, unique = true)
    private String taskCode;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private DonVi donVi;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id")
    private LinhVuc linhVuc;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(nullable = false)
    private LocalDateTime assignedDate;
    
    @Column(nullable = false)
    private LocalDateTime dueDate;
    
    @Column(nullable = false)
    private String status;
    
    @Column
    private LocalDateTime completedDate;
    
    @Column(nullable = false)
    private Boolean isOverdue = false;
    
    @OneToMany(mappedBy = "nhiemVu", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<NhiemVuLog> logs = new ArrayList<>();
}
```

### NhiemVuLog Entity
```java
@Entity
@Table(name = "NHIEM_VU_LOG")
public class NhiemVuLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private NhiemVu nhiemVu;
    
    @Column(nullable = false)
    private LocalDateTime changedAt;
    
    @Column(nullable = false)
    private String oldStatus;
    
    @Column(columnDefinition = "TEXT")
    private String note;
    
    @Column(nullable = false)
    private String changedBy;
}
```

### DonVi Entity
```java
@Entity
@Table(name = "DON_VI")
public class DonVi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long unitId;
    
    @Column(nullable = false, unique = true)
    private String unitCode;
    
    @Column(nullable = false)
    private String unitName;
    
    @OneToMany(mappedBy = "donVi", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<NhiemVu> nhiemVus = new ArrayList<>();
    
    @OneToMany(mappedBy = "donVi", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<User> users = new ArrayList<>();
}
```

### User Entity
```java
@Entity
@Table(name = "USER")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;
    
    @Column(nullable = false, unique = true)
    private String fullName;
    
    @Column(nullable = false)
    private String role;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private DonVi donVi;
}
```

### CoSo Entity
```java
@Entity
@Table(name = "CO_SO")
public class CoSo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long facilityId;
    
    @Column(nullable = false, unique = true)
    private String facilityCode;
    
    @Column(nullable = false)
    private String facilityName;
    
    @Column(nullable = false)
    private String facilityType;
    
    @Column(nullable = false)
    private String location;
    
    @Column(nullable = false)
    private Long managingUnitId;
    
    @Column(nullable = false)
    private String statusCurrent;
    
    @OneToMany(mappedBy = "coSo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CoSoCapNhat> capNhats = new ArrayList<>();
}
```

### CoSoCapNhat Entity
```java
@Entity
@Table(name = "CO_SO_CAP_NHAT")
public class CoSoCapNhat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long updateId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id")
    private CoSo coSo;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(nullable = false)
    private String status;
    
    @Column(columnDefinition = "TEXT")
    private String note;
    
    @Column(nullable = false)
    private String updatedBy;
}
```

### DuAnDTXD Entity
```java
@Entity
@Table(name = "DU_AN_DTXD")
public class DuAnDTXD {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long projectId;
    
    @Column(nullable = false, unique = true)
    private String projectCode;
    
    @Column(nullable = false)
    private String projectName;
    
    @Column(nullable = false)
    private Long unitId;
    
    @Column(nullable = false)
    private String status;
    
    @Column(nullable = false)
    private LocalDate startDate;
    
    @Column(nullable = false)
    private LocalDate endDate;
    
    @Column(nullable = false)
    private BigDecimal budget;
    
    @Column(nullable = false)
    private Long managerId;
    
    @OneToMany(mappedBy = "duAn", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TaiLieuDTXD> taiLieus = new ArrayList<>();
}
```

### TaiLieuDTXD Entity
```java
@Entity
@Table(name = "TAI_LIEU_DTXD")
public class TaiLieuDTXD {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long docId;
    
    @Column(nullable = false)
    private LocalDate startDate;
    
    @Column(nullable = false)
    private String docName;
    
    @Column(nullable = false)
    private String docType;
    
    @Column(nullable = false)
    private String filePath;
    
    @Column(nullable = false)
    private LocalDateTime uploadedAt;
    
    @Column(nullable = false)
    private String uploadedBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private DuAnDTXD duAn;
}
```

### KPITongHop Entity
```java
@Entity
@Table(name = "KPI_TONG_HOP")
public class KPITongHop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long kpiId;
    
    @Column(nullable = false)
    private Long unitId;
    
    @Column(nullable = false)
    private String period;
    
    @Column(nullable = false)
    private Integer totalTasks;
    
    @Column(nullable = false)
    private Integer doneTasks;
    
    @Column(nullable = false)
    private Integer overdueTasks;
    
    @Column(nullable = false)
    private Double doneRate;
    
    @Column(nullable = false)
    private Double overdueRate;
}
```

### TaskSeq Entity
```java
@Entity
@Table(name = "TASK_SEQ")
public class TaskSeq {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long unitId;
    
    @Column(nullable = false)
    private Long fieldId;
    
    @Column(nullable = false)
    private Integer currentSeq;
}
```

### LinhVuc Entity
```java
@Entity
@Table(name = "LINH_VUC")
public class LinhVuc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fieldId;
    
    @Column(nullable = false)
    private String fieldName;
    
    @OneToMany(mappedBy = "linhVuc", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<NhiemVu> nhiemVus = new ArrayList<>();
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Converting EARS to Properties

Based on the prework analysis, I'll convert the testable acceptance criteria into universally quantified properties:

**Property 1: Content chronological ordering**
*For any* collection of news articles or announcements, when displayed in a list, they should be ordered in reverse chronological order (newest first)
**Validates: Requirements 1.2, 4.2**

**Property 2: Required field presence in list view**
*For any* news article in a list view, the rendered output should contain title, publication date, and excerpt
**Validates: Requirements 1.5**

**Property 3: Required field presence in detail view**
*For any* news article or announcement in detail view, the rendered output should contain all required fields (title, content, metadata, author/issuing authority)
**Validates: Requirements 2.2, 4.4**

**Property 4: Conditional cover image display**
*For any* news article that has an associated cover image, the detail view should include the cover image information
**Validates: Requirements 2.4**

**Property 5: Content creation round trip**
*For any* valid news article or announcement data, creating the content and then retrieving it should produce equivalent data
**Validates: Requirements 3.1**

**Property 6: File association persistence**
*For any* news article with a cover image or announcement with attachments, the file associations should be maintained after creation
**Validates: Requirements 3.2, 5.1**

**Property 7: Update preserves creation timestamp**
*For any* existing news article or announcement, updating the content should preserve the original creation timestamp while updating the modification timestamp
**Validates: Requirements 3.3**

**Property 8: Delete removes content**
*For any* news article or announcement, after deletion, attempting to retrieve it should fail with appropriate error
**Validates: Requirements 3.4**

**Property 9: Visibility controls content access**
*For any* news article or announcement marked as hidden, it should be excluded from public queries while remaining accessible to authorized users
**Validates: Requirements 3.5**

**Property 10: Required field validation**
*For any* content creation or update request missing required fields (title, content), the operation should be rejected with validation errors
**Validates: Requirements 3.7**

**Property 11: File attachment conditional display**
*For any* announcement that has file attachments, the response should include download information for all attached files
**Validates: Requirements 4.3**

**Property 12: File type validation**
*For any* file upload request, files with supported formats (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF) should be accepted, while unsupported formats should be rejected
**Validates: Requirements 4.5, 5.2**

**Property 13: File size validation**
*For any* file upload request, files exceeding the 10MB limit should be rejected with appropriate error messages
**Validates: Requirements 5.3**

**Property 14: File storage generates unique identifiers**
*For any* successfully uploaded file, the system should generate a unique identifier and make the file retrievable using that identifier
**Validates: Requirements 5.4**

**Property 15: File removal breaks associations**
*For any* file attachment removed from an announcement, the file should no longer be associated with that announcement
**Validates: Requirements 5.5**

**Property 16: Authentication required for management operations**
*For any* content management operation (create, update, delete), unauthenticated requests should be rejected with authentication errors
**Validates: Requirements 6.1**

**Property 17: Role-based authorization**
*For any* content management operation, only users with admin or communication officer roles should be authorized to proceed
**Validates: Requirements 6.2**

**Property 18: Unauthorized access logging**
*For any* unauthorized access attempt, the system should both deny the request and create an audit log entry
**Validates: Requirements 6.3**

**Property 19: Audit log creation**
*For any* content management operation, an audit log entry should be created with complete operation details
**Validates: Requirements 6.4**

**Property 20: Audit log completeness**
*For any* audit log entry, it should contain user identification, timestamp, operation type, and relevant details
**Validates: Requirements 6.5**

## Error Handling

The system implements comprehensive error handling following Spring Boot best practices:

**Validation Errors (400 Bad Request)**
- Missing required fields in content creation/update
- Invalid file formats or sizes
- Malformed request data

**Authentication Errors (401 Unauthorized)**
- Missing or invalid authentication credentials
- Expired authentication tokens

**Authorization Errors (403 Forbidden)**
- Insufficient permissions for content management operations
- Role-based access violations

**Not Found Errors (404 Not Found)**
- Requested news article or announcement does not exist
- File not found for download requests

**Conflict Errors (409 Conflict)**
- Attempting to create duplicate content
- File upload conflicts

**Server Errors (500 Internal Server Error)**
- Database connectivity issues
- File system errors
- Unexpected system failures

**Error Response Format:**
```json
{
  "timestamp": "2024-01-13T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for field 'title': must not be blank",
  "path": "/api/news",
  "details": {
    "field": "title",
    "rejectedValue": "",
    "code": "NotBlank"
  }
}
```

## Testing Strategy

The testing strategy employs a dual approach combining unit tests and property-based tests to ensure comprehensive coverage and correctness validation.

### Unit Testing Approach

Unit tests focus on specific examples, edge cases, and integration points:

**Controller Layer Tests**
- HTTP request/response validation
- Authentication and authorization flows
- Error handling scenarios
- File upload/download operations

**Service Layer Tests**
- Business logic validation
- Transaction management
- Security context handling
- Audit logging verification

**Repository Layer Tests**
- Database operations
- Query correctness
- Entity relationship management
- Data integrity constraints

### Property-Based Testing Configuration

Property-based tests validate universal properties across all inputs using **JUnit 5** with **jqwik** library:

**Configuration Requirements:**
- Minimum 100 iterations per property test
- Each test tagged with feature and property reference
- Tag format: **Feature: news-management, Property {number}: {property_text}**

**Test Categories:**
- **Content Operations**: Creation, retrieval, update, deletion round-trip properties
- **Security Properties**: Authentication, authorization, and audit logging
- **File Management**: Upload, association, and retrieval properties
- **Data Integrity**: Validation, ordering, and visibility properties

**Example Property Test Structure:**
```java
@Property
@Tag("Feature: news-management, Property 1: Content chronological ordering")
void contentShouldBeOrderedChronologically(@ForAll List<NewsArticle> articles) {
    // Test implementation
}
```

The combination of unit tests and property-based tests ensures both concrete behavior validation and universal correctness guarantees across the entire input space.