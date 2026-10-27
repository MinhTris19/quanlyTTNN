# 📖 TÀI LIỆU HƯỚNG DẪN SỬ DỤNG HỆ THỐNG LINGUAHUB (USER MANUAL)

> **Hệ thống Quản lý Đào tạo Trung tâm Ngoại ngữ tích hợp Trợ lý Trí tuệ Nhân tạo Đa tầng (Generative AI & Resilient Engine)**

---

## 1. TỔNG QUAN & KHỞI ĐỘNG HỆ THỐNG

### 1.1 Khởi động bằng 1-Click
1. Mở thư mục gốc của dự án `QuanLyTTNN`.
2. Nhấp đúp chuột vào file **`start-server.bat`**.
3. Kịch bản tự động kiểm tra Node.js, cài đặt phụ thuộc và khởi chạy máy chủ tại:
   👉 **`http://localhost:3000`**

### 1.2 Tài khoản trải nghiệm mặc định (Demo Accounts)

| Phân hệ / Vai trò | Tên đăng nhập | Mật khẩu mặc định | Trang truy cập trực tiếp | Chức năng chính |
|---|---|:---:|---|---|
| **Quản trị viên (Admin)** | `admin` | `123456` | `http://localhost:3000/admin.html` | Quản trị học viên, giảng viên, lớp học, thống kê, AI Quản trị |
| **Giảng viên (Teacher)** | `lan` hoặc `hung` | `123456` | `http://localhost:3000/teacher.html` | Xem lớp dạy, điểm danh học viên, nhập điểm thi, AI Sư phạm |
| **Học viên (Student)** | `nguyenvana` | `123456` | `http://localhost:3000/student.html` | Xem lớp đang học, chuyên cần, bảng điểm, AI Cố vấn học tập |

---

## 2. HƯỚNG DẪN DÀNH CHO QUẢN TRỊ VIÊN (ADMIN)

### 2.1 Đăng nhập Quản trị
* Truy cập `http://localhost:3000/login.html` hoặc `admin-login.html`.
* Nhập `admin` / `123456` $\rightarrow$ Nhấn **Đăng nhập**.

### 2.2 Các thao tác nghiệp vụ chính
1. **Xem Bảng điều khiển (Overview)**:
   * Quan sát 4 thẻ thống kê: Tổng học viên, Giảng viên, Lớp học đang mở, Học viên hoạt động.
2. **Quản lý Học viên**:
   * Chuyển tab **Học viên**: Xem danh sách đầy đủ.
   * Nhấn **+ Thêm Học Viên** $\rightarrow$ Điền Họ tên, Email, Tên đăng nhập, Mật khẩu, Số điện thoại $\rightarrow$ Nhấn Lưu.
   * Thao tác nhanh: Khóa tài khoản, Mở khóa, hoặc Đổi mật khẩu.
3. **Quản lý Giảng viên**:
   * Chuyển tab **Giảng viên**: Xem danh sách bằng cấp, số điện thoại và trạng thái.
   * Thêm mới giảng viên và chỉ định trình độ (TOEFL, IELTS 8.5...).
4. **Quản lý Lớp học**:
   * Nhấn **+ Tạo Lớp Mới**: Nhập tên lớp (VD: `IELTS 6.5A`), mã lớp, sĩ số tối đa, chọn Giảng viên chủ nhiệm $\rightarrow$ Nhấn Tạo.

### 2.3 Sử dụng AI Quản trị (Executive AI)
* Nhấn vào biểu tượng **🤖** ở góc phải màn hình.
* Nhập các câu hỏi mẫu:
  * *"Thống kê tổng quan tình hình trung tâm hiện nay?"*
  * *"Trung tâm có bao nhiêu giảng viên và lớp học?"*
  * *"Có lớp nào học viên vắng nhiều cần lưu ý không?"*
* Trợ lý AI sẽ tổng hợp dữ liệu thực tế từ CSDL và đưa ra nhận xét chiến lược quản lý.

---

## 3. HƯỚNG DẪN DÀNH CHO GIẢNG VIÊN (TEACHER)

### 3.1 Đăng nhập Giảng viên
* Tài khoản: `lan` hoặc `hung` / Mật khẩu: `123456`.
* Sau khi đăng nhập, hệ thống tự động chuyển đến bảng điều khiển Giảng viên.

### 3.2 Điểm danh học viên (Attendance)
1. Chọn lớp học phụ trách từ danh sách lớp.
2. Hệ thống hiển thị danh sách học viên trong lớp.
3. Chọn trạng thái điểm danh cho từng học viên: **Có mặt (Present)** hoặc **Vắng mặt (Absent)** kèm ghi chú (ví dụ: *Nghỉ có phép*).
4. Nhấn **Lưu Điểm Danh**.

### 3.3 Nhập và quản lý điểm số (Gradebook)
1. Chọn bài thi cần chấm: **Midterm Test**, **Final Exam**, **Mini-test**.
2. Nhập số điểm (thang điểm 100) cho từng học viên.
3. Nhập nhận xét sư phạm (ví dụ: *Tiến bộ phần Nghe*, *Cần ôn thêm Ngữ pháp*).
4. Nhấn **Cập nhật Điểm**.

### 3.4 Sử dụng AI Sư phạm (Academic AI)
* Nhấn nút **🤖 AI Giảng Viên**:
  * *"Tôi đang phụ trách những lớp nào?"*
  * *"Hôm nay lớp TOEIC 500A có ai vắng mặt không?"*
  * *"Điểm kiểm tra của học viên Nguyễn Văn A ra sao?"*
  * *"Tư vấn giúp tôi phương pháp kèm cặp cho học viên có điểm dưới 75?"*

---

## 4. HƯỚNG DẪN DÀNH CHO HỌC VIÊN (STUDENT)

### 4.1 Đăng nhập Học viên
* Tài khoản: `nguyenvana` / Mật khẩu: `123456`.
* Đăng ký tài khoản mới: Nhấn **Đăng ký ngay** tại trang đăng nhập nếu chưa có tài khoản.

### 4.2 Tra cứu thông tin cá nhân
1. **Lớp học của tôi**: Xem mã lớp, tên lớp, giáo viên chủ nhiệm và phòng học.
2. **Lịch sử chuyên cần**: Theo dõi chi tiết số buổi đã tham gia, số buổi vắng và tỷ lệ đi học chuyên cần (%).
3. **Bảng điểm kết quả học tập**: Xem điểm số từng bài thi (Giữa kỳ, Cuối kỳ) cùng lời nhận xét của giáo viên.

### 4.3 Trò chuyện với AI Cố vấn Học tập (Mentor AI)
* Nhấn vào góc **🤖 AI Học Viên**:
  * *"Tôi đang học lớp nào và thầy/cô nào dạy tôi?"*
  * *"Tình hình điểm danh và số ngày nghỉ của tôi thế nào?"*
  * *"Điểm thi vừa rồi của tôi đạt bao nhiêu điểm?"*
  * *"Với mức điểm 78.5 môn TOEIC, tôi nên cải thiện kỹ năng nào để đạt 650+?"*
* Mentor AI sẽ động viên, hướng dẫn lộ trình và phương pháp ôn luyện theo đúng năng lực của học viên.

---

## 5. XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

1. **Không mở được trang web**:
   * Kiểm tra xem cửa sổ terminal màu đen của `start-server.bat` có đang mở không. Nếu tắt, hãy mở lại.
2. **AI phản hồi chế độ `[Smart Fallback Engine]`**:
   * Điều này có nghĩa là API Key Gemini chưa được cung cấp hoặc Google đang tạm thời nghẽn mạng. Hệ thống vẫn tự động trả lời đúng 100% dữ liệu từ CSDL cho bạn mà không bị lỗi.
   * Để bật Google Gemini AI tạo sinh, hãy nhập API Key vào file `.env` (xem hướng dẫn trong `README.md`).
3. **Quên mật khẩu tài khoản**:
   * Liên hệ Quản trị viên (`admin`) để được đặt lại mật khẩu trực tiếp trong Bảng điều khiển Quản trị.
