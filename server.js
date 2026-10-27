const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sql = require('mssql');
const nodemailer = require('nodemailer');
const { detectIntent, executeAiQuery } = require('./ai-service');
const { recommendClassWithAi, generatePracticeWithAi, summarizeProgressWithAi } = require('./gemini-service');

dotenv.config();

const app = express();
app.use(cors({
  origin: function(origin, callback) {
    // Cho phép tất cả origin kể cả null (file://)
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
// Xử lý OPTIONS preflight
app.options('*', cors());

app.use(express.json());
app.use(express.static('.'));

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_DATABASE || 'LinguaHub',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    connectTimeout: 3000
  }
};

let sqlPool = null;
let useSql = false;

// ============================================
// IN-MEMORY DATABASE (Used as resilient data store)
// ============================================
const inMemoryDb = {
  nextUserId: 9,
  nextTeacherId: 3,
  nextStudentId: 6,
  nextClassId: 3,
  nextAttendanceId: 4,
  nextScoreId: 6,
  nextTuitionId: 6,

  users: [
    { Id: 1, FullName: 'System Admin', Email: 'admin@linguahub.local', Username: 'admin', PasswordHash: '123456', Role: 'admin', IsAdmin: 1, IsActive: 1, CreatedAt: new Date() },
    { Id: 2, FullName: 'Ms. Lan Nguyễn', Email: 'lan@linguahub.local', Username: 'lan', PasswordHash: '123456', Role: 'teacher', IsAdmin: 0, IsActive: 1, CreatedAt: new Date() },
    { Id: 3, FullName: 'Mr. Hùng Trần', Email: 'hung@linguahub.local', Username: 'hung', PasswordHash: '123456', Role: 'teacher', IsAdmin: 0, IsActive: 1, CreatedAt: new Date() },
    { Id: 4, FullName: 'Nguyễn Văn A', Email: 'nguyenvana@linguahub.local', Username: 'nguyenvana', PasswordHash: '123456', Role: 'student', IsAdmin: 0, IsActive: 1, CreatedAt: new Date() },
    { Id: 5, FullName: 'Nguyễn Văn B', Email: 'nguyenvanb@linguahub.local', Username: 'nguyenvanb', PasswordHash: '123456', Role: 'student', IsAdmin: 0, IsActive: 1, CreatedAt: new Date() },
    { Id: 6, FullName: 'Trần Văn C', Email: 'tranvanc@linguahub.local', Username: 'tranvanc', PasswordHash: '123456', Role: 'student', IsAdmin: 0, IsActive: 1, CreatedAt: new Date() },
    { Id: 7, FullName: 'Phạm Thị D', Email: 'phamthid@linguahub.local', Username: 'phamthid', PasswordHash: '123456', Role: 'student', IsAdmin: 0, IsActive: 1, CreatedAt: new Date() },
    { Id: 8, FullName: 'Hoàng Văn E', Email: 'hoangvane@linguahub.local', Username: 'hoangvane', PasswordHash: '123456', Role: 'student', IsAdmin: 0, IsActive: 1, CreatedAt: new Date() }
  ],
  teachers: [
    { Id: 1, UserId: 2, Phone: '0901234567', Qualification: 'TOEFL Certified - 6 năm kinh nghiệm', JoinDate: new Date(), Status: 'active' },
    { Id: 2, UserId: 3, Phone: '0902345678', Qualification: 'IELTS 8.5 Certified - 8 năm kinh nghiệm', JoinDate: new Date(), Status: 'active' }
  ],
  students: [
    { Id: 1, UserId: 4, Phone: '0911111111', JoinDate: new Date(), Status: 'active' },
    { Id: 2, UserId: 5, Phone: '0911111112', JoinDate: new Date(), Status: 'active' },
    { Id: 3, UserId: 6, Phone: '0911111113', JoinDate: new Date(), Status: 'active' },
    { Id: 4, UserId: 7, Phone: '0911111114', JoinDate: new Date(), Status: 'active' },
    { Id: 5, UserId: 8, Phone: '0911111115', JoinDate: new Date(), Status: 'active' }
  ],
  classes: [
    { Id: 1, Name: 'TOEIC 500A', Code: 'TOEIC-500A', Description: 'Lớp luyện thi TOEIC mục tiêu 500+', MainTeacherId: 1, StartDate: new Date('2026-01-01'), EndDate: new Date('2026-06-30'), MaxStudents: 25, Status: 'active', Fee: 3500000, Schedule: 'Thứ 2, 4, 6 (18:00 - 19:30)', Room: 'P101', CreatedAt: new Date() },
    { Id: 2, Name: 'TOEIC 600A', Code: 'TOEIC-600A', Description: 'Lớp luyện thi TOEIC mục tiêu 600+', MainTeacherId: 2, StartDate: new Date('2026-01-01'), EndDate: new Date('2026-06-30'), MaxStudents: 25, Status: 'active', Fee: 4200000, Schedule: 'Thứ 3, 5, 7 (19:30 - 21:00)', Room: 'P102', CreatedAt: new Date() },
    { Id: 3, Name: 'IELTS 6.5 Intensive', Code: 'IELTS-65', Description: 'Luyện thi IELTS 4 kỹ năng mục tiêu 6.5+', MainTeacherId: 1, StartDate: new Date('2026-03-01'), EndDate: new Date('2026-08-30'), MaxStudents: 20, Status: 'open', Fee: 5500000, Schedule: 'Thứ 2, 4, 6 (19:30 - 21:00)', Room: 'P201', CreatedAt: new Date() },
    { Id: 4, Name: 'Tiếng Anh Giao Tiếp B1', Code: 'ENG-B1', Description: 'Khóa giao tiếp phản xạ 3 tháng cho người đi làm', MainTeacherId: 2, StartDate: new Date('2026-03-15'), EndDate: new Date('2026-06-15'), MaxStudents: 25, Status: 'open', Fee: 3000000, Schedule: 'Thứ 3, 5, 7 (18:00 - 19:30)', Room: 'P202', CreatedAt: new Date() }
  ],
  classStudents: [
    { Id: 1, ClassId: 1, StudentId: 1, JoinDate: new Date(), Status: 'active' },
    { Id: 2, ClassId: 1, StudentId: 2, JoinDate: new Date(), Status: 'active' },
    { Id: 3, ClassId: 1, StudentId: 3, JoinDate: new Date(), Status: 'active' },
    { Id: 4, ClassId: 2, StudentId: 4, JoinDate: new Date(), Status: 'active' },
    { Id: 5, ClassId: 2, StudentId: 5, JoinDate: new Date(), Status: 'active' }
  ],
  attendance: [
    { Id: 1, ClassId: 1, StudentId: 1, AttendanceDate: new Date().toISOString().split('T')[0], Status: 'present', Note: 'Đúng giờ', RecordedBy: 1, RecordedAt: new Date() },
    { Id: 2, ClassId: 1, StudentId: 2, AttendanceDate: new Date().toISOString().split('T')[0], Status: 'present', Note: 'Đúng giờ', RecordedBy: 1, RecordedAt: new Date() },
    { Id: 3, ClassId: 1, StudentId: 3, AttendanceDate: new Date().toISOString().split('T')[0], Status: 'absent', Note: 'Có phép', RecordedBy: 1, RecordedAt: new Date() }
  ],
  scores: [
    { Id: 1, StudentId: 1, ClassId: 1, ExamName: 'Midterm Test', Score: 78.5, MaxScore: 100, RecordedDate: new Date(), Note: 'Đạt yêu cầu', RecordedBy: 1 },
    { Id: 2, StudentId: 2, ClassId: 1, ExamName: 'Midterm Test', Score: 85.0, MaxScore: 100, RecordedDate: new Date(), Note: 'Tốt', RecordedBy: 1 },
    { Id: 3, StudentId: 3, ClassId: 1, ExamName: 'Midterm Test', Score: 72.0, MaxScore: 100, RecordedDate: new Date(), Note: 'Cần cố gắng', RecordedBy: 1 },
    { Id: 4, StudentId: 4, ClassId: 2, ExamName: 'Midterm Test', Score: 90.5, MaxScore: 100, RecordedDate: new Date(), Note: 'Xuất sắc', RecordedBy: 2 },
    { Id: 5, StudentId: 5, ClassId: 2, ExamName: 'Midterm Test', Score: 88.0, MaxScore: 100, RecordedDate: new Date(), Note: 'Giỏi', RecordedBy: 2 }
  ],
  tuition: [
    { Id: 1, StudentId: 1, ClassId: 1, Amount: 3500000, DueDate: '2026-03-31', Status: 'paid', PaidDate: '2026-01-05', Note: 'Chuyển khoản VNPAY' },
    { Id: 2, StudentId: 2, ClassId: 1, Amount: 3500000, DueDate: '2026-03-31', Status: 'paid', PaidDate: '2026-01-07', Note: 'Đóng tiền mặt' },
    { Id: 3, StudentId: 3, ClassId: 1, Amount: 3500000, DueDate: '2026-03-31', Status: 'unpaid', PaidDate: null, Note: 'Chờ gia hạn' },
    { Id: 4, StudentId: 4, ClassId: 2, Amount: 4200000, DueDate: '2026-03-31', Status: 'paid', PaidDate: '2026-01-10', Note: 'Chuyển khoản' },
    { Id: 5, StudentId: 5, ClassId: 2, Amount: 4200000, DueDate: '2026-03-31', Status: 'unpaid', PaidDate: null, Note: 'Chưa thanh toán' }
  ]
};

// ============================================
// SESSION STORAGE
// ============================================
const sessions = {};

function setUserSession(username, user) {
  const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  sessions[sessionId] = { ...user, username, timestamp: Date.now() };
  return sessionId;
}

function getUserSession(sessionId) {
  if (!sessionId || !sessions[sessionId]) return null;
  return sessions[sessionId];
}

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const sessionId = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.query.sessionId;

  // Allow public endpoints
  const publicRoutes = [
    '/api/login',
    '/api/register',
    '/api/admin/request-otp',
    '/',
    '/index.html',
    '/login.html',
    '/register.html',
    '/admin-login.html',
    '/admin-panel.html',
    '/admin.html',
    '/teacher.html',
    '/teacher-classes.html',
    '/student.html'
  ];

  const isPublic = publicRoutes.includes(req.path) ||
                   req.path.startsWith('/css/') ||
                   req.path.startsWith('/js/') ||
                   req.path.startsWith('/assets/');

  if (sessionId && sessions[sessionId]) {
    req.user = sessions[sessionId];
    return next();
  }

  if (isPublic) {
    return next();
  }

  console.log(`[AUTH] Unauthorized request to ${req.method} ${req.path}`);
  return res.status(401).json({ success: false, message: 'Không được phép truy cập. Vui lòng đăng nhập lại.' });
}

app.use(authMiddleware);

// ============================================
// AUTHENTICATION & REGISTRATION APIS
// ============================================

// POST /api/login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: {
        username: !username ? 'Tên đăng nhập hoặc Email không được để trống' : undefined,
        password: !password ? 'Mật khẩu không được để trống' : undefined
      }
    });
  }

  const query = username.trim().toLowerCase();
  const user = inMemoryDb.users.find(u =>
    (u.Username.toLowerCase() === query || u.Email.toLowerCase() === query) &&
    u.PasswordHash === password
  );

  if (!user) {
    console.log(`[LOGIN] Failed attempt for user: ${username}`);
    return res.status(401).json({ success: false, message: 'Thông tin đăng nhập hoặc mật khẩu không chính xác' });
  }

  const sessionId = setUserSession(user.Username, {
    id: user.Id,
    name: user.FullName,
    email: user.Email,
    role: user.Role,
    isAdmin: user.IsAdmin === 1
  });

  console.log(`[LOGIN] Success: ${user.Username} (${user.Role})`);
  return res.status(200).json({
    success: true,
    message: 'Đăng nhập thành công',
    sessionId,
    user: {
      id: user.Id,
      name: user.FullName,
      username: user.Username,
      email: user.Email,
      role: user.Role,
      isAdmin: user.IsAdmin === 1
    }
  });
});

// POST /api/register
app.post('/api/register', (req, res) => {
  console.log('[REGISTER USER] Request received');
  const { name, email, phone, username, password, confirmPassword, role } = req.body;

  const errors = {};
  if (!name || !name.trim()) errors.name = 'Họ tên không được để trống';
  if (!email || !email.trim()) errors.email = 'Email không được để trống';
  if (!phone || !phone.trim()) errors.phone = 'Số điện thoại không được để trống';
  if (!username || !username.trim()) errors.username = 'Tên đăng nhập không được để trống';
  if (!password || !password.trim()) errors.password = 'Mật khẩu không được để trống';
  if (confirmPassword && password !== confirmPassword) errors.confirmPassword = 'Mật khẩu xác nhận không khớp';

  const validRole = (role === 'teacher' || role === 'student') ? role : 'student';

  if (Object.keys(errors).length > 0) {
    console.log('[REGISTER USER] Validation failed:', errors);
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors
    });
  }

  // Check duplicate username or email
  const existingUsername = inMemoryDb.users.find(u => u.Username.toLowerCase() === username.trim().toLowerCase());
  if (existingUsername) {
    console.log(`[REGISTER USER] ERROR: Username already exists (${username})`);
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: { username: 'Tên đăng nhập đã tồn tại trong hệ thống' }
    });
  }

  const existingEmail = inMemoryDb.users.find(u => u.Email.toLowerCase() === email.trim().toLowerCase());
  if (existingEmail) {
    console.log(`[REGISTER USER] ERROR: Email already exists (${email})`);
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: { email: 'Email này đã được đăng ký' }
    });
  }

  console.log('[REGISTER USER] Validation passed');
  console.log('[REGISTER USER] Database insert');

  const newUserId = inMemoryDb.nextUserId++;
  const newUser = {
    Id: newUserId,
    FullName: name.trim(),
    Email: email.trim(),
    Username: username.trim(),
    PasswordHash: password,
    Role: validRole,
    IsAdmin: 0,
    IsActive: 1,
    CreatedAt: new Date()
  };
  inMemoryDb.users.push(newUser);

  if (validRole === 'teacher') {
    inMemoryDb.teachers.push({
      Id: inMemoryDb.nextTeacherId++,
      UserId: newUserId,
      Phone: phone.trim(),
      Qualification: 'Giảng viên mới',
      JoinDate: new Date(),
      Status: 'active'
    });
  } else {
    inMemoryDb.students.push({
      Id: inMemoryDb.nextStudentId++,
      UserId: newUserId,
      Phone: phone.trim(),
      JoinDate: new Date(),
      Status: 'active'
    });
  }

  console.log(`[REGISTER USER] Success: Created user ID ${newUserId}`);
  return res.status(201).json({
    success: true,
    message: 'Đăng ký tài khoản thành công',
    data: {
      id: newUserId,
      name: newUser.FullName,
      username: newUser.Username,
      email: newUser.Email,
      role: newUser.Role
    }
  });
});

// GET /api/auth/me
app.get('/api/auth/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
  }
  return res.status(200).json({ success: true, user: req.user });
});

// POST /api/logout
app.post('/api/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  const sessionId = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (sessionId && sessions[sessionId]) {
    delete sessions[sessionId];
  }
  return res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
});

// ============================================
// ADMIN OVERVIEW & STATS
// ============================================
app.get('/api/admin/overview', (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập chức năng này.' });
  }

  const activeStudents = inMemoryDb.students.filter(s => s.Status === 'active').length;
  const activeTeachers = inMemoryDb.teachers.filter(t => t.Status === 'active').length;
  const activeClasses = inMemoryDb.classes.filter(c => c.Status === 'active').length;
  const totalAttendance = inMemoryDb.attendance.length;
  const presentAttendance = inMemoryDb.attendance.filter(a => a.Status === 'present' || a.Status === 'late').length;
  const attendanceRate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 100;

  return res.status(200).json({
    success: true,
    message: 'Lấy dữ liệu tổng quan thành công',
    data: {
      studentCount: activeStudents,
      teacherCount: activeTeachers,
      classCount: activeClasses,
      attendanceRate
    }
  });
});

// ============================================
// STUDENTS CRUD (Admin & Teacher)
// ============================================

// GET /api/students
app.get('/api/students', (req, res) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'teacher')) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập chức năng này.' });
  }

  const studentList = inMemoryDb.students.map(s => {
    const user = inMemoryDb.users.find(u => u.Id === s.UserId);
    const enrollments = inMemoryDb.classStudents
      .filter(cs => cs.StudentId === s.Id && cs.Status === 'active')
      .map(cs => {
        const cls = inMemoryDb.classes.find(c => c.Id === cs.ClassId);
        return cls?.Name;
      })
      .filter(Boolean);

    return {
      Id: s.Id,
      UserId: s.UserId,
      FullName: user?.FullName || 'Không rõ',
      Email: user?.Email || '',
      Username: user?.Username || '',
      Phone: s.Phone || '',
      Status: s.Status,
      JoinDate: s.JoinDate,
      Classes: enrollments
    };
  });

  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách học viên thành công',
    data: studentList
  });
});

// POST /api/students (Admin creates student)
app.post('/api/students', (req, res) => {
  console.log('[CREATE STUDENT] Request received');
  if (!req.user || req.user.role !== 'admin') {
    console.log('[CREATE STUDENT] ERROR: Forbidden');
    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập chức năng này.' });
  }

  const { name, email, phone, username, password } = req.body;
  const errors = {};

  if (!name || !name.trim()) errors.name = 'Họ tên học viên không được để trống';
  if (!email || !email.trim()) errors.email = 'Email không được để trống';
  if (!phone || !phone.trim()) errors.phone = 'Số điện thoại không được để trống';
  if (!username || !username.trim()) errors.username = 'Tên đăng nhập không được để trống';
  const finalPassword = (password && password.trim()) ? password.trim() : '123456';

  if (Object.keys(errors).length > 0) {
    console.log('[CREATE STUDENT] Validation failed:', errors);
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors });
  }

  if (inMemoryDb.users.some(u => u.Username.toLowerCase() === username.trim().toLowerCase())) {
    console.log('[CREATE STUDENT] ERROR: Username exists');
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: { username: 'Tên đăng nhập đã tồn tại' } });
  }

  if (inMemoryDb.users.some(u => u.Email.toLowerCase() === email.trim().toLowerCase())) {
    console.log('[CREATE STUDENT] ERROR: Email exists');
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: { email: 'Email đã tồn tại' } });
  }

  console.log('[CREATE STUDENT] Validation passed');
  console.log('[CREATE STUDENT] Service called');
  console.log('[CREATE STUDENT] Database insert');

  const newUserId = inMemoryDb.nextUserId++;
  const newStudentId = inMemoryDb.nextStudentId++;

  const newUser = {
    Id: newUserId,
    FullName: name.trim(),
    Email: email.trim(),
    Username: username.trim(),
    PasswordHash: finalPassword,
    Role: 'student',
    IsAdmin: 0,
    IsActive: 1,
    CreatedAt: new Date()
  };
  inMemoryDb.users.push(newUser);

  const newStudent = {
    Id: newStudentId,
    UserId: newUserId,
    Phone: phone.trim(),
    JoinDate: new Date(),
    Status: 'active'
  };
  inMemoryDb.students.push(newStudent);

  console.log('[CREATE STUDENT] SaveChangesAsync');
  console.log(`[CREATE STUDENT] Success: Created student ID ${newStudentId}`);

  return res.status(201).json({
    success: true,
    message: 'Thêm học viên thành công',
    data: {
      Id: newStudentId,
      UserId: newUserId,
      FullName: newUser.FullName,
      Email: newUser.Email,
      Username: newUser.Username,
      Phone: newStudent.Phone,
      Status: newStudent.Status
    }
  });
});

// PUT /api/students/:id
app.put('/api/students/:id', (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập chức năng này.' });
  }

  const studentId = parseInt(req.params.id);
  const student = inMemoryDb.students.find(s => s.Id === studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Học viên không tồn tại' });
  }

  const user = inMemoryDb.users.find(u => u.Id === student.UserId);
  const { name, email, phone, status } = req.body;

  if (name) user.FullName = name.trim();
  if (email) user.Email = email.trim();
  if (phone) student.Phone = phone.trim();
  if (status) student.Status = status;

  return res.status(200).json({
    success: true,
    message: 'Cập nhật thông tin học viên thành công',
    data: {
      Id: student.Id,
      FullName: user.FullName,
      Email: user.Email,
      Phone: student.Phone,
      Status: student.Status
    }
  });
});

// DELETE /api/students/:id
app.delete('/api/students/:id', (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập chức năng này.' });
  }

  const studentId = parseInt(req.params.id);
  const studentIndex = inMemoryDb.students.findIndex(s => s.Id === studentId);
  if (studentIndex === -1) {
    return res.status(404).json({ success: false, message: 'Học viên không tồn tại' });
  }

  const student = inMemoryDb.students[studentIndex];
  // Remove user
  inMemoryDb.users = inMemoryDb.users.filter(u => u.Id !== student.UserId);
  // Remove student
  inMemoryDb.students.splice(studentIndex, 1);
  // Remove enrollments
  inMemoryDb.classStudents = inMemoryDb.classStudents.filter(cs => cs.StudentId !== studentId);
  // Remove attendance & scores
  inMemoryDb.attendance = inMemoryDb.attendance.filter(a => a.StudentId !== studentId);
  inMemoryDb.scores = inMemoryDb.scores.filter(sc => sc.StudentId !== studentId);

  console.log(`[DELETE STUDENT] Deleted student ID ${studentId}`);
  return res.status(200).json({ success: true, message: 'Xóa học viên thành công' });
});

// ============================================
// TEACHERS CRUD (Admin)
// ============================================

// GET /api/teachers
app.get('/api/teachers', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Không được phép truy cập' });
  }

  const teacherList = inMemoryDb.teachers.map(t => {
    const user = inMemoryDb.users.find(u => u.Id === t.UserId);
    const assignedClasses = inMemoryDb.classes.filter(c => c.MainTeacherId === t.Id).map(c => c.Name);

    return {
      Id: t.Id,
      UserId: t.UserId,
      FullName: user?.FullName || 'Không rõ',
      Email: user?.Email || '',
      Username: user?.Username || '',
      Phone: t.Phone || '',
      Qualification: t.Qualification || '',
      Status: t.Status,
      Classes: assignedClasses
    };
  });

  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách giảng viên thành công',
    data: teacherList
  });
});

// POST /api/teachers
app.post('/api/teachers', (req, res) => {
  console.log('[CREATE TEACHER] Request received');
  if (!req.user || req.user.role !== 'admin') {
    console.log('[CREATE TEACHER] ERROR: Forbidden');
    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập chức năng này.' });
  }

  const { name, email, phone, qualification, username, password } = req.body;
  const errors = {};

  if (!name || !name.trim()) errors.name = 'Họ tên giảng viên không được để trống';
  if (!email || !email.trim()) errors.email = 'Email không được để trống';
  if (!phone || !phone.trim()) errors.phone = 'Số điện thoại không được để trống';
  if (!username || !username.trim()) errors.username = 'Tên đăng nhập không được để trống';
  const finalPassword = (password && password.trim()) ? password.trim() : '123456';

  if (Object.keys(errors).length > 0) {
    console.log('[CREATE TEACHER] Validation failed:', errors);
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors });
  }

  if (inMemoryDb.users.some(u => u.Username.toLowerCase() === username.trim().toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: { username: 'Tên đăng nhập đã tồn tại' } });
  }

  if (inMemoryDb.users.some(u => u.Email.toLowerCase() === email.trim().toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: { email: 'Email đã tồn tại' } });
  }

  console.log('[CREATE TEACHER] Validation passed');
  console.log('[CREATE TEACHER] Database insert');

  const newUserId = inMemoryDb.nextUserId++;
  const newTeacherId = inMemoryDb.nextTeacherId++;

  const newUser = {
    Id: newUserId,
    FullName: name.trim(),
    Email: email.trim(),
    Username: username.trim(),
    PasswordHash: finalPassword,
    Role: 'teacher',
    IsAdmin: 0,
    IsActive: 1,
    CreatedAt: new Date()
  };
  inMemoryDb.users.push(newUser);

  const newTeacher = {
    Id: newTeacherId,
    UserId: newUserId,
    Phone: phone.trim(),
    Qualification: qualification?.trim() || 'Giảng viên chuyên môn',
    JoinDate: new Date(),
    Status: 'active'
  };
  inMemoryDb.teachers.push(newTeacher);

  console.log(`[CREATE TEACHER] Success: Created teacher ID ${newTeacherId}`);
  return res.status(201).json({
    success: true,
    message: 'Thêm giảng viên thành công',
    data: {
      Id: newTeacherId,
      UserId: newUserId,
      FullName: newUser.FullName,
      Email: newUser.Email,
      Phone: newTeacher.Phone,
      Qualification: newTeacher.Qualification,
      Status: newTeacher.Status
    }
  });
});

// DELETE /api/teachers/:id
app.delete('/api/teachers/:id', (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập chức năng này.' });
  }

  const teacherId = parseInt(req.params.id);
  const teacherIndex = inMemoryDb.teachers.findIndex(t => t.Id === teacherId);
  if (teacherIndex === -1) {
    return res.status(404).json({ success: false, message: 'Giảng viên không tồn tại' });
  }

  const teacher = inMemoryDb.teachers[teacherIndex];
  inMemoryDb.users = inMemoryDb.users.filter(u => u.Id !== teacher.UserId);
  inMemoryDb.teachers.splice(teacherIndex, 1);

  console.log(`[DELETE TEACHER] Deleted teacher ID ${teacherId}`);
  return res.status(200).json({ success: true, message: 'Xóa giảng viên thành công' });
});

// ============================================
// CLASSES CRUD (Admin & Teacher)
// ============================================

// GET /api/classes
app.get('/api/classes', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Không được phép truy cập' });
  }

  const classList = inMemoryDb.classes.map(c => {
    const teacher = inMemoryDb.teachers.find(t => t.Id === c.MainTeacherId);
    const teacherUser = inMemoryDb.users.find(u => u.Id === teacher?.UserId);
    const studentCount = inMemoryDb.classStudents.filter(cs => cs.ClassId === c.Id && cs.Status === 'active').length;

    return {
      ...c,
      TeacherName: teacherUser?.FullName || 'Chưa phân công',
      StudentCount: studentCount
    };
  });

  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách lớp học thành công',
    data: classList
  });
});

// POST /api/classes
app.post('/api/classes', (req, res) => {
  console.log('[CREATE CLASS] Request received');
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'teacher')) {
    console.log('[CREATE CLASS] ERROR: Forbidden');
    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập chức năng này.' });
  }

  const { name, code, description, teacherId, maxStudents } = req.body;
  const errors = {};

  if (!name || !name.trim()) errors.name = 'Tên lớp học không được để trống';
  if (!code || !code.trim()) errors.code = 'Mã lớp không được để trống';
  if (!teacherId) errors.teacherId = 'Vui lòng chọn giảng viên phụ trách';

  if (Object.keys(errors).length > 0) {
    console.log('[CREATE CLASS] Validation failed:', errors);
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors });
  }

  const formattedCode = code.trim().toUpperCase();
  if (inMemoryDb.classes.some(c => c.Code.toUpperCase() === formattedCode)) {
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: { code: 'Mã lớp đã tồn tại' } });
  }

  const teacher = inMemoryDb.teachers.find(t => t.Id === parseInt(teacherId));
  if (!teacher) {
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: { teacherId: 'Giảng viên được chọn không tồn tại' } });
  }

  console.log('[CREATE CLASS] Validation passed');
  console.log('[CREATE CLASS] Database insert');

  const newClassId = inMemoryDb.nextClassId++;
  const newClass = {
    Id: newClassId,
    Name: name.trim(),
    Code: formattedCode,
    Description: description?.trim() || '',
    MainTeacherId: teacher.Id,
    StartDate: new Date(),
    EndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    MaxStudents: parseInt(maxStudents) || 30,
    Status: 'active',
    CreatedAt: new Date()
  };
  inMemoryDb.classes.push(newClass);

  const teacherUser = inMemoryDb.users.find(u => u.Id === teacher.UserId);
  console.log(`[CREATE CLASS] Success: Created class ID ${newClassId}`);

  return res.status(201).json({
    success: true,
    message: 'Thêm lớp học thành công',
    data: {
      ...newClass,
      TeacherName: teacherUser?.FullName || 'Chưa phân công',
      StudentCount: 0
    }
  });
});

// DELETE /api/classes/:id
app.delete('/api/classes/:id', (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập chức năng này.' });
  }

  const classId = parseInt(req.params.id);
  const classIndex = inMemoryDb.classes.findIndex(c => c.Id === classId);
  if (classIndex === -1) {
    return res.status(404).json({ success: false, message: 'Lớp học không tồn tại' });
  }

  inMemoryDb.classes.splice(classIndex, 1);
  inMemoryDb.classStudents = inMemoryDb.classStudents.filter(cs => cs.ClassId !== classId);
  inMemoryDb.attendance = inMemoryDb.attendance.filter(a => a.ClassId !== classId);
  inMemoryDb.scores = inMemoryDb.scores.filter(s => s.ClassId !== classId);

  console.log(`[DELETE CLASS] Deleted class ID ${classId}`);
  return res.status(200).json({ success: true, message: 'Xóa lớp học thành công' });
});

// ============================================
// TEACHER SPECIFIC APIS
// ============================================

// GET /api/teacher/classes
app.get('/api/teacher/classes', (req, res) => {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Chỉ giảng viên được phép truy cập' });
  }

  const teacher = inMemoryDb.teachers.find(t => t.UserId === req.user.id);
  if (!teacher) {
    return res.status(200).json({ success: true, classes: [] });
  }

  const classes = inMemoryDb.classes
    .filter(c => c.MainTeacherId === teacher.Id)
    .map(c => {
      const studentCount = inMemoryDb.classStudents.filter(cs => cs.ClassId === c.Id && cs.Status === 'active').length;
      return {
        ...c,
        TeacherName: req.user.name,
        StudentCount: studentCount
      };
    });

  return res.status(200).json({ success: true, classes });
});

// GET /api/teacher/classes/:classId
app.get('/api/teacher/classes/:classId', (req, res) => {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Chỉ giảng viên được phép truy cập' });
  }

  const classId = parseInt(req.params.classId);
  const classData = inMemoryDb.classes.find(c => c.Id === classId);
  if (!classData) {
    return res.status(404).json({ success: false, message: 'Lớp học không tồn tại' });
  }

  const teacher = inMemoryDb.teachers.find(t => t.UserId === req.user.id && t.Id === classData.MainTeacherId);
  if (!teacher) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập lớp của giảng viên khác' });
  }

  const students = inMemoryDb.classStudents
    .filter(cs => cs.ClassId === classId && cs.Status === 'active')
    .map(cs => {
      const student = inMemoryDb.students.find(s => s.Id === cs.StudentId);
      const user = inMemoryDb.users.find(u => u.Id === student?.UserId);
      return {
        Id: student?.Id,
        UserId: user?.Id,
        FullName: user?.FullName || 'Không rõ',
        Email: user?.Email || '',
        Phone: student?.Phone || '',
        Status: cs.Status
      };
    });

  return res.status(200).json({ success: true, class: classData, students });
});

// GET /api/students/available (Students not in class or all active students)
app.get('/api/students/available', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Không được phép truy cập' });
  }

  const classId = req.query.classId ? parseInt(req.query.classId) : null;
  const enrolledStudentIds = classId
    ? inMemoryDb.classStudents.filter(cs => cs.ClassId === classId && cs.Status === 'active').map(cs => cs.StudentId)
    : [];

  const available = inMemoryDb.students
    .filter(s => s.Status === 'active' && !enrolledStudentIds.includes(s.Id))
    .map(s => {
      const user = inMemoryDb.users.find(u => u.Id === s.UserId);
      return {
        Id: s.Id,
        FullName: user?.FullName || 'Không rõ',
        Email: user?.Email || '',
        Phone: s.Phone || ''
      };
    });

  return res.status(200).json({ success: true, data: available });
});

// POST /api/teacher/classes/:classId/add-student
app.post('/api/teacher/classes/:classId/add-student', (req, res) => {
  console.log('[ADD STUDENT TO CLASS] Request received');
  if (!req.user || (req.user.role !== 'teacher' && req.user.role !== 'admin')) {
    console.log('[ADD STUDENT TO CLASS] ERROR: Forbidden');
    return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện chức năng này' });
  }

  const classId = parseInt(req.params.classId);
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: { studentId: 'Vui lòng chọn học viên' } });
  }

  const classData = inMemoryDb.classes.find(c => c.Id === classId);
  if (!classData) {
    return res.status(404).json({ success: false, message: 'Lớp học không tồn tại' });
  }

  if (req.user.role === 'teacher') {
    const teacher = inMemoryDb.teachers.find(t => t.UserId === req.user.id && t.Id === classData.MainTeacherId);
    if (!teacher) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền quản lý lớp của giảng viên khác' });
    }
  }

  const parsedStudentId = parseInt(studentId);
  const student = inMemoryDb.students.find(s => s.Id === parsedStudentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Học viên không tồn tại trong hệ thống' });
  }

  // Check if student already in class
  const existing = inMemoryDb.classStudents.find(cs => cs.ClassId === classId && cs.StudentId === parsedStudentId);
  if (existing) {
    if (existing.Status === 'active') {
      return res.status(400).json({ success: false, message: 'Học viên đã tham gia lớp học này rồi' });
    } else {
      existing.Status = 'active';
      return res.status(200).json({ success: true, message: 'Đã kích hoạt lại học viên trong lớp' });
    }
  }

  inMemoryDb.classStudents.push({
    Id: inMemoryDb.classStudents.length + 1,
    ClassId: classId,
    StudentId: parsedStudentId,
    JoinDate: new Date(),
    Status: 'active'
  });

  const user = inMemoryDb.users.find(u => u.Id === student.UserId);
  console.log(`[ADD STUDENT TO CLASS] Success: Added ${user?.FullName} to ${classData.Name}`);

  return res.status(201).json({
    success: true,
    message: 'Đã thêm học viên vào lớp thành công',
    data: {
      Id: student.Id,
      FullName: user?.FullName,
      Email: user?.Email,
      Phone: student.Phone,
      Status: 'active'
    }
  });
});

// DELETE /api/teacher/classes/:classId/students/:studentId
app.delete('/api/teacher/classes/:classId/students/:studentId', (req, res) => {
  if (!req.user || (req.user.role !== 'teacher' && req.user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện chức năng này' });
  }

  const classId = parseInt(req.params.classId);
  const studentId = parseInt(req.params.studentId);

  const classData = inMemoryDb.classes.find(c => c.Id === classId);
  if (!classData) {
    return res.status(404).json({ success: false, message: 'Lớp học không tồn tại' });
  }

  if (req.user.role === 'teacher') {
    const teacher = inMemoryDb.teachers.find(t => t.UserId === req.user.id && t.Id === classData.MainTeacherId);
    if (!teacher) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền quản lý lớp của giảng viên khác' });
    }
  }

  inMemoryDb.classStudents = inMemoryDb.classStudents.filter(cs => !(cs.ClassId === classId && cs.StudentId === studentId));
  console.log(`[REMOVE STUDENT FROM CLASS] Removed student ${studentId} from class ${classId}`);
  return res.status(200).json({ success: true, message: 'Đã xóa học viên khỏi lớp' });
});

// GET /api/teacher/attendance
app.get('/api/teacher/attendance', (req, res) => {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Chỉ giảng viên được phép truy cập' });
  }

  const teacher = inMemoryDb.teachers.find(t => t.UserId === req.user.id);
  const teacherClasses = inMemoryDb.classes.filter(c => c.MainTeacherId === teacher?.Id).map(c => c.Id);

  const records = inMemoryDb.attendance
    .filter(a => teacherClasses.includes(a.ClassId))
    .map(a => {
      const cls = inMemoryDb.classes.find(c => c.Id === a.ClassId);
      const student = inMemoryDb.students.find(s => s.Id === a.StudentId);
      const user = inMemoryDb.users.find(u => u.Id === student?.UserId);
      return {
        Id: a.Id,
        ClassId: a.ClassId,
        ClassName: cls?.Name,
        StudentId: a.StudentId,
        StudentName: user?.FullName,
        AttendanceDate: a.AttendanceDate,
        Status: a.Status,
        Note: a.Note
      };
    });

  return res.status(200).json({ success: true, data: records });
});

// GET /api/teacher/classes/:classId/attendance (Chi tiết điểm danh theo lớp)
app.get('/api/teacher/classes/:classId/attendance', (req, res) => {
  if (!req.user || (req.user.role !== 'teacher' && req.user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Chỉ giảng viên được phép truy cập' });
  }

  const classId = parseInt(req.params.classId);
  const targetDate = req.query.date || new Date().toISOString().split('T')[0];

  const cls = inMemoryDb.classes.find(c => c.Id === classId);
  if (!cls) {
    return res.status(404).json({ success: false, message: 'Lớp học không tồn tại' });
  }

  // Danh sách học viên đang học trong lớp
  const studentEnrollments = inMemoryDb.classStudents.filter(cs => cs.ClassId === classId && cs.Status === 'active');
  const studentsAttendance = studentEnrollments.map(en => {
    const student = inMemoryDb.students.find(s => s.Id === en.StudentId);
    const user = student ? inMemoryDb.users.find(u => u.Id === student.UserId) : null;
    const record = inMemoryDb.attendance.find(a => a.ClassId === classId && a.StudentId === en.StudentId && a.AttendanceDate === targetDate);

    // Tính tổng số buổi chuyên cần của học viên trong lớp
    const allStudentAtt = inMemoryDb.attendance.filter(a => a.ClassId === classId && a.StudentId === en.StudentId);
    const presentCount = allStudentAtt.filter(a => a.Status === 'present' || a.Status === 'late').length;

    return {
      StudentId: en.StudentId,
      FullName: user?.FullName || `Học viên #${en.StudentId}`,
      Email: user?.Email || '',
      Phone: student?.Phone || '',
      CurrentStatus: record ? record.Status : 'present', // mặc định là present
      CurrentNote: record ? record.Note : '',
      AttendanceId: record ? record.Id : null,
      TotalAttended: presentCount,
      TotalSessions: allStudentAtt.length
    };
  });

  // Lịch sử các ngày đã điểm danh của lớp
  const uniqueDates = [...new Set(inMemoryDb.attendance.filter(a => a.ClassId === classId).map(a => a.AttendanceDate))].sort().reverse();

  return res.status(200).json({
    success: true,
    className: cls.Name,
    date: targetDate,
    students: studentsAttendance,
    historyDates: uniqueDates
  });
});

// POST /api/teacher/classes/:classId/attendance/bulk (Lưu điểm danh cả lớp)
app.post('/api/teacher/classes/:classId/attendance/bulk', (req, res) => {
  if (!req.user || (req.user.role !== 'teacher' && req.user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Chỉ giảng viên được phép điểm danh' });
  }

  const classId = parseInt(req.params.classId);
  const { date, attendanceList } = req.body;
  const attendanceDate = date || new Date().toISOString().split('T')[0];

  if (!Array.isArray(attendanceList) || attendanceList.length === 0) {
    return res.status(400).json({ success: false, message: 'Danh sách điểm danh không hợp lệ' });
  }

  const teacher = inMemoryDb.teachers.find(t => t.UserId === req.user.id);
  let updatedCount = 0;
  let insertedCount = 0;

  attendanceList.forEach(item => {
    const sId = parseInt(item.studentId);
    const existingIndex = inMemoryDb.attendance.findIndex(a => 
      a.ClassId === classId && a.StudentId === sId && a.AttendanceDate === attendanceDate
    );

    if (existingIndex >= 0) {
      inMemoryDb.attendance[existingIndex].Status = item.status || 'present';
      inMemoryDb.attendance[existingIndex].Note = item.note || '';
      inMemoryDb.attendance[existingIndex].RecordedAt = new Date();
      updatedCount++;
    } else {
      inMemoryDb.attendance.push({
        Id: inMemoryDb.nextAttendanceId++,
        ClassId: classId,
        StudentId: sId,
        AttendanceDate: attendanceDate,
        Status: item.status || 'present',
        Note: item.note || '',
        RecordedBy: teacher?.Id || 1,
        RecordedAt: new Date()
      });
      insertedCount++;
    }
  });

  return res.status(200).json({
    success: true,
    message: `Điểm danh ngày ${attendanceDate} thành công! (Thêm mới: ${insertedCount}, Cập nhật: ${updatedCount})`,
    data: { date: attendanceDate, insertedCount, updatedCount }
  });
});

// POST /api/teacher/attendance (Ghi nhận điểm danh đơn lẻ)
app.post('/api/teacher/attendance', (req, res) => {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Chỉ giảng viên được phép truy cập' });
  }

  const { classId, studentId, status, note, date } = req.body;
  if (!classId || !studentId || !status) {
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: { general: 'Thiếu thông tin điểm danh' } });
  }

  const cId = parseInt(classId);
  const sId = parseInt(studentId);
  const attendanceDate = date || new Date().toISOString().split('T')[0];
  const teacher = inMemoryDb.teachers.find(t => t.UserId === req.user.id);

  const existingIndex = inMemoryDb.attendance.findIndex(a =>
    a.ClassId === cId && a.StudentId === sId && a.AttendanceDate === attendanceDate
  );

  let record;
  if (existingIndex >= 0) {
    inMemoryDb.attendance[existingIndex].Status = status;
    inMemoryDb.attendance[existingIndex].Note = note || '';
    inMemoryDb.attendance[existingIndex].RecordedAt = new Date();
    record = inMemoryDb.attendance[existingIndex];
  } else {
    record = {
      Id: inMemoryDb.nextAttendanceId++,
      ClassId: cId,
      StudentId: sId,
      AttendanceDate: attendanceDate,
      Status: status, // 'present', 'absent', 'late', 'excused'
      Note: note || '',
      RecordedBy: teacher?.Id || 1,
      RecordedAt: new Date()
    };
    inMemoryDb.attendance.push(record);
  }

  return res.status(200).json({ success: true, message: 'Ghi nhận điểm danh thành công', data: record });
});

// ============================================
// STUDENT SPECIFIC APIS
// ============================================

// GET /api/student/classes
app.get('/api/student/classes', (req, res) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Chỉ học viên được phép truy cập' });
  }

  const student = inMemoryDb.students.find(s => s.UserId === req.user.id);
  if (!student) {
    return res.status(200).json({ success: true, data: [] });
  }

  const enrolledClassIds = inMemoryDb.classStudents
    .filter(cs => cs.StudentId === student.Id && cs.Status === 'active')
    .map(cs => cs.ClassId);

  const classes = inMemoryDb.classes
    .filter(c => enrolledClassIds.includes(c.Id))
    .map(c => {
      const teacher = inMemoryDb.teachers.find(t => t.Id === c.MainTeacherId);
      const teacherUser = inMemoryDb.users.find(u => u.Id === teacher?.UserId);
      return {
        ...c,
        TeacherName: teacherUser?.FullName || 'Chưa phân công'
      };
    });

  return res.status(200).json({ success: true, data: classes });
});

// GET /api/student/attendance
app.get('/api/student/attendance', (req, res) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Chỉ học viên được phép truy cập' });
  }

  const student = inMemoryDb.students.find(s => s.UserId === req.user.id);
  if (!student) {
    return res.status(200).json({ success: true, data: [] });
  }

  const records = inMemoryDb.attendance
    .filter(a => a.StudentId === student.Id)
    .map(a => {
      const cls = inMemoryDb.classes.find(c => c.Id === a.ClassId);
      return {
        Id: a.Id,
        ClassName: cls?.Name,
        ClassCode: cls?.Code,
        Date: a.AttendanceDate,
        Status: a.Status,
        Note: a.Note
      };
    });

  return res.status(200).json({ success: true, data: records });
});

// GET /api/student/scores
app.get('/api/student/scores', (req, res) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Chỉ học viên được phép truy cập' });
  }

  const student = inMemoryDb.students.find(s => s.UserId === req.user.id);
  if (!student) {
    return res.status(200).json({ success: true, data: [] });
  }

  const scoreRecords = inMemoryDb.scores
    .filter(sc => sc.StudentId === student.Id)
    .map(sc => {
      const cls = inMemoryDb.classes.find(c => c.Id === sc.ClassId);
      return {
        Id: sc.Id,
        ClassName: cls?.Name,
        ExamName: sc.ExamName,
        Score: sc.Score,
        MaxScore: sc.MaxScore,
        Note: sc.Note
      };
    });

  return res.status(200).json({ success: true, data: scoreRecords });
});

// ============================================
// F09: ĐĂNG KÝ KHÓA HỌC (STUDENT ENROLLMENT)
// ============================================

// GET /api/student/available-classes
app.get('/api/student/available-classes', (req, res) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Chỉ học viên được phép truy cập' });
  }

  const student = inMemoryDb.students.find(s => s.UserId === req.user.id);
  const enrolledClassIds = student
    ? inMemoryDb.classStudents.filter(cs => cs.StudentId === student.Id && cs.Status === 'active').map(cs => cs.ClassId)
    : [];

  const availableClasses = inMemoryDb.classes
    .filter(c => c.Status === 'active' || c.Status === 'open')
    .map(c => {
      const teacher = inMemoryDb.teachers.find(t => t.Id === c.MainTeacherId);
      const teacherUser = teacher ? inMemoryDb.users.find(u => u.Id === teacher.UserId) : null;
      const enrolledCount = inMemoryDb.classStudents.filter(cs => cs.ClassId === c.Id && cs.Status === 'active').length;
      return {
        Id: c.Id,
        Name: c.Name,
        Code: c.Code,
        Description: c.Description,
        TeacherName: teacherUser?.FullName || 'Chưa phân công',
        Fee: c.Fee || 3500000,
        Schedule: c.Schedule || 'Thứ 2, 4, 6 (18:00 - 19:30)',
        Room: c.Room || 'P101',
        MaxStudents: c.MaxStudents || 25,
        EnrolledCount: enrolledCount,
        IsEnrolled: enrolledClassIds.includes(c.Id),
        IsFull: enrolledCount >= (c.MaxStudents || 25)
      };
    });

  return res.status(200).json({ success: true, data: availableClasses });
});

// POST /api/student/enroll
app.post('/api/student/enroll', (req, res) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Chỉ học viên được phép đăng ký lớp học' });
  }

  const { classId } = req.body;
  if (!classId) {
    return res.status(400).json({ success: false, message: 'Vui lòng chọn lớp học cần đăng ký' });
  }

  let student = inMemoryDb.students.find(s => s.UserId === req.user.id);
  if (!student) {
    student = { Id: inMemoryDb.nextStudentId++, UserId: req.user.id, Phone: '', Status: 'active', JoinDate: new Date() };
    inMemoryDb.students.push(student);
  }

  const cls = inMemoryDb.classes.find(c => c.Id === Number(classId));
  if (!cls) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
  }

  const existing = inMemoryDb.classStudents.find(cs => cs.ClassId === cls.Id && cs.StudentId === student.Id && cs.Status === 'active');
  if (existing) {
    return res.status(400).json({ success: false, message: 'Bạn đã đăng ký lớp học này trước đó' });
  }

  const currentCount = inMemoryDb.classStudents.filter(cs => cs.ClassId === cls.Id && cs.Status === 'active').length;
  if (currentCount >= (cls.MaxStudents || 25)) {
    return res.status(400).json({ success: false, message: 'Lớp học đã đủ sĩ số tối đa' });
  }

  const newEnrollment = {
    Id: inMemoryDb.classStudents.length + 1,
    ClassId: cls.Id,
    StudentId: student.Id,
    JoinDate: new Date(),
    Status: 'active'
  };
  inMemoryDb.classStudents.push(newEnrollment);

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  const newTuition = {
    Id: inMemoryDb.nextTuitionId++,
    StudentId: student.Id,
    ClassId: cls.Id,
    Amount: cls.Fee || 3500000,
    DueDate: dueDate.toISOString().split('T')[0],
    Status: 'unpaid',
    PaidDate: null,
    Note: 'Học phí đăng ký khóa học mới'
  };
  inMemoryDb.tuition.push(newTuition);

  return res.status(200).json({
    success: true,
    message: `Đăng ký lớp ${cls.Name} thành công! Hạn đóng học phí: ${newTuition.DueDate}.`,
    data: { enrollment: newEnrollment, tuition: newTuition }
  });
});

// ============================================
// F10 & F11: QUẢN LÝ HỌC PHÍ (TUITION MANAGEMENT)
// ============================================

// GET /api/student/tuition (Học viên tra cứu học phí)
app.get('/api/student/tuition', (req, res) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Chỉ học viên được phép truy cập' });
  }

  const student = inMemoryDb.students.find(s => s.UserId === req.user.id);
  if (!student) {
    return res.status(200).json({ success: true, data: [] });
  }

  const records = inMemoryDb.tuition
    .filter(t => t.StudentId === student.Id)
    .map(t => {
      const cls = inMemoryDb.classes.find(c => c.Id === t.ClassId);
      return {
        Id: t.Id,
        ClassName: cls?.Name || 'Lớp học',
        ClassCode: cls?.Code || '',
        Amount: t.Amount,
        DueDate: t.DueDate,
        Status: t.Status,
        PaidDate: t.PaidDate,
        Note: t.Note
      };
    });

  return res.status(200).json({ success: true, data: records });
});

// GET /api/admin/tuition (Admin xem danh sách học phí)
app.get('/api/admin/tuition', (req, res) => {
  if (!req.user || (req.user.role !== 'admin' && !req.user.isAdmin)) {
    return res.status(403).json({ success: false, message: 'Chỉ quản trị viên có quyền truy cập' });
  }

  const records = inMemoryDb.tuition.map(t => {
    const student = inMemoryDb.students.find(s => s.Id === t.StudentId);
    const user = student ? inMemoryDb.users.find(u => u.Id === student.UserId) : null;
    const cls = inMemoryDb.classes.find(c => c.Id === t.ClassId);
    return {
      Id: t.Id,
      StudentName: user?.FullName || `Học viên #${t.StudentId}`,
      StudentEmail: user?.Email || '',
      ClassName: cls?.Name || 'Lớp học',
      ClassCode: cls?.Code || '',
      Amount: t.Amount,
      DueDate: t.DueDate,
      Status: t.Status,
      PaidDate: t.PaidDate,
      Note: t.Note
    };
  });

  return res.status(200).json({ success: true, data: records });
});

// PUT /api/admin/tuition/:id (Admin cập nhật trạng thái học phí)
app.put('/api/admin/tuition/:id', (req, res) => {
  if (!req.user || (req.user.role !== 'admin' && !req.user.isAdmin)) {
    return res.status(403).json({ success: false, message: 'Chỉ quản trị viên có quyền cập nhật học phí' });
  }

  const tuitionId = Number(req.params.id);
  const tuitionRecord = inMemoryDb.tuition.find(t => t.Id === tuitionId);
  if (!tuitionRecord) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi học phí' });
  }

  const { status, note, paidDate } = req.body;
  if (status) tuitionRecord.Status = status;
  if (note !== undefined) tuitionRecord.Note = note;
  if (status === 'paid') {
    tuitionRecord.PaidDate = paidDate || new Date().toISOString().split('T')[0];
  } else if (status === 'unpaid') {
    tuitionRecord.PaidDate = null;
  }

  return res.status(200).json({ success: true, message: 'Cập nhật trạng thái học phí thành công', data: tuitionRecord });
});

// ============================================
// F13: QUẢN LÝ ĐIỂM SỐ (TEACHER GRADE MANAGEMENT)
// ============================================

// GET /api/teacher/classes/:classId/scores
app.get('/api/teacher/classes/:classId/scores', (req, res) => {
  if (!req.user || (req.user.role !== 'teacher' && req.user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Chỉ giảng viên được phép xem điểm lớp học' });
  }

  const classId = Number(req.params.classId);
  const classObj = inMemoryDb.classes.find(c => c.Id === classId);
  if (!classObj) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
  }

  const studentEnrollments = inMemoryDb.classStudents.filter(cs => cs.ClassId === classId && cs.Status === 'active');
  const scoresData = studentEnrollments.map(en => {
    const student = inMemoryDb.students.find(s => s.Id === en.StudentId);
    const user = student ? inMemoryDb.users.find(u => u.Id === student.UserId) : null;
    const studentScores = inMemoryDb.scores.filter(sc => sc.ClassId === classId && sc.StudentId === en.StudentId);
    return {
      StudentId: en.StudentId,
      FullName: user?.FullName || `Học viên #${en.StudentId}`,
      Email: user?.Email || '',
      Scores: studentScores
    };
  });

  return res.status(200).json({ success: true, className: classObj.Name, data: scoresData });
});

// POST /api/teacher/scores
app.post('/api/teacher/scores', (req, res) => {
  if (!req.user || (req.user.role !== 'teacher' && req.user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Chỉ giảng viên có quyền nhập điểm' });
  }

  const { classId, studentId, examName, score, maxScore = 100, note } = req.body;
  if (!classId || !studentId || !examName || score === undefined) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin điểm kiểm tra' });
  }

  const numScore = Number(score);
  if (isNaN(numScore) || numScore < 0 || numScore > Number(maxScore)) {
    return res.status(400).json({ success: false, message: `Điểm số không hợp lệ (phải từ 0 đến ${maxScore})` });
  }

  const existingIndex = inMemoryDb.scores.findIndex(sc => 
    sc.ClassId === Number(classId) && sc.StudentId === Number(studentId) && sc.ExamName.toLowerCase() === examName.trim().toLowerCase()
  );

  let resultScore;
  if (existingIndex >= 0) {
    inMemoryDb.scores[existingIndex].Score = numScore;
    inMemoryDb.scores[existingIndex].MaxScore = Number(maxScore);
    if (note !== undefined) inMemoryDb.scores[existingIndex].Note = note;
    inMemoryDb.scores[existingIndex].RecordedDate = new Date();
    resultScore = inMemoryDb.scores[existingIndex];
  } else {
    resultScore = {
      Id: inMemoryDb.nextScoreId++,
      StudentId: Number(studentId),
      ClassId: Number(classId),
      ExamName: examName.trim(),
      Score: numScore,
      MaxScore: Number(maxScore),
      RecordedDate: new Date(),
      Note: note || '',
      RecordedBy: req.user.id
    };
    inMemoryDb.scores.push(resultScore);
  }

  return res.status(200).json({ success: true, message: 'Lưu điểm thi thành công', data: resultScore });
});

// ============================================
// F18: 3 CHỨC NĂNG AI CHUYÊN SÂU THEO BÁO CÁO
// ============================================

// 1. POST /api/ai/recommend-class (AI Tư vấn lớp học phù hợp)
app.post('/api/ai/recommend-class', async (req, res) => {
  try {
    const { level, availability, goal } = req.body;
    const openClasses = inMemoryDb.classes.filter(c => c.Status === 'active' || c.Status === 'open');
    const result = await recommendClassWithAi(level, availability, goal, openClasses);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error recommendClass:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xử lý tư vấn AI', error: err.message });
  }
});

// 2. POST /api/ai/generate-practice (AI Sinh bài luyện tập ngắn trắc nghiệm)
app.post('/api/ai/generate-practice', async (req, res) => {
  try {
    const { level = 'A2', topic = 'Từ vựng giao tiếp', number = 5 } = req.body;
    const result = await generatePracticeWithAi(level, topic, number);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error generatePractice:', err);
    return res.status(500).json({ success: false, message: 'Lỗi sinh bài luyện tập AI', error: err.message });
  }
});

// 3. POST /api/ai/summarize-progress (AI Tóm tắt tiến độ học tập 4 phần)
app.post('/api/ai/summarize-progress', async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Chỉ học viên được xem tóm tắt tiến độ của mình' });
    }

    const student = inMemoryDb.students.find(s => s.UserId === req.user.id);
    const scores = student ? inMemoryDb.scores.filter(sc => sc.StudentId === student.Id) : [];
    const attendance = student ? inMemoryDb.attendance.filter(a => a.StudentId === student.Id) : [];

    const result = await summarizeProgressWithAi(req.user.FullName || req.user.name || 'Học viên', scores, attendance);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error summarizeProgress:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tạo tóm tắt AI', error: err.message });
  }
});

// ============================================
// UNIFIED AI CHAT ENDPOINT & ROLE HELPERS
// ============================================

async function processAiRequest(req, res, targetRole) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Không được phép truy cập. Vui lòng đăng nhập.' });
    }

    const effectiveRole = targetRole || req.body.role || req.user.role;

    if (req.user.role !== effectiveRole && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập chức năng này.' });
    }

    const { question, context } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: { question: 'Câu hỏi không được để trống' }
      });
    }

    const intent = detectIntent(question, effectiveRole);
    const dbSource = useSql && sqlPool ? sqlPool : inMemoryDb;

    const result = await executeAiQuery(req.user.id, effectiveRole, question, intent, dbSource, req.user);

    if (result.success === false && result.error) {
      return res.status(500).json({
        success: false,
        message: 'Không thể xử lý yêu cầu AI',
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'AI xử lý thành công',
      data: {
        answer: result.answer,
        role: effectiveRole,
        intent: intent,
        engine: result.engine || 'rule-based',
        model: result.model || null,
        fallbackReason: result.fallbackReason || null,
        details: result.data || result
      }
    });
  } catch (error) {
    console.error('[AI] Handler exception:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể xử lý yêu cầu AI',
      error: error.message
    });
  }
}

// Unified route: POST /api/ai/chat
app.post('/api/ai/chat', (req, res) => {
  return processAiRequest(req, res);
});

// Backward-compatible role routes
app.post('/api/teacher-ai/ask', (req, res) => {
  return processAiRequest(req, res, 'teacher');
});

app.post('/api/admin-ai/ask', (req, res) => {
  return processAiRequest(req, res, 'admin');
});

app.post('/api/student-ai/ask', (req, res) => {
  return processAiRequest(req, res, 'student');
});

// ============================================
// ADMIN SPECIFIC ACTIONS (OTP & ASSIGN)
// ============================================
app.post('/api/admin/request-otp', (req, res) => {
  const { email } = req.body;
  const user = inMemoryDb.users.find(u => u.Email === email && u.IsAdmin === 1);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy quản trị viên với email này' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return res.status(200).json({ success: true, otp, message: `Mã OTP xác thực: ${otp}` });
});

app.post('/api/admin/assign', (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập chức năng này.' });
  }

  const { targetEmail, actorEmail } = req.body;
  const targetUser = inMemoryDb.users.find(u => u.Email === targetEmail);
  const actorUser = inMemoryDb.users.find(u => u.Email === actorEmail);

  if (targetUser) targetUser.IsAdmin = 1;
  if (actorUser && actorUser.Email !== targetEmail) actorUser.IsAdmin = 0;

  return res.status(200).json({ success: true, message: 'Cập nhật quyền admin thành công' });
});

// ============================================
// STATIC & CATCH-ALL ROUTE
// ============================================
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log('✓ System ready with complete CRUD & Role-based AI Engine');
});
