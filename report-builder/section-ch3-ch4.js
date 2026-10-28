// =============================================================================
// SECTION CH3 & CH4: THIẾT KẾ UML VÀ THIẾT KẾ CƠ SỞ DỮ LIỆU TOÀN DIỆN
// =============================================================================

const { AlignmentType } = require('docx');
const { p, h1, h2, h3, bullet, callout, createTable } = require('./styles');

function buildChapter3() {
  return [
    h1('CHƯƠNG 3. THIẾT KẾ HƯỚNG ĐỐI TƯỢNG VÀ MÔ HÌNH HÓA UML', true),
    p('Chương này mô hình hóa hành vi và cấu trúc của hệ thống LinguaHub theo chuẩn ngôn ngữ mô hình hóa thống nhất UML (Unified Modeling Language), bao gồm phân loại Actor, danh sách Use Case, đặc tả chi tiết 6 Use Case quan trọng theo chuẩn IEEE 830, Biểu đồ lớp (Class Diagram) và Biểu đồ tuần tự (Sequence Diagram) theo chuẩn đầu ra CLO4.'),

    h2('3.1. Danh sách Actor và Phân nhóm Use Case'),
    p('Hệ thống LinguaHub xác định 3 tác nhân chính (Actors) và phân bổ 18 Use Case thành 3 phân nhóm rõ rệt:'),
    bullet('Sở hữu 11 Use Case: Đăng nhập (UC01), Quản lý tài khoản người dùng (UC02), Phân quyền đa cấp (UC03), Quản lý học viên (UC04), Quản lý giảng viên (UC05), Quản lý lớp học (UC06), Quản lý lịch học (UC07), Phân công giảng viên chủ nhiệm (UC08), Quản lý học phí (UC10), Báo cáo thống kê vận hành (UC17), Trợ lý AI Cố vấn Quản trị (UC18).', '• Phân nhóm Quản trị viên (Admin):'),
    bullet('Sở hữu 6 Use Case: Đăng nhập (UC01), Xem danh sách lớp phụ trách (UC06), Điểm danh nhanh cả lớp & chuyên cần (UC12), Nhập và chỉnh sửa điểm thi (UC13), Xem kết quả lớp học (UC14), Trợ lý AI Sư phạm (UC18).', '• Phân nhóm Giảng viên (Teacher):'),
    bullet('Sở hữu 8 Use Case: Đăng nhập (UC01), Xem thông tin lớp học (UC16), Đăng ký lớp học mở (UC09), Xem lịch học cá nhân (UC15), Tra cứu học phí (UC11), Xem lịch sử chuyên cần cá nhân (UC12), Tra cứu bảng điểm cá nhân (UC14), Trợ lý AI Cố vấn Học tập & Luyện thi (UC18).', '• Phân nhóm Học viên (Student):'),

    h2('3.2. Đặc tả chi tiết 6 Use Case quan trọng theo chuẩn học thuật IEEE 830'),

    h3('3.2.1. Đặc tả Use Case UC01: Đăng nhập hệ thống (User Authentication)'),
    createTable(
      ['Mục đặc tả', 'Nội dung chi tiết theo chuẩn IEEE 830'],
      [
        ['Tên Use Case', 'UC01: Đăng nhập hệ thống và cấp Session Token (User Login)'],
        ['Tác nhân (Actor)', 'Tất cả người dùng (Admin, Teacher, Student)'],
        ['Mục đích', 'Xác thực danh tính người dùng và cấp phiên làm việc an toàn để truy cập các chức năng tương ứng.'],
        ['Tiền điều kiện', 'Tài khoản người dùng đã được kích hoạt trong hệ thống (IsActive = 1).'],
        ['Hậu điều kiện', 'Hệ thống cấp Session Bearer Token và điều hướng người dùng tới trang chủ của vai trò đó.'],
        ['Luồng sự kiện chính (Main Flow)', '1. Người dùng mở trang login.html và nhập Tên đăng nhập (Username) và Mật khẩu (Password).\n2. Người dùng nhấn nút "Đăng Nhập".\n3. Trình duyệt gửi yêu cầu HTTP POST /api/auth/login kèm payload JSON.\n4. Máy chủ tìm kiếm tài khoản trong CSDL và kiểm tra mật khẩu qua hàm so sánh an toàn.\n5. Máy chủ tạo Session ID mới, gán quyền Role và lưu vào bộ nhớ phiên.\n6. Máy chủ trả về phản hồi HTTP 200 kèm sessionId và thông tin người dùng.\n7. Trình duyệt lưu sessionId vào sessionStorage và tự động chuyển hướng:\n   - Admin -> admin.html\n   - Teacher -> teacher.html\n   - Student -> student.html'],
        ['Luồng ngoại lệ (Exceptions)', '• 4a. Tên đăng nhập không tồn tại hoặc mật khẩu sai: Hệ thống trả về mã HTTP 401 Unauthorized kèm thông báo: "Tên đăng nhập hoặc mật khẩu không chính xác".\n• 4b. Tài khoản bị khóa (IsActive = 0): Hệ thống trả về mã HTTP 403 Forbidden: "Tài khoản của bạn đã bị tạm khóa, vui lòng liên hệ Ban Quản trị".\n• 4c. Nhập trường rỗng: Giao diện validate ngay tại client báo: "Vui lòng nhập đầy đủ thông tin".']
      ],
      [24, 76],
      [AlignmentType.CENTER, AlignmentType.LEFT]
    ),

    h3('3.2.2. Đặc tả Use Case UC06: Quản lý và Khởi tạo lớp học mới (Class Management)'),
    createTable(
      ['Mục đặc tả', 'Nội dung chi tiết theo chuẩn IEEE 830'],
      [
        ['Tên Use Case', 'UC06: Quản lý và Khởi tạo lớp học mới (Create Class)'],
        ['Tác nhân (Actor)', 'Quản trị viên (Admin)'],
        ['Mục đích', 'Mở thêm lớp học ngoại ngữ mới, cấu hình ca học, phòng học, học phí và phân công giáo viên.'],
        ['Tiền điều kiện', 'Admin đã đăng nhập thành công vào hệ thống.'],
        ['Luồng sự kiện chính (Main Flow)', '1. Admin truy cập tab "Lớp học" tại trang admin.html.\n2. Admin nhấn nút "Thêm Lớp Mới", mở form modal nhập liệu.\n3. Admin nhập các thông tin: Tên lớp (Name), Mã lớp (Code), Mô tả khóa học, Chọn Giảng viên chủ nhiệm từ danh sách, Sĩ số tối đa, Học phí, Lịch học và Phòng học.\n4. Admin nhấn "Lưu Lớp Học".\n5. Hệ thống kiểm tra tính duy nhất của Mã lớp (Code).\n6. Hệ thống thêm bản ghi mới vào bảng Classes với trạng thái "active".\n7. Hệ thống cập nhật danh sách lớp trên bảng hiển thị và thông báo: "Tạo lớp học thành công!".'],
        ['Luồng ngoại lệ (Exceptions)', '• 5a. Mã lớp đã tồn tại: Hệ thống hiển thị cảnh báo: "Mã lớp này đã được sử dụng, vui lòng chọn mã khác".\n• 5b. Chưa chọn giáo viên: Báo lỗi "Vui lòng chỉ định Giảng viên phụ trách lớp".']
      ],
      [24, 76],
      [AlignmentType.CENTER, AlignmentType.LEFT]
    ),

    h3('3.2.3. Đặc tả Use Case UC09: Đăng ký tham gia lớp học mở (Course Enrollment)'),
    createTable(
      ['Mục đặc tả', 'Nội dung chi tiết theo chuẩn IEEE 830'],
      [
        ['Tên Use Case', 'UC09: Đăng ký tham gia lớp học mở (Self Course Enrollment - F09)'],
        ['Tác nhân (Actor)', 'Học viên (Student)'],
        ['Mục đích', 'Cho phép học viên tự tra cứu các lớp học đang mở tuyển sinh và chủ động đăng ký tham gia.'],
        ['Tiền điều kiện', 'Học viên đã đăng nhập và lớp học đang ở trạng thái active.'],
        ['Luồng sự kiện chính (Main Flow)', '1. Học viên vào mục "Đăng ký Khóa học" tại student.html.\n2. Hệ thống truy vấn các lớp học active từ CSDL và hiển thị sĩ số hiện tại / sĩ số tối đa.\n3. Học viên chọn lớp học mong muốn và bấm nút "Đăng Ký Tham Gia".\n4. Hệ thống kiểm tra: Học viên chưa từng đăng ký lớp này và lớp còn chỗ trống.\n5. Hệ thống tạo bản ghi mới vào bảng ClassStudents.\n6. Hệ thống đồng thời tạo hóa đơn học phí tương ứng vào bảng Tuition với trạng thái pending.\n7. Hệ thống hiển thị thông báo chúc mừng và lớp học mới xuất hiện ngay trên Dashboard của học viên.'],
        ['Luồng ngoại lệ (Exceptions)', '• 4a. Lớp đã đầy sĩ số: Hệ thống báo: "Lớp học đã đủ sĩ số tối đa, vui lòng chọn lớp khác".\n• 4b. Học viên đã đăng ký lớp này: Báo: "Bạn đã đăng ký lớp học này rồi".']
      ],
      [24, 76],
      [AlignmentType.CENTER, AlignmentType.LEFT]
    ),

    h3('3.2.4. Đặc tả Use Case UC12: Điểm danh nhanh cả lớp và chuyên cần (Bulk Attendance - F12)'),
    createTable(
      ['Mục đặc tả', 'Nội dung chi tiết theo chuẩn IEEE 830'],
      [
        ['Tên Use Case', 'UC12: Điểm danh nhanh cả lớp và quản lý chuyên cần (Take Bulk Attendance - F12)'],
        ['Tác nhân (Actor)', 'Giảng viên (Teacher)'],
        ['Mục đích', 'Ghi nhận sự có mặt, vắng mặt hoặc đi muộn của toàn bộ học viên trong buổi học một cách nhanh chóng.'],
        ['Tiền điều kiện', 'Giảng viên đã đăng nhập và được phân công chủ nhiệm lớp học này.'],
        ['Luồng sự kiện chính (Main Flow)', '1. Giảng viên mở giao diện teacher-classes.html và chọn lớp học cần điểm danh.\n2. Giảng viên chọn ngày diễn ra buổi học (mặc định là ngày hôm nay).\n3. Hệ thống tải danh sách học viên trong lớp.\n4. Giảng viên có thể bấm "⚡ Tất Cả Có Mặt" để đánh dấu nhanh 100% học viên có mặt.\n5. Với các bạn vắng hoặc đi muộn, giảng viên tích chọn trạng thái (absent, late, excused) và nhập lý do vào ô Ghi chú.\n6. Giảng viên bấm nút "💾 Lưu Bảng Điểm Danh".\n7. Client gửi HTTP POST /api/attendance/bulk chứa mảng toàn bộ bản ghi chuyên cần.\n8. Máy chủ lưu trữ vào bảng Attendance, cập nhật tỷ lệ chuyên cần (%) tích lũy của học viên và trả về thông báo thành công.'],
        ['Luồng ngoại lệ (Exceptions)', '• 3a. Lớp chưa có học viên nào: Hệ thống thông báo: "Lớp học chưa có học viên nào để điểm danh".\n• 7a. Lỗi kết nối CSDL: Hệ thống giữ nguyên trạng thái trên form và thông báo: "Không thể lưu điểm danh, vui lòng thử lại".']
      ],
      [24, 76],
      [AlignmentType.CENTER, AlignmentType.LEFT]
    ),

    h3('3.2.5. Đặc tả Use Case UC13: Nhập và cập nhật điểm kiểm tra (Grade Management - F13)'),
    createTable(
      ['Mục đặc tả', 'Nội dung chi tiết theo chuẩn IEEE 830'],
      [
        ['Tên Use Case', 'UC13: Nhập và chỉnh sửa điểm kiểm tra (Input & Update Grades - F13)'],
        ['Tác nhân (Actor)', 'Giảng viên (Teacher)'],
        ['Mục đích', 'Nhập điểm bài thi giữa kỳ (Midterm) và cuối kỳ (Final) kèm lời nhận xét sư phạm cho học viên.'],
        ['Tiền điều kiện', 'Giảng viên phụ trách lớp học đã đăng nhập.'],
        ['Luồng sự kiện chính (Main Flow)', '1. Giảng viên truy cập mục "Quản lý Điểm số" của lớp học.\n2. Giảng viên chọn bài kiểm tra: Midterm Test hoặc Final Exam.\n3. Danh sách học viên hiển thị kèm ô nhập điểm và ô nhận xét sư phạm.\n4. Giảng viên nhập số điểm (thang 0.0 - 100.0) và lời nhận xét (ví dụ: "Ngữ pháp vững, cần luyện thêm phát âm").\n5. Giảng viên bấm nút "Cập Nhật Điểm".\n6. Hệ thống kiểm tra tính hợp lệ của điểm số (0 <= score <= 100).\n7. Dữ liệu được ghi vào bảng Scores. Nếu học viên đã có điểm bài thi này, hệ thống tự động cập nhật bản ghi cũ (Update in-place).\n8. Điểm số mới được phản ánh tức thì lên bảng điểm cá nhân của học viên.'],
        ['Luồng ngoại lệ (Exceptions)', '• 6a. Điểm số âm (< 0) hoặc vượt quá 100 (> 100): Hệ thống chặn lại và báo: "Điểm số không hợp lệ, phải nằm trong khoảng từ 0 đến 100".']
      ],
      [24, 76],
      [AlignmentType.CENTER, AlignmentType.LEFT]
    ),

    h3('3.2.6. Đặc tả Use Case UC18: Tương tác với Trợ lý AI và 3 Tính năng Chuyên sâu (AI Assistant - F18)'),
    createTable(
      ['Mục đặc tả', 'Nội dung chi tiết theo chuẩn IEEE 830'],
      [
        ['Tên Use Case', 'UC18: Tương tác với Trợ lý AI Đa năng & Tính năng chuyên sâu (Role-Based AI - F18)'],
        ['Tác nhân (Actor)', 'Tất cả người dùng (Admin, Teacher, Student)'],
        ['Mục đích', 'Tương tác ngôn ngữ tự nhiên, giải đáp thắc mắc, tư vấn lộ trình học, sinh đề trắc nghiệm và tóm tắt tiến độ.'],
        ['Tiền điều kiện', 'Người dùng đã đăng nhập để xác định chính xác danh tính và vai trò.'],
        ['Luồng sự kiện chính (Main Flow)', '1. Người dùng mở widget AI tại góc màn hình và nhập câu hỏi bằng tiếng Việt.\n2. Lớp Guardrail kiểm tra an ninh đầu vào (chống Prompt Injection, chống SQL Injection, lọc câu hỏi Out-of-Scope).\n3. Tầng RAG trích xuất dữ liệu thật từ CSDL gắn liền với vai trò và quyền hạn của người đó.\n4. Backend đóng gói dữ liệu vào System Prompt tương ứng và gọi Google Gemini API (gemini-3.5-flash).\n5. AI phân tích dữ liệu thật và sinh câu trả lời bằng ngôn ngữ tự nhiên kèm lời khuyên cá nhân hóa.\n6. Người dùng có thể thực hiện 3 tác vụ AI chuyên sâu:\n   - F18.1: Nhờ AI tư vấn lớp học phù hợp theo trình độ và mục tiêu.\n   - F18.2: Yêu cầu AI sinh bộ đề trắc nghiệm tự luyện kèm chấm điểm giải thích.\n   - F18.3: Yêu cầu AI tóm tắt tiến độ học tập 4 phần (Tình hình, Chuyên cần, Cần chú ý, Lời khuyên).\n7. Giao diện hiển thị phản hồi kèm nhãn nguồn [✨ Google Gemini AI].'],
        ['Luồng ngoại lệ (Exceptions)', '• 2a. Phát hiện prompt injection: Guardrail chặn đứng, trả về cảnh báo an ninh.\n• 4a. Google API quá tải 503 hoặc timeout 8s: Kích hoạt Auto Model Failover chuyển sang model tiếp theo.\n• 4b. Mất kết nối internet hoàn toàn: Tự động hạ cấp sang Safe Fallback Engine nội bộ, gắn nhãn [🛡️ Smart Fallback Engine].']
      ],
      [24, 76],
      [AlignmentType.CENTER, AlignmentType.LEFT]
    ),

    h2('3.3. Thiết kế Sơ đồ Lớp (Class Diagram) với 8 lớp thực thể chính'),
    p('Hệ thống LinguaHub được tổ chức theo mô hình hướng đối tượng với 8 lớp thực thể chính, phản ánh đầy đủ nghiệp vụ đào tạo và trí tuệ nhân tạo:'),
    bullet('Lớp cha định nghĩa tài khoản: Id (int), FullName (string), Email (string), Username (string), PasswordHash (string), Role (string), IsActive (bool), CreatedAt (datetime). Phương thức: login(), logout(), changePassword(), updateProfile().', '1. Class User:'),
    bullet('Kế thừa từ User, quản lý hồ sơ giảng viên: TeacherId (int), UserId (int), Phone (string), Qualification (string), JoinDate (datetime), Status (string). Phương thức: getAssignedClasses(), takeAttendance(), updateScores(), getTeacherStats().', '2. Class Teacher (kế thừa User):'),
    bullet('Kế thừa từ User, quản lý hồ sơ học viên: StudentId (int), UserId (int), Phone (string), JoinDate (datetime), Status (string). Phương thức: getEnrolledClasses(), getAttendanceHistory(), getScores(), enrollClass().', '3. Class Student (kế thừa User):'),
    bullet('Quản lý thông tin lớp học: ClassId (int), Name (string), Code (string), Description (string), MainTeacherId (int), StartDate (date), EndDate (date), MaxStudents (int), Fee (decimal), Schedule (string), Room (string), Status (string). Phương thức: addStudent(), removeStudent(), isFull(), getSchedule().', '4. Class Class:'),
    bullet('Thực thể liên kết nhiều - nhiều giữa Lớp và Học viên: EnrollmentId (int), ClassId (int), StudentId (int), JoinDate (datetime), Status (string). Phương thức: activate(), dropClass(), getStudentList().', '5. Class ClassStudents (Enrollment):'),
    bullet('Ghi nhận dữ liệu chuyên cần: AttendanceId (int), ClassId (int), StudentId (int), AttendanceDate (date), Status (string: present, absent, late, excused), Note (string), RecordedBy (int), RecordedAt (datetime). Phương thức: markPresent(), markAbsent(), markLate(), updateNote().', '6. Class Attendance:'),
    bullet('Quản lý kết quả bài thi: ScoreId (int), StudentId (int), ClassId (int), ExamName (string), Score (decimal), MaxScore (decimal), Note (string), RecordedBy (int), RecordedAt (datetime). Phương thức: calculateAverage(), updateScore(), getFeedback().', '7. Class Score:'),
    bullet('Quản lý các phiên hội thoại và tác vụ AI: SessionId (string), UserId (int), Role (string), Message (string), ContextData (object), Engine (string), Response (string), CreatedAt (datetime). Phương thức: validateGuardrails(), executeRAG(), callGemini(), fallbackRuleBased().', '8. Class AiSession:')
  ];
}

function buildChapter4() {
  return [
    h1('CHƯƠNG 4. THIẾT KẾ CƠ SỞ DỮ LIỆU QUAN HỆ VÀ GIẢI PHÁP ĐÀN HỒI', true),
    p('Chương này mô tả chi tiết mô hình cơ sở dữ liệu quan hệ được triển khai trên Microsoft SQL Server, cấu trúc chi tiết và từ điển dữ liệu (Data Dictionary) của toàn bộ 8 bảng, sơ đồ ERD, các ràng buộc toàn vẹn dữ liệu chuẩn 3NF và giải pháp Cơ sở dữ liệu kép đàn hồi In-Memory Resilient Store theo chuẩn đầu ra CLO4.'),

    h2('4.1. Cấu trúc chi tiết và Từ điển dữ liệu của Toàn bộ 8 Bảng CSDL'),
    p('Cơ sở dữ liệu LinguaHub được định nghĩa chuẩn hóa trong tệp sql-server-setup.sql bao gồm 8 bảng quan hệ:'),

    h3('4.1.1. Bảng Users (Tài khoản người dùng & Xác thực)'),
    p('Lưu trữ toàn bộ thông tin đăng nhập và danh tính của người dùng trong hệ thống:'),
    createTable(
      ['Tên cột (Column)', 'Kiểu dữ liệu (Data Type)', 'Ràng buộc (Constraints)', 'Mô tả ý nghĩa nghiệp vụ'],
      [
        ['Id', 'INT', 'PRIMARY KEY, IDENTITY(1,1)', 'Mã định danh duy nhất của tài khoản người dùng'],
        ['FullName', 'NVARCHAR(100)', 'NOT NULL', 'Họ và tên đầy đủ của người dùng'],
        ['Email', 'NVARCHAR(150)', 'NOT NULL, UNIQUE', 'Địa chỉ email liên hệ, không được trùng lặp'],
        ['Username', 'NVARCHAR(100)', 'NOT NULL, UNIQUE', 'Tên đăng nhập hệ thống, duy nhất'],
        ['PasswordHash', 'NVARCHAR(255)', 'NOT NULL', 'Mật khẩu bảo mật được băm an toàn'],
        ['Role', 'NVARCHAR(50)', 'NOT NULL, CHECK (admin, teacher, student)', 'Vai trò của người dùng: admin | teacher | student'],
        ['IsAdmin', 'BIT', 'NOT NULL, DEFAULT 0', 'Cờ đánh dấu tài khoản có quyền quản trị tối cao'],
        ['IsActive', 'BIT', 'NOT NULL, DEFAULT 1', 'Trạng thái hoạt động (1: Hoạt động, 0: Tạm khóa)'],
        ['CreatedAt', 'DATETIME2', 'NOT NULL, DEFAULT GETDATE()', 'Thời điểm tài khoản được khởi tạo trên hệ thống']
      ],
      [18, 22, 28, 32],
      [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT]
    ),

    h3('4.1.2. Bảng Teachers (Hồ sơ giảng viên)'),
    p('Lưu trữ thông tin chuyên môn, chứng chỉ và liên kết tài khoản của giảng viên:'),
    createTable(
      ['Tên cột (Column)', 'Kiểu dữ liệu (Data Type)', 'Ràng buộc (Constraints)', 'Mô tả ý nghĩa nghiệp vụ'],
      [
        ['Id', 'INT', 'PRIMARY KEY, IDENTITY(1,1)', 'Mã định danh hồ sơ giảng viên'],
        ['UserId', 'INT', 'NOT NULL, FOREIGN KEY -> Users(Id)', 'Khóa ngoại liên kết tới tài khoản trong bảng Users'],
        ['Phone', 'NVARCHAR(20)', 'NULL', 'Số điện thoại liên hệ của giảng viên'],
        ['Qualification', 'NVARCHAR(200)', 'NULL', 'Chứng chỉ và trình độ chuyên môn (IELTS, TOEFL, TESOL)'],
        ['JoinDate', 'DATETIME2', 'NOT NULL, DEFAULT GETDATE()', 'Ngày bắt đầu công tác giảng dạy tại trung tâm'],
        ['Status', 'NVARCHAR(20)', 'NOT NULL, DEFAULT active', 'Trạng thái công tác (active: đang dạy, inactive: nghỉ)']
      ],
      [18, 22, 28, 32],
      [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT]
    ),

    h3('4.1.3. Bảng Students (Hồ sơ học viên)'),
    p('Lưu trữ thông tin học vụ và liên kết tài khoản của học viên:'),
    createTable(
      ['Tên cột (Column)', 'Kiểu dữ liệu (Data Type)', 'Ràng buộc (Constraints)', 'Mô tả ý nghĩa nghiệp vụ'],
      [
        ['Id', 'INT', 'PRIMARY KEY, IDENTITY(1,1)', 'Mã định danh hồ sơ học viên'],
        ['UserId', 'INT', 'NOT NULL, FOREIGN KEY -> Users(Id)', 'Khóa ngoại liên kết tới tài khoản trong bảng Users'],
        ['Phone', 'NVARCHAR(20)', 'NULL', 'Số điện thoại liên lạc của học viên hoặc phụ huynh'],
        ['JoinDate', 'DATETIME2', 'NOT NULL, DEFAULT GETDATE()', 'Ngày nhập học chính thức tại trung tâm'],
        ['Status', 'NVARCHAR(20)', 'NOT NULL, DEFAULT active', 'Trạng thái học vụ (active: đang học, graduated, dropped)']
      ],
      [18, 22, 28, 32],
      [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT]
    ),

    h3('4.1.4. Bảng Classes (Danh mục lớp học ngoại ngữ)'),
    p('Lưu trữ các thông tin chi tiết về lớp học, thời khóa biểu và giảng viên chủ nhiệm:'),
    createTable(
      ['Tên cột (Column)', 'Kiểu dữ liệu (Data Type)', 'Ràng buộc (Constraints)', 'Mô tả ý nghĩa nghiệp vụ'],
      [
        ['Id', 'INT', 'PRIMARY KEY, IDENTITY(1,1)', 'Mã lớp học nội bộ'],
        ['Name', 'NVARCHAR(100)', 'NOT NULL', 'Tên lớp học (ví dụ: TOEIC 500A, IELTS 6.5 Intensive)'],
        ['Code', 'NVARCHAR(50)', 'NOT NULL, UNIQUE', 'Mã viết tắt của lớp học, duy nhất trong hệ thống'],
        ['Description', 'NVARCHAR(500)', 'NULL', 'Mô tả chi tiết mục tiêu đào tạo và lộ trình khóa học'],
        ['MainTeacherId', 'INT', 'NOT NULL, FOREIGN KEY -> Teachers(Id)', 'Khóa ngoại chỉ định Giảng viên chủ nhiệm lớp'],
        ['StartDate', 'DATETIME2', 'NULL', 'Ngày bắt đầu khóa học'],
        ['EndDate', 'DATETIME2', 'NULL', 'Ngày kết thúc khóa học'],
        ['MaxStudents', 'INT', 'NOT NULL, DEFAULT 30', 'Sĩ số tối đa tiếp nhận của lớp học'],
        ['Fee', 'DECIMAL(18,2)', 'NOT NULL, DEFAULT 3500000', 'Mức học phí niêm yết của khóa học (VNĐ)'],
        ['Schedule', 'NVARCHAR(100)', 'NULL', 'Lịch học trong tuần (ví dụ: Tối 2-4-6 từ 19h30 - 21h00)'],
        ['Room', 'NVARCHAR(50)', 'NULL', 'Phòng học được phân bổ (ví dụ: Phòng Lab 302)'],
        ['Status', 'NVARCHAR(20)', 'NOT NULL, DEFAULT active', 'Trạng thái lớp (active: đang mở, completed: đã kết thúc)']
      ],
      [18, 22, 28, 32],
      [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT]
    ),

    h3('4.1.5. Bảng ClassStudents (Liên kết Học viên - Lớp học)'),
    p('Bảng trung gian giải quyết mối quan hệ nhiều - nhiều (N - N) giữa Classes và Students:'),
    createTable(
      ['Tên cột (Column)', 'Kiểu dữ liệu (Data Type)', 'Ràng buộc (Constraints)', 'Mô tả ý nghĩa nghiệp vụ'],
      [
        ['Id', 'INT', 'PRIMARY KEY, IDENTITY(1,1)', 'Mã lượt đăng ký lớp học'],
        ['ClassId', 'INT', 'NOT NULL, FOREIGN KEY -> Classes(Id)', 'Mã lớp học tham gia (Xóa lớp -> Xóa liên kết cascade)'],
        ['StudentId', 'INT', 'NOT NULL, FOREIGN KEY -> Students(Id)', 'Mã học viên tham gia'],
        ['JoinDate', 'DATETIME2', 'NOT NULL, DEFAULT GETDATE()', 'Ngày học viên được ghi danh vào lớp'],
        ['Status', 'NVARCHAR(20)', 'NOT NULL, DEFAULT active', 'Trạng thái tham gia (active: đang học, suspended, finished)']
      ],
      [18, 22, 28, 32],
      [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT]
    ),

    h3('4.1.6. Bảng Attendance (Điểm danh chuyên cần theo buổi học)'),
    p('Ghi nhận chi tiết từng lượt điểm danh theo từng buổi học của từng học viên:'),
    createTable(
      ['Tên cột (Column)', 'Kiểu dữ liệu (Data Type)', 'Ràng buộc (Constraints)', 'Mô tả ý nghĩa nghiệp vụ'],
      [
        ['Id', 'INT', 'PRIMARY KEY, IDENTITY(1,1)', 'Mã bản ghi lượt điểm danh'],
        ['ClassId', 'INT', 'NOT NULL, FOREIGN KEY -> Classes(Id)', 'Mã lớp học diễn ra buổi điểm danh'],
        ['StudentId', 'INT', 'NOT NULL, FOREIGN KEY -> Students(Id)', 'Mã học viên được ghi nhận chuyên cần'],
        ['AttendanceDate', 'DATETIME2', 'NOT NULL, DEFAULT GETDATE()', 'Ngày diễn ra buổi học'],
        ['Status', 'NVARCHAR(20)', 'NOT NULL, CHECK (present, absent, late, excused)', 'Trạng thái: present (có mặt), absent (vắng), late (muộn), excused (có phép)'],
        ['Note', 'NVARCHAR(500)', 'NULL', 'Ghi chú sư phạm (lý do vắng mặt, số phút đến muộn)'],
        ['RecordedBy', 'INT', 'NULL, FOREIGN KEY -> Teachers(Id)', 'Mã giảng viên trực tiếp thực hiện ghi nhận điểm danh'],
        ['RecordedAt', 'DATETIME2', 'NOT NULL, DEFAULT GETDATE()', 'Thời điểm ghi nhận vào hệ thống']
      ],
      [18, 22, 28, 32],
      [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT]
    ),

    h3('4.1.7. Bảng Scores (Điểm kiểm tra và đánh giá học tập)'),
    p('Lưu trữ kết quả các bài kiểm tra định kỳ và đánh giá sư phạm của giảng viên:'),
    createTable(
      ['Tên cột (Column)', 'Kiểu dữ liệu (Data Type)', 'Ràng buộc (Constraints)', 'Mô tả ý nghĩa nghiệp vụ'],
      [
        ['Id', 'INT', 'PRIMARY KEY, IDENTITY(1,1)', 'Mã bản ghi điểm số'],
        ['StudentId', 'INT', 'NOT NULL, FOREIGN KEY -> Students(Id)', 'Mã học viên nhận điểm'],
        ['ClassId', 'INT', 'NOT NULL, FOREIGN KEY -> Classes(Id)', 'Mã lớp học diễn ra kỳ thi'],
        ['ExamName', 'NVARCHAR(100)', 'NOT NULL', 'Tên bài kiểm tra (Midterm Test, Final Exam, Quiz 1)'],
        ['Score', 'DECIMAL(5,2)', 'NOT NULL, CHECK (Score >= 0 AND Score <= 100)', 'Điểm số đạt được (thang điểm chuẩn 100)'],
        ['MaxScore', 'DECIMAL(5,2)', 'NOT NULL, DEFAULT 100', 'Điểm tối đa của bài kiểm tra'],
        ['Note', 'NVARCHAR(500)', 'NULL', 'Lời nhận xét sư phạm chi tiết của giáo viên'],
        ['RecordedBy', 'INT', 'NULL, FOREIGN KEY -> Teachers(Id)', 'Giáo viên thực hiện chấm và nhập điểm']
      ],
      [18, 22, 28, 32],
      [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT]
    ),

    h3('4.1.8. Bảng Tuition (Quản lý và tra cứu học phí)'),
    p('Quản lý các khoản học phí phải thu, lịch sử nộp và tình trạng thanh toán:'),
    createTable(
      ['Tên cột (Column)', 'Kiểu dữ liệu (Data Type)', 'Ràng buộc (Constraints)', 'Mô tả ý nghĩa nghiệp vụ'],
      [
        ['Id', 'INT', 'PRIMARY KEY, IDENTITY(1,1)', 'Mã hóa đơn / khoản học phí'],
        ['StudentId', 'INT', 'NOT NULL, FOREIGN KEY -> Students(Id)', 'Mã học viên có nghĩa vụ thanh toán học phí'],
        ['ClassId', 'INT', 'NOT NULL, FOREIGN KEY -> Classes(Id)', 'Mã khóa học tương ứng'],
        ['Amount', 'DECIMAL(18,2)', 'NOT NULL', 'Số tiền học phí phải thanh toán (VNĐ)'],
        ['Status', 'NVARCHAR(20)', 'NOT NULL, DEFAULT pending', 'Trạng thái: pending (chờ thanh toán), paid (đã nộp), overdue (quá hạn)'],
        ['DueDate', 'DATE', 'NULL', 'Hạn chót thanh toán học phí'],
        ['PaidDate', 'DATETIME2', 'NULL', 'Thời điểm học viên hoàn thành nộp học phí'],
        ['PaymentMethod', 'NVARCHAR(50)', 'NULL', 'Phương thức thanh toán (Tiền mặt, Chuyển khoản, VNPAY)']
      ],
      [18, 22, 28, 32],
      [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT]
    ),

    h2('4.2. Sơ đồ Quan hệ Thực thể (ERD) và các Ràng buộc Toàn vẹn Dữ liệu'),
    p('Mô hình dữ liệu của LinguaHub tuân thủ nghiêm ngặt dạng chuẩn hóa bậc 3 (Third Normal Form - 3NF), loại bỏ hoàn toàn các phụ thuộc bắc cầu và dư thừa dữ liệu:'),
    bullet('Một tài khoản User chỉ tương ứng với tối đa một hồ sơ Giảng viên (nếu Role là teacher) hoặc một hồ sơ Học viên (nếu Role là student).', '• Users (1) <-> Teachers (0..1) / Students (0..1):'),
    bullet('Một giáo viên có thể được phân công chủ nhiệm nhiều lớp học khác nhau. Mỗi lớp học bắt buộc phải có một giáo viên chủ nhiệm.', '• Teachers (1) -> Classes (N):'),
    bullet('Một lớp có nhiều học viên và một học viên có thể đăng ký nhiều khóa học thông qua bảng liên kết ClassStudents (khóa chính phức hợp ClassId + StudentId duy nhất để chống đăng ký trùng).', '• Classes (N) <-> Students (N):'),
    bullet('Mỗi lượt ghi nhận chuyên cần liên kết chặt chẽ với một lớp học, một học viên và được xác thực người ghi nhận là giáo viên phụ trách.', '• Classes (1) & Students (1) -> Attendance (N):'),
    bullet('Mỗi bài kiểm tra gắn liền với một học viên trong một lớp cụ thể. Có ràng buộc CHECK (Score >= 0 AND Score <= 100) ngăn ngừa hoàn toàn lỗi nhập sai điểm.', '• Classes (1) & Students (1) -> Scores (N):'),

    h2('4.3. Giải pháp Cơ sở dữ liệu kép đàn hồi (In-Memory Resilient Database Store)'),
    p('Một trong những đóng góp kỹ thuật sáng tạo độc lập của nhóm tác giả nhằm giải quyết triệt để rủi ro môi trường thực thi khi chấm đồ án là giải pháp Dual Database Engine:'),
    callout('GIẢI PHÁP ĐỒNG BỘ CSDL KÉP IN-MEMORY RESILIENT STORE TRONG SERVER.JS', [
      '• Vấn đề thực tế: Khi nộp đồ án cho Hội đồng chấm thi, máy tính của Thầy/Cô chấm điểm thường không có sẵn MS SQL Server, hoặc có sự khác biệt về Instance Name, Port 1433, tài khoản sa, dẫn đến việc ứng dụng báo lỗi sập kết nối CSDL và không thể khởi chạy được.',
      '• Giải pháp của nhóm: Trong server.js, nhóm đã tự tay hiện thực hóa đối tượng inMemoryDb đồng bộ cấu trúc 100% với DDL SQL Server, được nạp sẵn dữ liệu mẫu thực tế của 8 tài khoản người dùng, 2 giảng viên, 5 học viên, 2 lớp học và lịch sử điểm danh 6 tháng.',
      '• Kết quả đạt được: Khi biến môi trường DB_SERVER không kết nối được, hệ thống tự động kích hoạt In-Memory Store mà không báo lỗi sập ứng dụng. Người chấm chỉ cần click đúp chuột vào start-server.bat là hệ thống chạy ngay lập tức với đầy đủ dữ liệu demo sống động!'
    ])
  ];
}

module.exports = {
  buildChapter3,
  buildChapter4
};
