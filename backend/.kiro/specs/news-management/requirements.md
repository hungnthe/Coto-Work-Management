# Tài liệu Yêu cầu Hệ thống

## Giới thiệu

Tài liệu này mô tả yêu cầu cho hệ thống quản lý nhiệm vụ và tin tức của ủy ban. Hệ thống bao gồm sáu nghiệp vụ chính:
1. **Nghiệp vụ 1**: Phân hệ tin tức công khai (Public Portal) - cho phép khách và người dùng xem tin tức, thông báo
2. **Nghiệp vụ 2**: Phân hệ quản lý nhiệm vụ và đơn vị (Core System) - số hóa quy trình giao việc giữa các phòng ban
3. **Nghiệp vụ 3**: Phân hệ quản lý dự án và cơ sở (Nâng cao) - quản lý cơ sở vật chất và hồ sơ dự án
4. **Nghiệp vụ 4**: Tổng hợp DVCTT (Dịch vụ công trực tuyến)
5. **Nghiệp vụ 5**: Tổng hợp cơ sở hạ tầng và dịch vụ
6. **Nghiệp vụ 6**: Tổng hợp KPI và Dashboard - báo cáo tổng hợp từ mọi nghiệp vụ

## Thuật ngữ

- **CoTo_Work_Management**: Hệ thống quản lý công việc trung tâm của ủy ban
- **Cán_bộ_nhập_liệu**: Actor chịu trách nhiệm nhập và cập nhật dữ liệu vào hệ thống
- **Quản_trị_file**: Actor có vai trò Admin, quản lý file và hệ thống
- **Các_đơn_vị_quản_lý**: Các phòng ban/đơn vị sử dụng hệ thống để quản lý công việc
- **USER**: Người dùng trong hệ thống với các vai trò khác nhau (role)
- **Khách**: Người truy cập chưa đăng nhập vào cổng thông tin
- **News**: Bài viết tin tức với các trường: news_id, title, summary, content, thumbnail_url, created_at, created_by, is_published
- **NOTIFICATION**: Thông báo hệ thống với các trường: notif_id, title, content, type, attachment_url, created_at
- **DON_VI**: Đơn vị/phòng ban với các trường: unit_code, unit_name
- **NHIEM_VU**: Nhiệm vụ được giao với các trường: task_id, task_code, unit_id, field_id, content, assigned_date, due_date, status, completed_date, is_overdue
- **NHIEM_VU_LOG**: Log thay đổi trạng thái nhiệm vụ với các trường: log_id, task_id, changed_at, old_status, note, changed_by
- **CO_SO**: Cơ sở vật chất với các trường: facility_id, facility_code, facility_name, facility_type, location, managing_unit_id, status_current
- **CO_SO_CAP_NHAT**: Audit trail cho cơ sở với các trường: update_id, facility_id, updated_at, status, note, updated_by
- **DU_AN_DTXD**: Dự án đầu tư xây dựng với các trường: project_id, project_code, project_name, unit_id, status, start_date, end_date, budget, Manager_id
- **TAI_LIEU_DTXD**: Tài liệu dự án với các trường: doc_id, start_date, doc_name, doc_type, file_path, uploaded_at, uploaded_by
- **KPI_TONG_HOP**: KPI tổng hợp với các trường: kpi_id, unit_id, period, total_tasks, done_tasks, overdue_tasks, done_rate, overdue_rate
- **TASK_SEQ**: Bảng sinh sequence cho mã nhiệm vụ với các trường: unit_id, field_id, current_seq
- **DVCTT**: Dịch vụ công trực tuyến với các cấp độ 1,2,3,4
- **Dashboard**: Bảng điều khiển tổng hợp hiển thị KPI và thông tin từ tất cả nghiệp vụ
- **File_Excel**: File dữ liệu được import/export từ hệ thống

## Yêu cầu

### NGHIỆP VỤ 1: PHÂN HỆ TIN TỨC CÔNG KHAI

### Yêu cầu 1: Xem danh sách tin tức

**Câu chuyện người dùng:** Là khách hoặc người dùng, tôi muốn xem danh sách tin tức trên trang chủ để có thể cập nhật thông tin mới nhất.

#### Tiêu chí chấp nhận

1. HỆ_THỐNG_TIN_TỨC SẼ hiển thị các bài tin mới nhất trên trang chủ
2. KHI hiển thị bài tin, HỆ_THỐNG_TIN_TỨC SẼ sắp xếp theo thứ tự thời gian ngược (mới nhất trước)
3. HỆ_THỐNG_TIN_TỨC SẼ thực hiện phân trang cho danh sách tin tức
4. KHI có nhiều hơn 10 bài viết, HỆ_THỐNG_TIN_TỨC SẼ hiển thị điều khiển phân trang
5. HỆ_THỐNG_TIN_TỨC SẼ hiển thị tiêu đề bài viết, ngày xuất bản và tóm tắt cho mỗi tin trong danh sách

### Yêu cầu 2: Xem chi tiết tin tức

**Câu chuyện người dùng:** Là khách hoặc người dùng, tôi muốn nhấp vào tiêu đề bài tin để đọc nội dung đầy đủ và có thông tin chi tiết về tin tức.

#### Tiêu chí chấp nhận

1. KHI người dùng nhấp vào tiêu đề bài tin, HỆ_THỐNG_TIN_TỨC SẼ chuyển đến trang xem chi tiết bài viết
2. HỆ_THỐNG_TIN_TỨC SẼ hiển thị nội dung bài viết đầy đủ bao gồm tiêu đề, nội dung, ảnh bìa và thông tin xuất bản
3. HỆ_THỐNG_TIN_TỨC SẼ hiển thị tác giả và ngày xuất bản bài viết
4. NẾU có ảnh bìa, HỆ_THỐNG_TIN_TỨC SẼ hiển thị nổi bật trong trang xem bài viết

### Yêu cầu 3: Quản lý nội dung tin tức

**Câu chuyện người dùng:** Là cán bộ nhập liệu hoặc quản trị file, tôi muốn tạo, chỉnh sửa, xóa và kiểm soát hiển thị của bài tin để duy trì thông tin chính xác và cập nhật trên cổng thông tin.

#### Tiêu chí chấp nhận

1. KHI người dùng có quyền tạo bài tin, BỘ_QUẢN_LÝ_NỘI_DUNG SẼ lưu bài tin với tiêu đề, nội dung, ảnh bìa và thông tin meta
2. BỘ_QUẢN_LÝ_NỘI_DUNG SẼ cho phép tải lên và liên kết ảnh bìa với bài tin
3. KHI người dùng có quyền chỉnh sửa bài viết, BỘ_QUẢN_LÝ_NỘI_DUNG SẼ cập nhật bài viết hiện có trong khi bảo toàn thời gian tạo
4. BỘ_QUẢN_LÝ_NỘI_DUNG SẼ cho phép người dùng có quyền xóa bài tin
5. BỘ_QUẢN_LÝ_NỘI_DUNG SẼ cung cấp điều khiển hiển thị để ẩn hoặc hiện bài viết mà không xóa chúng
6. KHI bài viết bị ẩn, HỆ_THỐNG_TIN_TỨC SẼ loại trừ khỏi hiển thị công khai trong khi vẫn bảo toàn trong cơ sở dữ liệu
7. BỘ_QUẢN_LÝ_NỘI_DUNG SẼ xác thực rằng các trường bắt buộc (tiêu đề, nội dung) được cung cấp trước khi lưu

### Yêu cầu 4: Xem thông báo

**Câu chuyện người dùng:** Là người dùng, tôi muốn xem thông báo và chỉ đạo chính thức từ ủy ban để cập nhật thông tin liên lạc quan trọng của tổ chức.

#### Tiêu chí chấp nhận

1. HỆ_THỐNG_TIN_TỨC SẼ hiển thị thông báo trong phần thông báo riêng biệt
2. KHI hiển thị thông báo, HỆ_THỐNG_TIN_TỨC SẼ sắp xếp theo thứ tự thời gian ngược
3. NẾU thông báo có file đính kèm, HỆ_THỐNG_TIN_TỨC SẼ cung cấp liên kết tải xuống cho các file đính kèm
4. HỆ_THỐNG_TIN_TỨC SẼ hiển thị tiêu đề thông báo, nội dung, ngày xuất bản và cơ quan ban hành
5. HỆ_THỐNG_TIN_TỨC SẼ hỗ trợ nhiều định dạng file cho đính kèm (PDF, DOC, DOCX, XLS, XLSX)

### Yêu cầu 5: Quản lý file đính kèm

**Câu chuyện người dùng:** Là cán bộ nhập liệu hoặc quản trị file, tôi muốn đính kèm file vào thông báo để cung cấp tài liệu hỗ trợ và thông tin chi tiết.

#### Tiêu chí chấp nhận

1. BỘ_QUẢN_LÝ_NỘI_DUNG SẼ cho phép tải lên nhiều file đính kèm vào thông báo
2. BỘ_QUẢN_LÝ_NỘI_DUNG SẼ xác thực loại file và từ chối các định dạng không được hỗ trợ
3. BỘ_QUẢN_LÝ_NỘI_DUNG SẼ thực thi giới hạn kích thước file cho đính kèm (tối đa 10MB mỗi file)
4. KHI file được tải lên, BỘ_QUẢN_LÝ_NỘI_DUNG SẼ lưu trữ chúng an toàn và tạo định danh duy nhất
5. BỘ_QUẢN_LÝ_NỘI_DUNG SẼ cho phép xóa file đính kèm khỏi thông báo

### Yêu cầu 6: Bảo mật nội dung và kiểm soát truy cập

**Câu chuyện người dùng:** Là quản trị file, tôi muốn đảm bảo chỉ nhân viên có quyền mới có thể quản lý nội dung để duy trì tính toàn vẹn và chính xác của thông tin được xuất bản.

#### Tiêu chí chấp nhận

1. BỘ_QUẢN_LÝ_NỘI_DUNG SẼ xác thực người dùng trước khi cho phép các thao tác quản lý nội dung
1. BỘ_QUẢN_LÝ_NỘI_DUNG SẼ chỉ ủy quyền cho người dùng có vai trò quản trị file hoặc cán bộ nhập liệu để quản lý nội dung
3. KHI có nỗ lực truy cập trái phép, BỘ_QUẢN_LÝ_NỘI_DUNG SẼ từ chối yêu cầu và ghi log nỗ lực đó
4. BỘ_QUẢN_LÝ_NỘI_DUNG SẼ duy trì log kiểm toán của tất cả các thao tác quản lý nội dung
5. BỘ_QUẢN_LÝ_NỘI_DUNG SẼ bao gồm định danh người dùng, thời gian và loại thao tác trong log kiểm toán

### NGHIỆP VỤ 2: PHÂN HỆ QUẢN LÝ NHIỆM VỤ VÀ ĐƠN VỊ

### Yêu cầu 7: Giao nhiệm vụ mới

**Câu chuyện người dùng:** Là các đơn vị quản lý, tôi muốn tạo và giao nhiệm vụ cho các đơn vị hoặc cá nhân để số hóa quy trình giao việc trong cơ quan.

#### Tiêu chí chấp nhận

1. KHI lãnh đạo tạo nhiệm vụ mới, CoTo_Work_Management SẼ tự động sinh mã nhiệm vụ duy nhất
2. CoTo_Work_Management SẼ cho phép gán nhiệm vụ cho một đơn vị cụ thể hoặc cá nhân
3. KHI tạo nhiệm vụ, CoTo_Work_Management SẼ yêu cầu các thông tin bắt buộc: tiêu đề, mô tả, hạn hoàn thành
4. CoTo_Work_Management SẼ lưu trữ thông tin người giao việc và thời gian giao việc
5. CoTo_Work_Management SẼ thiết lập trạng thái ban đầu của nhiệm vụ là "Mới"

### Yêu cầu 8: Cập nhật tiến độ nhiệm vụ

**Câu chuyện người dùng:** Là cán bộ nhập liệu, tôi muốn cập nhật trạng thái và tiến độ nhiệm vụ được giao để báo cáo tiến độ công việc.

#### Tiêu chí chấp nhận

1. KHI nhân viên cập nhật trạng thái, HỆ_THỐNG SẼ cho phép chuyển từ "Mới" sang "Đang thực hiện"
2. KHI nhiệm vụ đang thực hiện, HỆ_THỐNG SẼ cho phép cập nhật phần trăm hoàn thành
3. KHI nhiệm vụ hoàn tất, HỆ_THỐNG SẼ cho phép chuyển trạng thái sang "Hoàn thành"
4. HỆ_THỐNG SẼ yêu cầu ghi chú khi cập nhật trạng thái
5. HỆ_THỐNG SẼ cập nhật thời gian sửa đổi cuối cùng khi có thay đổi trạng thái

### Yêu cầu 9: Ghi log tự động

**Câu chuyện người dùng:** Là CoTo Work Management, tôi cần ghi lại tất cả thay đổi trạng thái nhiệm vụ để có thể theo dõi lịch sử và kiểm toán.

#### Tiêu chí chấp nhận

1. KHI có thay đổi trạng thái nhiệm vụ, HỆ_THỐNG SẼ tự động tạo bản ghi log
2. HỆ_THỐNG SẼ lưu trữ trạng thái cũ, trạng thái mới và thời gian thay đổi trong log
3. HỆ_THỐNG SẼ ghi nhận người thực hiện thay đổi trong log
4. HỆ_THỐNG SẼ lưu trữ ghi chú kèm theo nếu có
5. HỆ_THỐNG SẼ đảm bảo log không thể bị chỉnh sửa sau khi tạo

### Yêu cầu 10: Thống kê và báo cáo KPI

**Câu chuyện người dùng:** Là các đơn vị quản lý, tôi muốn xem thống kê hiệu suất làm việc của các đơn vị để đánh giá và cải thiện hiệu quả công việc.

#### Tiêu chí chấp nhận

1. HỆ_THỐNG SẼ tính toán tỷ lệ hoàn thành nhiệm vụ theo đơn vị
2. HỆ_THỐNG SẼ thống kê số nhiệm vụ quá hạn theo đơn vị
3. KHI hiển thị báo cáo, HỆ_THỐNG SẼ cho phép lọc theo khoảng thời gian
4. HỆ_THỐNG SẼ hiển thị biểu đồ trực quan cho các chỉ số KPI
5. HỆ_THỐNG SẼ cho phép xuất báo cáo dưới dạng file Excel hoặc PDF

### Yêu cầu 11: Quản lý đơn vị và người dùng

**Câu chuyện người dùng:** Là quản trị file, tôi muốn quản lý thông tin đơn vị và người dùng để duy trì cấu trúc tổ chức chính xác trong hệ thống.

#### Tiêu chí chấp nhận

1. HỆ_THỐNG SẼ cho phép tạo, sửa, xóa thông tin đơn vị
2. HỆ_THỐNG SẼ duy trì cấu trúc phân cấp của các đơn vị
3. KHI gán người dùng vào đơn vị, HỆ_THỐNG SẼ cập nhật thông tin liên kết
4. HỆ_THỐNG SẼ cho phép thiết lập vai trò cho người dùng (lãnh đạo, nhân viên, quản trị viên)
5. HỆ_THỐNG SẼ đảm bảo mỗi người dùng thuộc ít nhất một đơn vị

### Yêu cầu 12: Thông báo và nhắc nhở

**Câu chuyện người dùng:** Là người dùng hệ thống, tôi muốn nhận thông báo về nhiệm vụ mới và nhắc nhở về hạn hoàn thành để không bỏ lỡ công việc quan trọng.

#### Tiêu chí chấp nhận

1. KHI có nhiệm vụ mới được giao, HỆ_THỐNG SẼ gửi thông báo đến người được giao
2. KHI nhiệm vụ sắp đến hạn, HỆ_THỐNG SẼ gửi nhắc nhở trước 3 ngày và 1 ngày
3. KHI nhiệm vụ quá hạn, HỆ_THỐNG SẼ gửi thông báo cảnh báo
4. HỆ_THỐNG SẼ hiển thị thông báo trong giao diện người dùng
5. HỆ_THỐNG SẼ cho phép người dùng đánh dấu đã đọc thông báo

### NGHIỆP VỤ 3: PHÂN HỆ QUẢN LÝ DỰ ÁN VÀ CƠ SỞ (NÂNG CAO)

### Yêu cầu 13: Quản lý cơ sở vật chất

**Câu chuyện người dùng:** Là quản trị file, tôi muốn quản lý thông tin cơ sở vật chất để duy trì cơ sở dữ liệu chính xác về tài sản và hạ tầng của ủy ban.

#### Tiêu chí chấp nhận

1. HỆ_THỐNG SẼ cho phép tạo, xem, cập nhật và xóa thông tin cơ sở vật chất
2. KHI cập nhật thông tin cơ sở, HỆ_THỐNG SẼ tự động lưu vào bảng audit trail
3. HỆ_THỐNG SẼ lưu trữ thông tin chi tiết về từng cơ sở: tên, địa chỉ, loại, trạng thái
4. HỆ_THỐNG SẼ theo dõi lịch sử thay đổi của mỗi cơ sở vật chất
5. HỆ_THỐNG SẼ cho phép tìm kiếm và lọc cơ sở theo nhiều tiêu chí

### Yêu cầu 14: Quản lý hồ sơ dự án đầu tư xây dựng

**Câu chuyện người dùng:** Là cán bộ quản lý dự án, tôi muốn quản lý hồ sơ và tài liệu dự án để theo dõi tiến độ và lưu trữ tài liệu thiết kế.

#### Tiêu chí chấp nhận

1. HỆ_THỐNG SẼ cho phép tạo và quản lý thông tin dự án đầu tư xây dựng
2. HỆ_THỐNG SẼ cho phép upload file PDF/DOC thiết kế và liên kết với dự án
3. KHI upload tài liệu, HỆ_THỐNG SẼ lưu metadata và đường dẫn file trong cơ sở dữ liệu
4. HỆ_THỐNG SẼ phân loại tài liệu theo loại: thiết kế, thuyết minh, dự toán, khác
5. HỆ_THỐNG SẼ cho phép tải xuống và xem trước tài liệu dự án

### Yêu cầu 15: Audit trail cho cơ sở vật chất

**Câu chuyện người dùng:** Là CoTo Work Management, tôi cần ghi lại mọi thay đổi về cơ sở vật chất để có thể kiểm toán và theo dõi lịch sử.

#### Tiêu chí chấp nhận

1. KHI có thay đổi thông tin cơ sở, HỆ_THỐNG SẼ tự động tạo bản ghi audit
2. HỆ_THỐNG SẼ lưu trữ giá trị cũ và giá trị mới của các trường được thay đổi
3. HỆ_THỐNG SẼ ghi nhận người thực hiện thay đổi và thời gian thay đổi
4. HỆ_THỐNG SẼ đảm bảo bản ghi audit không thể bị chỉnh sửa
5. HỆ_THỐNG SẼ cho phép xem lịch sử thay đổi của từng cơ sở vật chất

### NGHIỆP VỤ 4: TỔNG HỢP DVCTT (DỊCH VỤ CÔNG TRỰC TUYẾN)

### Yêu cầu 16: Quản lý danh mục DVCTT

**Câu chuyện người dùng:** Là cán bộ quản lý DVCTT, tôi muốn quản lý danh mục các dịch vụ công trực tuyến để theo dõi và báo cáo hiệu quả triển khai.

#### Tiêu chí chấp nhận

1. HỆ_THỐNG SẼ cho phép tạo và quản lý danh mục dịch vụ công trực tuyến
2. HỆ_THỐNG SẼ phân loại DVCTT theo cấp độ: cấp 1, cấp 2, cấp 3, cấp 4
3. HỆ_THỐNG SẼ theo dõi trạng thái triển khai của từng dịch vụ
4. HỆ_THỐNG SẼ lưu trữ thông tin về đơn vị chủ trì và đơn vị phối hợp
5. HỆ_THỐNG SẼ cho phép cập nhật tiến độ triển khai DVCTT

### Yêu cầu 17: Báo cáo thống kê DVCTT

**Câu chuyện người dùng:** Là lãnh đạo, tôi muốn xem báo cáo thống kê về tình hình triển khai DVCTT để đánh giá hiệu quả và đưa ra quyết định.

#### Tiêu chí chấp nhận

1. HỆ_THỐNG SẼ thống kê số lượng DVCTT theo từng cấp độ
2. HỆ_THỐNG SẼ tính toán tỷ lệ hoàn thành triển khai DVCTT
3. HỆ_THỐNG SẼ hiển thị biểu đồ tiến độ triển khai theo thời gian
4. HỆ_THỐNG SẼ cho phép xuất báo cáo DVCTT theo định kỳ
5. HỆ_THỐNG SẼ so sánh với chỉ tiêu kế hoạch đã đề ra

### NGHIỆP VỤ 5: TỔNG HỢP CƠ SỞ HẠ TẦNG VÀ DỊCH VỤ

### Yêu cầu 18: Quản lý cơ sở hạ tầng IT

**Câu chuyện người dùng:** Là quản trị viên IT, tôi muốn quản lý thông tin về cơ sở hạ tầng công nghệ thông tin để đảm bảo vận hành ổn định.

#### Tiêu chí chấp nhận

1. HỆ_THỐNG SẼ quản lý thông tin máy chủ, thiết bị mạng, phần mềm
2. HỆ_THỐNG SẼ theo dõi trạng thái hoạt động của từng thiết bị
3. HỆ_THỐNG SẼ lưu trữ thông tin bảo trì và nâng cấp thiết bị
4. HỆ_THỐNG SẼ cảnh báo khi thiết bị cần bảo trì hoặc thay thế
5. HỆ_THỐNG SẼ tạo báo cáo tình trạng cơ sở hạ tầng định kỳ

### Yêu cầu 19: Quản lý dịch vụ IT

**Câu chuyện người dùng:** Là người quản lý dịch vụ, tôi muốn theo dõi các dịch vụ IT đang cung cấp để đảm bảo chất lượng phục vụ.

#### Tiêu chí chấp nhận

1. HỆ_THỐNG SẼ quản lý danh mục các dịch vụ IT đang cung cấp
2. HỆ_THỐNG SẼ theo dõi mức độ sử dụng và hiệu suất của từng dịch vụ
3. HỆ_THỐNG SẼ ghi nhận phản hồi và đánh giá từ người dùng
4. HỆ_THỐNG SẼ tạo báo cáo chất lượng dịch vụ định kỳ
5. HỆ_THỐNG SẼ đề xuất cải thiện dựa trên dữ liệu phân tích

### NGHIỆP VỤ 6: TỔNG HỢP KPI VÀ DASHBOARD

### Yêu cầu 20: Dashboard tổng hợp

**Câu chuyện người dùng:** Là các đơn vị quản lý, tôi muốn có dashboard tổng hợp để xem toàn cảnh hoạt động của ủy ban qua các chỉ số KPI quan trọng.

#### Tiêu chí chấp nhận

1. HỆ_THỐNG SẼ hiển thị dashboard với các KPI từ tất cả nghiệp vụ
2. HỆ_THỐNG SẼ cập nhật dữ liệu dashboard theo thời gian thực
3. HỆ_THỐNG SẼ cho phép tùy chỉnh hiển thị theo vai trò người dùng
4. HỆ_THỐNG SẼ hiển thị xu hướng thay đổi của các chỉ số theo thời gian
5. HỆ_THỐNG SẼ cảnh báo khi có chỉ số bất thường hoặc vượt ngưỡng

### Yêu cầu 21: Báo cáo tổng hợp đa nghiệp vụ

**Câu chuyện người dùng:** Là các đơn vị quản lý, tôi muốn có báo cáo tổng hợp từ nhiều nghiệp vụ để đánh giá hiệu quả hoạt động tổng thể.

#### Tiêu chí chấp nhận

1. HỆ_THỐNG SẼ tạo báo cáo tổng hợp từ dữ liệu của tất cả nghiệp vụ
2. HỆ_THỐNG SẼ cho phép tùy chỉnh nội dung báo cáo theo nhu cầu
3. HỆ_THỐNG SẼ hỗ trợ xuất báo cáo nhiều định dạng (PDF, Excel, Word)
4. HỆ_THỐNG SẼ lên lịch tự động gửi báo cáo định kỳ
5. HỆ_THỐNG SẼ so sánh với kế hoạch và đề xuất hành động cải thiện

### Yêu cầu 22: Phân tích xu hướng và dự báo

**Câu chuyện người dùng:** Là nhà hoạch định chính sách, tôi muốn phân tích xu hướng và dự báo để đưa ra quyết định chiến lược phù hợp.

#### Tiêu chí chấp nhận

1. HỆ_THỐNG SẼ phân tích xu hướng dựa trên dữ liệu lịch sử
2. HỆ_THỐNG SẼ dự báo các chỉ số KPI trong tương lai
3. HỆ_THỐNG SẼ xác định các yếu tố ảnh hưởng đến hiệu suất
4. HỆ_THỐNG SẼ đề xuất kế hoạch phát triển dựa trên phân tích
5. HỆ_THỐNG SẼ cảnh báo rủi ro và cơ hội tiềm năng