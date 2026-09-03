// ============================================
// AI SERVICE - Intent Detection & Query Engine
// ============================================

const sql = require('mssql');

/**
 * Intent Types for all roles
 */
const INTENTS = {
  // Admin Intents
  ADMIN_STATS: 'ADMIN_STATS',
  ADMIN_COUNT_STUDENTS: 'ADMIN_COUNT_STUDENTS',
  ADMIN_COUNT_TEACHERS: 'ADMIN_COUNT_TEACHERS',
  ADMIN_COUNT_CLASSES: 'ADMIN_COUNT_CLASSES',
  ADMIN_LIST_TEACHERS: 'ADMIN_LIST_TEACHERS',
  ADMIN_LIST_CLASSES: 'ADMIN_LIST_CLASSES',
  ADMIN_LIST_STUDENTS: 'ADMIN_LIST_STUDENTS',

  // Teacher Intents
  COUNT_STUDENTS: 'COUNT_STUDENTS',
  COUNT_STUDENTS_BY_LAST_NAME: 'COUNT_STUDENTS_BY_LAST_NAME',
  LIST_STUDENTS: 'LIST_STUDENTS',
  LIST_CLASS_STUDENTS: 'LIST_CLASS_STUDENTS',
  SEARCH_STUDENT: 'SEARCH_STUDENT',
  FIND_STUDENT_CLASS: 'FIND_STUDENT_CLASS',
  ABSENT_TODAY: 'ABSENT_TODAY',
  PRESENT_TODAY: 'PRESENT_TODAY',
  STUDENT_SCORE: 'STUDENT_SCORE',
  CLASS_AVERAGE_SCORE: 'CLASS_AVERAGE_SCORE',
  CLASS_INFO: 'CLASS_INFO',

  // Student Intents
  MY_CLASSES: 'MY_CLASSES',
  MY_TEACHER: 'MY_TEACHER',
  MY_ATTENDANCE: 'MY_ATTENDANCE',
  MY_SCORES: 'MY_SCORES',
  MY_INFO: 'MY_INFO',

  // General / Fallback
  OUT_OF_SCOPE: 'OUT_OF_SCOPE',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Detect intent from Vietnamese question based on role
 * @param {string} question - User question
 * @param {string} role - User role ('admin', 'teacher', 'student')
 * @returns {string} Intent type
 */
function detectIntent(question, role = 'teacher') {
  const q = (question || '').toLowerCase().trim();

  if (!q) return INTENTS.UNKNOWN;

  // Check if question is out of scope
  const isOutOfScope = /^(thời tiết|nấu ăn|bài hát|tin tức|chơi game|bóng đá|du lịch|mua sắm|quần áo)/i.test(q) ||
    /(thời tiết hôm nay|dự báo thời tiết|hát một bài|kể chuyện cười|chơi gì)/i.test(q);
  if (isOutOfScope) {
    return INTENTS.OUT_OF_SCOPE;
  }

  // ============================================
  // ADMIN INTENTS
  // ============================================
  if (role === 'admin') {
    if (/(thống kê|tổng quan|tình hình|báo cáo|overview|summary)/.test(q)) {
      return INTENTS.ADMIN_STATS;
    }
    if (/(bao nhiêu|mấy|tổng số|số lượng).*(học viên|sinh viên|sv|hs|student)/.test(q)) {
      return INTENTS.ADMIN_COUNT_STUDENTS;
    }
    if (/(bao nhiêu|mấy|tổng số|số lượng).*(giảng viên|giáo viên|gv|teacher)/.test(q)) {
      return INTENTS.ADMIN_COUNT_TEACHERS;
    }
    if (/(bao nhiêu|mấy|tổng số|số lượng).*(lớp|lớp học|khóa học|class|course)/.test(q)) {
      return INTENTS.ADMIN_COUNT_CLASSES;
    }
    if (/(danh sách|liệt kê|xem|tất cả).*(giảng viên|giáo viên|gv|teacher)/.test(q)) {
      return INTENTS.ADMIN_LIST_TEACHERS;
    }
    if (/(danh sách|liệt kê|xem|tất cả).*(lớp|lớp học|khóa học|class)/.test(q)) {
      return INTENTS.ADMIN_LIST_CLASSES;
    }
    if (/(danh sách|liệt kê|xem|tất cả).*(học viên|sinh viên|sv|hs|student)/.test(q)) {
      return INTENTS.ADMIN_LIST_STUDENTS;
    }
    if (/(thông tin|chi tiết).*(lớp|class)/.test(q)) {
      return INTENTS.CLASS_INFO;
    }
    return INTENTS.ADMIN_STATS;
  }

  // ============================================
  // STUDENT INTENTS
  // ============================================
  if (role === 'student') {
    if (/(lớp nào|lớp của tôi|khóa học của tôi|đang học lớp|danh sách lớp|môn học|lịch học)/.test(q) &&
        !/(điểm|điểm danh)/.test(q)) {
      return INTENTS.MY_CLASSES;
    }
    if (/(giáo viên|giảng viên|thầy|cô|ai dạy).*(của tôi|phụ trách|dạy tôi)/.test(q) ||
        /(ai dạy|thầy nào|cô nào)/.test(q)) {
      return INTENTS.MY_TEACHER;
    }
    if (/(điểm danh|chuyên cần|có mặt|vắng|nghỉ học|attendance)/.test(q)) {
      return INTENTS.MY_ATTENDANCE;
    }
    if (/(điểm|điểm số|kết quả|kết quả thi|bảng điểm|score|test|exam)/.test(q)) {
      return INTENTS.MY_SCORES;
    }
    if (/(thông tin của tôi|thông tin cá nhân|hồ sơ|tài khoản|profile)/.test(q)) {
      return INTENTS.MY_INFO;
    }
    if (/(lớp|học)/.test(q)) {
      return INTENTS.MY_CLASSES;
    }
    return INTENTS.UNKNOWN;
  }

  // ============================================
  // TEACHER INTENTS (Strict order of precedence)
  // ============================================

  // 1. Absent students today
  if (/(vắng|absent|nghỉ|không đi)/.test(q)) {
    return INTENTS.ABSENT_TODAY;
  }

  // 2. Present students today
  if (/(có mặt|present|đi học|đến lớp)/.test(q)) {
    return INTENTS.PRESENT_TODAY;
  }

  // 3. Count students by last name
  if (/(bao nhiêu|mấy|có mấy|có bao nhiêu|tổng cộng|số lượng).*(học viên|sv|hs).*(họ|tên|tên họ)/.test(q) ||
      /học viên.*(họ|tên|tên họ).*(?:nguyễn|trần|phạm|võ|hoàng|phan|bùi|đặng|lê|trương|dương)/.test(q)) {
    return INTENTS.COUNT_STUDENTS_BY_LAST_NAME;
  }

  // 4. Student score
  if (/(điểm|score|kết quả thi)/.test(q) && !/(trung bình|average|điểm trung bình)/.test(q)) {
    return INTENTS.STUDENT_SCORE;
  }

  // 5. Class average score
  if (/(trung bình|average|điểm trung bình).*(lớp|class)/.test(q) ||
      /(lớp|class).*(trung bình|average)/.test(q)) {
    return INTENTS.CLASS_AVERAGE_SCORE;
  }

  // 6. Specific class student count or list
  if (/(lớp|class|toeic|ielts|toefl).*(bao nhiêu|mấy|danh sách|liệt kê|xem|cho tôi xem).*(học viên|sv|hs)/.test(q) ||
      /(bao nhiêu|mấy|danh sách|liệt kê|xem|cho tôi xem).*(học viên|sv|hs).*(lớp|class|toeic|ielts|toefl)/.test(q) ||
      /(lớp|class)\s+[a-z0-9-]+.*(có|bao nhiêu|học viên)/i.test(q)) {
    return INTENTS.LIST_CLASS_STUDENTS;
  }

  // 7. Find student's classes
  if (/(?:học viên|sv|hs)\s+.+?\s+học\s+(?:lớp|class|nào)/.test(q) ||
      /(.+?)\s+học\s+(?:lớp|class|nào)/.test(q) ||
      /(ai|học viên|name).*(đang học|học).*(lớp|nào|class)/.test(q)) {
    return INTENTS.FIND_STUDENT_CLASS;
  }

  // 8. Class info
  if (/(thông tin|info|chi tiết).*(lớp|class)/.test(q) ||
      /(lớp|class).*(thông tin|info|chi tiết)/.test(q)) {
    return INTENTS.CLASS_INFO;
  }

  // 9. Count total students of teacher
  if (/(bao nhiêu|mấy|có mấy|có bao nhiêu|tổng cộng|số lượng).*(học viên|sv|hs|sinh viên)/.test(q)) {
    return INTENTS.COUNT_STUDENTS;
  }

  // 10. List all students of teacher
  if (/(danh sách|liệt kê|cho tôi xem|xem).*(tất cả|toàn bộ)?.*(học viên|sv|hs)(?!.*lớp)/.test(q) ||
      /tất cả.*học viên/.test(q)) {
    return INTENTS.LIST_STUDENTS;
  }

  // 11. Search specific student
  if (/(tìm|tìm kiếm|kiểm tra|xem|cho tôi xem).*(học viên|sv|hs)/.test(q) ||
      (/\b(?:học viên|sv|hs)\s+[a-zà-ỹ]/i.test(q))) {
    return INTENTS.SEARCH_STUDENT;
  }

  return INTENTS.UNKNOWN;
}

/**
 * Execute AI query based on intent and user role with full authorization check
 * @param {number} userId - Current user ID
 * @param {string} role - User role
 * @param {string} question - Original question
 * @param {string} intent - Detected intent
 * @param {any} db - Database connection pool or in-memory DB
 * @returns {Promise<object>} Result with answer and data
 */
async function executeAiQuery(userId, role, question, intent, db) {
  console.log(`[AI] Request received`);
  console.log(`[AI] UserId: ${userId}`);
  console.log(`[AI] Role: ${role}`);
  console.log(`[AI] Question: ${question}`);
  console.log(`[AI] Intent: ${intent}`);

  try {
    let result;

    if (intent === INTENTS.OUT_OF_SCOPE) {
      result = {
        success: true,
        answer: 'Tôi có thể hỗ trợ các câu hỏi trong phạm vi quản lý trung tâm, lớp học, học viên và các chức năng mà tài khoản của bạn được phép sử dụng.',
        role,
        intent
      };
      console.log(`[AI] Response generated (Out of scope)`);
      return result;
    }

    // ============================================
    // ADMIN QUERIES
    // ============================================
    if (role === 'admin') {
      switch (intent) {
        case INTENTS.ADMIN_STATS:
          result = await adminStats(db);
          break;
        case INTENTS.ADMIN_COUNT_STUDENTS:
          result = await adminCountStudents(db);
          break;
        case INTENTS.ADMIN_COUNT_TEACHERS:
          result = await adminCountTeachers(db);
          break;
        case INTENTS.ADMIN_COUNT_CLASSES:
          result = await adminCountClasses(db);
          break;
        case INTENTS.ADMIN_LIST_TEACHERS:
          result = await adminListTeachers(db);
          break;
        case INTENTS.ADMIN_LIST_CLASSES:
          result = await adminListClasses(db);
          break;
        case INTENTS.ADMIN_LIST_STUDENTS:
          result = await adminListStudents(db);
          break;
        case INTENTS.CLASS_INFO:
          result = await adminClassInfo(question, db);
          break;
        default:
          result = await adminStats(db);
          break;
      }
    }

    // ============================================
    // STUDENT QUERIES
    // ============================================
    else if (role === 'student') {
      switch (intent) {
        case INTENTS.MY_CLASSES:
          result = await studentMyClasses(userId, db);
          break;
        case INTENTS.MY_TEACHER:
          result = await studentMyTeacher(userId, db);
          break;
        case INTENTS.MY_ATTENDANCE:
          result = await studentMyAttendance(userId, db);
          break;
        case INTENTS.MY_SCORES:
          result = await studentMyScores(userId, db);
          break;
        case INTENTS.MY_INFO:
          result = await studentMyInfo(userId, db);
          break;
        default:
          result = {
            success: true,
            answer: 'Tôi là AI Hỗ trợ học viên. Bạn có thể hỏi về các lớp đang học, giáo viên phụ trách, lịch sử điểm danh và điểm số của mình.',
            role,
            intent
          };
          break;
      }
    }

    // ============================================
    // TEACHER QUERIES
    // ============================================
    else if (role === 'teacher') {
      switch (intent) {
        case INTENTS.COUNT_STUDENTS:
          result = await countStudents(userId, role, db);
          break;
        case INTENTS.COUNT_STUDENTS_BY_LAST_NAME:
          result = await countStudentsByLastName(userId, role, question, db);
          break;
        case INTENTS.LIST_STUDENTS:
          result = await listStudents(userId, role, db);
          break;
        case INTENTS.LIST_CLASS_STUDENTS:
          result = await listClassStudents(userId, role, question, db);
          break;
        case INTENTS.SEARCH_STUDENT:
          result = await searchStudent(userId, role, question, db);
          break;
        case INTENTS.FIND_STUDENT_CLASS:
          result = await findStudentClass(userId, role, question, db);
          break;
        case INTENTS.ABSENT_TODAY:
          result = await absentToday(userId, role, db);
          break;
        case INTENTS.PRESENT_TODAY:
          result = await presentToday(userId, role, db);
          break;
        case INTENTS.STUDENT_SCORE:
          result = await studentScore(userId, role, question, db);
          break;
        case INTENTS.CLASS_AVERAGE_SCORE:
          result = await classAverageScore(userId, role, question, db);
          break;
        case INTENTS.CLASS_INFO:
          result = await classInfo(userId, role, question, db);
          break;
        default:
          result = {
            success: true,
            answer: 'Câu hỏi này nằm ngoài phạm vi hỗ trợ của AI Giảng viên. Tôi có thể hỗ trợ về học viên, lớp học, điểm danh, điểm số và lịch học trong các lớp bạn phụ trách.',
            role,
            intent
          };
          break;
      }
    } else {
      result = {
        success: false,
        answer: 'Vai trò người dùng không hợp lệ.',
        role,
        intent
      };
    }

    result.role = role;
    result.intent = intent;
    console.log(`[AI] Database query executed`);
    console.log(`[AI] Response generated`);
    return result;
  } catch (error) {
    console.error('[AI] ERROR:', error);
    return {
      success: false,
      answer: 'Xảy ra lỗi khi xử lý câu hỏi.',
      error: error.message
    };
  }
}

// ============================================
// HELPER: Get teacher's classes
// ============================================
async function getTeacherClasses(userId, db) {
  if (Array.isArray(db?.classes)) {
    const teacher = db.teachers.find(t => t.UserId === userId);
    if (!teacher) return [];
    return db.classes.filter(c => c.MainTeacherId === teacher.Id && c.Status === 'active');
  }

  const result = await db.request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT c.Id, c.Name, c.Code, c.Description, c.MaxStudents, c.Status
      FROM [dbo].[Classes] c
      INNER JOIN [dbo].[Teachers] t ON c.MainTeacherId = t.Id
      WHERE t.UserId = @userId AND c.Status = 'active'
    `);
  return result.recordset;
}

// ============================================
// TEACHER IMPLEMENTATIONS
// ============================================

async function countStudents(userId, role, db) {
  if (role !== 'teacher') return { success: false, answer: 'Chỉ giảng viên có quyền sử dụng chức năng này' };

  const classes = await getTeacherClasses(userId, db);
  if (classes.length === 0) {
    return { success: true, answer: 'Bạn chưa phụ trách lớp nào trong hệ thống.', count: 0 };
  }

  let count = 0;
  if (Array.isArray(db?.classStudents)) {
    const classIds = classes.map(c => c.Id);
    count = db.classStudents.filter(cs => classIds.includes(cs.ClassId) && cs.Status === 'active').length;
  } else {
    const classIds = classes.map(c => c.Id).join(',');
    const result = await db.request().query(`
      SELECT COUNT(*) as count FROM [dbo].[ClassStudents]
      WHERE ClassId IN (${classIds}) AND Status = 'active'
    `);
    count = result.recordset[0].count;
  }

  return {
    success: true,
    answer: count > 0
      ? `Bạn hiện có ${count} học viên trong các lớp được phân công phụ trách.`
      : 'Hiện không có học viên nào trong các lớp bạn phụ trách.',
    count
  };
}

async function countStudentsByLastName(userId, role, question, db) {
  if (role !== 'teacher') return { success: false, answer: 'Chỉ giảng viên có quyền sử dụng chức năng này' };

  const lastNameMatch = question.match(/(nguyễn|trần|phạm|võ|hoàng|phan|bùi|đặng|lê|trương|dương|huỳnh|tô|đinh|vũ|mạc|mã)/i);
  if (!lastNameMatch) {
    return { success: true, answer: 'Bạn chưa cho biết họ của học viên cần tìm.' };
  }

  const lastName = lastNameMatch[1].toLowerCase();
  const classes = await getTeacherClasses(userId, db);
  if (classes.length === 0) {
    return { success: true, answer: 'Bạn chưa phụ trách lớp nào trong hệ thống.', count: 0 };
  }

  let count = 0;
  if (Array.isArray(db?.classStudents)) {
    const classIds = classes.map(c => c.Id);
    const students = db.classStudents
      .filter(cs => classIds.includes(cs.ClassId) && cs.Status === 'active')
      .map(cs => {
        const student = db.students.find(s => s.Id === cs.StudentId);
        return db.users.find(u => u.Id === student?.UserId);
      })
      .filter(u => u && u.FullName.toLowerCase().includes(lastName));
    count = students.length;
  } else {
    const classIds = classes.map(c => c.Id).join(',');
    const result = await db.request().query(`
      SELECT COUNT(*) as count
      FROM [dbo].[ClassStudents] cs
      INNER JOIN [dbo].[Students] s ON cs.StudentId = s.Id
      INNER JOIN [dbo].[Users] u ON s.UserId = u.Id
      WHERE cs.ClassId IN (${classIds}) AND cs.Status = 'active'
      AND LOWER(u.FullName) LIKE '%${lastName}%'
    `);
    count = result.recordset[0].count;
  }

  return {
    success: true,
    answer: count > 0
      ? `Có ${count} học viên họ "${lastName.toUpperCase()}" trong các lớp bạn phụ trách.`
      : `Không tìm thấy học viên nào họ "${lastName.toUpperCase()}" trong các lớp bạn phụ trách.`,
    count,
    lastName
  };
}

async function listStudents(userId, role, db) {
  if (role !== 'teacher') return { success: false, answer: 'Chỉ giảng viên có quyền sử dụng chức năng này' };

  const classes = await getTeacherClasses(userId, db);
  if (classes.length === 0) {
    return { success: true, answer: 'Bạn chưa phụ trách lớp nào.' };
  }

  let students = [];
  if (Array.isArray(db?.classStudents)) {
    const classIds = classes.map(c => c.Id);
    students = db.classStudents
      .filter(cs => classIds.includes(cs.ClassId) && cs.Status === 'active')
      .map(cs => {
        const student = db.students.find(s => s.Id === cs.StudentId);
        const user = db.users.find(u => u.Id === student?.UserId);
        const cls = db.classes.find(c => c.Id === cs.ClassId);
        return {
          Id: user?.Id,
          FullName: user?.FullName,
          Email: user?.Email,
          Phone: student?.Phone,
          ClassName: cls?.Name
        };
      })
      .filter(s => s.FullName);
  } else {
    const classIds = classes.map(c => c.Id).join(',');
    const result = await db.request().query(`
      SELECT u.Id, u.FullName, u.Email, s.Phone, c.Name as ClassName
      FROM [dbo].[ClassStudents] cs
      INNER JOIN [dbo].[Students] s ON cs.StudentId = s.Id
      INNER JOIN [dbo].[Users] u ON s.UserId = u.Id
      INNER JOIN [dbo].[Classes] c ON cs.ClassId = c.Id
      WHERE cs.ClassId IN (${classIds}) AND cs.Status = 'active'
      ORDER BY u.FullName
    `);
    students = result.recordset;
  }

  if (students.length === 0) {
    return { success: true, answer: 'Hiện không có học viên nào trong các lớp bạn phụ trách.' };
  }

  const studentList = students.map(s => `${s.FullName} (${s.ClassName})`).join(', ');
  return {
    success: true,
    answer: `Danh sách ${students.length} học viên trong các lớp bạn phụ trách: ${studentList}`,
    students
  };
}

async function listClassStudents(userId, role, question, db) {
  if (role !== 'teacher') return { success: false, answer: 'Chỉ giảng viên có quyền sử dụng chức năng này' };

  const classMatch = question.match(/(toeic|ielts|toefl|tiếng anh|anh văn|test)\s*[-_]?\s*([0-9a-zA-Z]+)?/i) ||
                     question.match(/lớp\s+([a-zA-Z0-9\s-]+?)(?:\s+có|\s+bao|\?|$)/i);
  if (!classMatch) {
    return { success: true, answer: 'Bạn chưa cho biết tên hoặc mã lớp học cần xem.' };
  }

  const queryToken = (classMatch[0] || classMatch[1]).trim().toLowerCase();
  const classes = await getTeacherClasses(userId, db);
  const matchedClass = classes.find(c =>
    c.Code.toLowerCase().includes(queryToken) ||
    c.Name.toLowerCase().includes(queryToken) ||
    queryToken.includes(c.Code.toLowerCase()) ||
    queryToken.includes(c.Name.toLowerCase())
  );

  if (!matchedClass) {
    return { success: true, answer: `Không tìm thấy lớp phù hợp với "${queryToken}" trong các lớp bạn phụ trách.` };
  }

  let students = [];
  if (Array.isArray(db?.classStudents)) {
    students = db.classStudents
      .filter(cs => cs.ClassId === matchedClass.Id && cs.Status === 'active')
      .map(cs => {
        const student = db.students.find(s => s.Id === cs.StudentId);
        const user = db.users.find(u => u.Id === student?.UserId);
        return {
          Id: user?.Id,
          FullName: user?.FullName,
          Email: user?.Email,
          Phone: student?.Phone
        };
      })
      .filter(s => s.FullName);
  } else {
    const result = await db.request()
      .input('classId', sql.Int, matchedClass.Id)
      .query(`
        SELECT u.Id, u.FullName, u.Email, s.Phone
        FROM [dbo].[ClassStudents] cs
        INNER JOIN [dbo].[Students] s ON cs.StudentId = s.Id
        INNER JOIN [dbo].[Users] u ON s.UserId = u.Id
        WHERE cs.ClassId = @classId AND cs.Status = 'active'
        ORDER BY u.FullName
      `);
    students = result.recordset;
  }

  if (students.length === 0) {
    return { success: true, answer: `Lớp ${matchedClass.Name} hiện chưa có học viên nào.` };
  }

  const studentList = students.map(s => s.FullName).join(', ');
  return {
    success: true,
    answer: `Lớp ${matchedClass.Name} (${matchedClass.Code}) hiện có ${students.length} học viên: ${studentList}`,
    students,
    className: matchedClass.Name
  };
}

async function searchStudent(userId, role, question, db) {
  if (role !== 'teacher') return { success: false, answer: 'Chỉ giảng viên có quyền sử dụng chức năng này' };

  let rawName = question
    .replace(/(?:tìm|tìm kiếm|kiểm tra|xem|cho tôi xem)\s*(?:học viên|sv|hs)?\s*(?:tên)?/i, '')
    .replace(/^(?:học viên|sv|hs|tên)\s+/i, '')
    .replace(/(?:là|ở|trong|lớp).*/i, '')
    .replace(/(?:là\s+)?(?:ai|bao\s+nhiêu|gì|\?|$|\.)/gi, '')
    .trim();

  const studentName = rawName;

  if (!studentName || studentName.length < 2) {
    return { success: true, answer: 'Bạn chưa cho biết tên học viên cần tìm.' };
  }

  const classes = await getTeacherClasses(userId, db);
  if (classes.length === 0) {
    return { success: true, answer: 'Bạn chưa phụ trách lớp nào.' };
  }

  let students = [];
  if (Array.isArray(db?.classStudents)) {
    const classIds = classes.map(c => c.Id);
    students = db.classStudents
      .filter(cs => classIds.includes(cs.ClassId) && cs.Status === 'active')
      .map(cs => {
        const student = db.students.find(s => s.Id === cs.StudentId);
        const user = db.users.find(u => u.Id === student?.UserId);
        const cls = db.classes.find(c => c.Id === cs.ClassId);
        return {
          Id: user?.Id,
          FullName: user?.FullName,
          Email: user?.Email,
          Phone: student?.Phone,
          ClassName: cls?.Name
        };
      })
      .filter(s => s.FullName && s.FullName.toLowerCase().includes(studentName.toLowerCase()));
  } else {
    const classIds = classes.map(c => c.Id).join(',');
    const result = await db.request().query(`
      SELECT u.Id, u.FullName, u.Email, s.Phone, c.Name as ClassName
      FROM [dbo].[ClassStudents] cs
      INNER JOIN [dbo].[Students] s ON cs.StudentId = s.Id
      INNER JOIN [dbo].[Users] u ON s.UserId = u.Id
      INNER JOIN [dbo].[Classes] c ON cs.ClassId = c.Id
      WHERE cs.ClassId IN (${classIds}) AND cs.Status = 'active'
      AND LOWER(u.FullName) LIKE '%${studentName.toLowerCase()}%'
    `);
    students = result.recordset;
  }

  if (students.length === 0) {
    return { success: true, answer: `Tôi không tìm thấy dữ liệu phù hợp trong hệ thống cho học viên "${studentName}".` };
  }

  const studentInfo = students.map(s => `${s.FullName} (Lớp ${s.ClassName}, Email: ${s.Email})`).join('; ');
  return {
    success: true,
    answer: `Tìm thấy ${students.length} học viên: ${studentInfo}`,
    students
  };
}

async function findStudentClass(userId, role, question, db) {
  if (role !== 'teacher') return { success: false, answer: 'Chỉ giảng viên có quyền sử dụng chức năng này' };

  const nameMatch = question.match(/(?:học viên|sv|hs)\s+(.+?)\s+học\s+(?:lớp|class|nào)/i) ||
                    question.match(/(.+?)\s+học\s+(?:lớp|class|nào)/i);
  const rawName = nameMatch ? nameMatch[1].trim() : '';
  const studentName = rawName.replace(/^(?:học viên|sv|hs)\s+/i, '').replace(/[?!.]+$/g, '').trim();

  if (!studentName) {
    return { success: true, answer: 'Bạn chưa cho biết tên học viên.' };
  }

  const classes = await getTeacherClasses(userId, db);
  if (classes.length === 0) {
    return { success: true, answer: 'Bạn chưa phụ trách lớp nào.' };
  }

  let enrolled = [];
  if (Array.isArray(db?.classStudents)) {
    enrolled = db.classStudents
      .filter(cs => classes.map(c => c.Id).includes(cs.ClassId) && cs.Status === 'active')
      .map(cs => {
        const student = db.students.find(s => s.Id === cs.StudentId);
        const user = db.users.find(u => u.Id === student?.UserId);
        const cls = db.classes.find(c => c.Id === cs.ClassId);
        return {
          FullName: user?.FullName,
          ClassName: cls?.Name,
          ClassCode: cls?.Code
        };
      })
      .filter(item => item.FullName && item.FullName.toLowerCase().includes(studentName.toLowerCase()));
  } else {
    const classIds = classes.map(c => c.Id).join(',');
    const result = await db.request().query(`
      SELECT u.FullName, c.Name as ClassName, c.Code as ClassCode
      FROM [dbo].[ClassStudents] cs
      INNER JOIN [dbo].[Students] s ON cs.StudentId = s.Id
      INNER JOIN [dbo].[Users] u ON s.UserId = u.Id
      INNER JOIN [dbo].[Classes] c ON cs.ClassId = c.Id
      WHERE cs.ClassId IN (${classIds}) AND cs.Status = 'active'
      AND LOWER(u.FullName) LIKE '%${studentName.toLowerCase()}%'
    `);
    enrolled = result.recordset;
  }

  if (enrolled.length === 0) {
    return { success: true, answer: `Tôi không tìm thấy dữ liệu lớp học của học viên "${studentName}" trong các lớp bạn phụ trách.` };
  }

  const classList = enrolled.map(x => `${x.ClassName} (${x.ClassCode})`).join(', ');
  return {
    success: true,
    answer: `Học viên ${enrolled[0].FullName} đang học tại: ${classList}.`,
    classes: enrolled
  };
}

async function absentToday(userId, role, db) {
  if (role !== 'teacher') return { success: false, answer: 'Chỉ giảng viên có quyền sử dụng chức năng này' };

  const classes = await getTeacherClasses(userId, db);
  if (classes.length === 0) {
    return { success: true, answer: 'Bạn chưa phụ trách lớp nào.' };
  }

  let students = [];
  if (Array.isArray(db?.attendance)) {
    const classIds = classes.map(c => c.Id);
    students = db.attendance
      .filter(a => classIds.includes(a.ClassId) && a.Status === 'absent')
      .map(a => {
        const student = db.students.find(s => s.Id === a.StudentId);
        const user = db.users.find(u => u.Id === student?.UserId);
        const cls = db.classes.find(c => c.Id === a.ClassId);
        return {
          Id: user?.Id,
          FullName: user?.FullName,
          ClassName: cls?.Name
        };
      })
      .filter(s => s.FullName);
  } else {
    const classIds = classes.map(c => c.Id).join(',');
    const result = await db.request().query(`
      SELECT u.Id, u.FullName, c.Name as ClassName
      FROM [dbo].[Attendance] a
      INNER JOIN [dbo].[Students] s ON a.StudentId = s.Id
      INNER JOIN [dbo].[Users] u ON s.UserId = u.Id
      INNER JOIN [dbo].[Classes] c ON a.ClassId = c.Id
      WHERE a.ClassId IN (${classIds})
      AND a.Status = 'absent'
    `);
    students = result.recordset;
  }

  if (students.length === 0) {
    return { success: true, answer: 'Hôm nay không có học viên nào vắng mặt trong các lớp bạn phụ trách.', count: 0 };
  }

  const studentList = students.map(s => `${s.FullName} (${s.ClassName})`).join(', ');
  return {
    success: true,
    answer: `Hôm nay có ${students.length} học viên vắng mặt: ${studentList}.`,
    students,
    count: students.length
  };
}

async function presentToday(userId, role, db) {
  if (role !== 'teacher') return { success: false, answer: 'Chỉ giảng viên có quyền sử dụng chức năng này' };

  const classes = await getTeacherClasses(userId, db);
  if (classes.length === 0) {
    return { success: true, answer: 'Bạn chưa phụ trách lớp nào.' };
  }

  let students = [];
  if (Array.isArray(db?.attendance)) {
    const classIds = classes.map(c => c.Id);
    students = db.attendance
      .filter(a => classIds.includes(a.ClassId) && (a.Status === 'present' || a.Status === 'late'))
      .map(a => {
        const student = db.students.find(s => s.Id === a.StudentId);
        const user = db.users.find(u => u.Id === student?.UserId);
        const cls = db.classes.find(c => c.Id === a.ClassId);
        return {
          Id: user?.Id,
          FullName: user?.FullName,
          ClassName: cls?.Name,
          Status: a.Status === 'late' ? 'Muộn' : 'Có mặt'
        };
      })
      .filter(s => s.FullName);
  } else {
    const classIds = classes.map(c => c.Id).join(',');
    const result = await db.request().query(`
      SELECT u.Id, u.FullName, c.Name as ClassName, a.Status
      FROM [dbo].[Attendance] a
      INNER JOIN [dbo].[Students] s ON a.StudentId = s.Id
      INNER JOIN [dbo].[Users] u ON s.UserId = u.Id
      INNER JOIN [dbo].[Classes] c ON a.ClassId = c.Id
      WHERE a.ClassId IN (${classIds})
      AND a.Status IN ('present', 'late')
    `);
    students = result.recordset;
  }

  if (students.length === 0) {
    return { success: true, answer: 'Hôm nay chưa có dữ liệu điểm danh có mặt trong các lớp bạn phụ trách.', count: 0 };
  }

  return {
    success: true,
    answer: `Hôm nay có ${students.length} học viên có mặt/đi học trong các lớp bạn phụ trách.`,
    students,
    count: students.length
  };
}

async function studentScore(userId, role, question, db) {
  if (role !== 'teacher') return { success: false, answer: 'Chỉ giảng viên có quyền sử dụng chức năng này' };

  let rawName = question
    .replace(/(?:điểm\s+(?:của)?|score\s+(?:of)?|của)\s*(?:học viên|sv|hs)?/i, '')
    .replace(/^(?:học viên|sv|hs|điểm|score|của|về|từ)\s+/i, '')
    .replace(/(?:là\s+)?(?:bao\s+nhiêu|mấy|như\s+thế\s+nào|\?|$|\.)/gi, '')
    .trim();

  const studentName = rawName;

  if (!studentName || studentName.length < 2) {
    return { success: true, answer: 'Bạn chưa cho biết tên học viên cần tra cứu điểm.' };
  }

  const classes = await getTeacherClasses(userId, db);
  if (classes.length === 0) {
    return { success: true, answer: 'Bạn chưa phụ trách lớp nào.' };
  }

  let scores = [];
  if (Array.isArray(db?.scores)) {
    const classIds = classes.map(c => c.Id);
    scores = db.scores
      .filter(sc => classIds.includes(sc.ClassId))
      .map(sc => {
        const student = db.students.find(s => s.Id === sc.StudentId);
        const user = db.users.find(u => u.Id === student?.UserId);
        const cls = db.classes.find(c => c.Id === sc.ClassId);
        return {
          FullName: user?.FullName,
          ClassName: cls?.Name,
          ExamName: sc.ExamName,
          Score: sc.Score,
          MaxScore: sc.MaxScore
        };
      })
      .filter(s => s.FullName && s.FullName.toLowerCase().includes(studentName.toLowerCase()));
  } else {
    const classIds = classes.map(c => c.Id).join(',');
    const result = await db.request().query(`
      SELECT u.FullName, c.Name as ClassName, sc.ExamName, sc.Score, sc.MaxScore
      FROM [dbo].[Scores] sc
      INNER JOIN [dbo].[Students] s ON sc.StudentId = s.Id
      INNER JOIN [dbo].[Users] u ON s.UserId = u.Id
      INNER JOIN [dbo].[Classes] c ON sc.ClassId = c.Id
      WHERE sc.ClassId IN (${classIds})
      AND LOWER(u.FullName) LIKE '%${studentName.toLowerCase()}%'
    `);
    scores = result.recordset;
  }

  if (scores.length === 0) {
    return { success: true, answer: `Tôi không tìm thấy dữ liệu điểm của học viên "${studentName}" trong các lớp bạn phụ trách.` };
  }

  const scoreList = scores.map(s => `${s.ExamName} (Lớp ${s.ClassName}): ${s.Score}/${s.MaxScore} điểm`).join(', ');
  return {
    success: true,
    answer: `Điểm thi của học viên ${scores[0].FullName}: ${scoreList}.`,
    scores
  };
}

async function classAverageScore(userId, role, question, db) {
  if (role !== 'teacher') return { success: false, answer: 'Chỉ giảng viên có quyền sử dụng chức năng này' };

  const classMatch = question.match(/(toeic|ielts|toefl|test)\s*[-_]?\s*([0-9a-zA-Z]+)?/i) ||
                     question.match(/lớp\s+([a-zA-Z0-9\s-]+?)(?:\s+có|\s+bao|\?|$)/i);
  if (!classMatch) {
    return { success: true, answer: 'Bạn chưa cho biết tên hoặc mã lớp để tính điểm trung bình.' };
  }

  const queryToken = (classMatch[0] || classMatch[1]).trim().toLowerCase();
  const classes = await getTeacherClasses(userId, db);
  const matchedClass = classes.find(c =>
    c.Code.toLowerCase().includes(queryToken) ||
    c.Name.toLowerCase().includes(queryToken)
  );

  if (!matchedClass) {
    return { success: true, answer: `Không tìm thấy lớp "${queryToken}" trong các lớp bạn phụ trách.` };
  }

  let average = 0;
  let count = 0;

  if (Array.isArray(db?.scores)) {
    const classScores = db.scores.filter(sc => sc.ClassId === matchedClass.Id);
    if (classScores.length > 0) {
      count = classScores.length;
      average = classScores.reduce((sum, sc) => sum + Number(sc.Score), 0) / classScores.length;
    }
  } else {
    const result = await db.request()
      .input('classId', sql.Int, matchedClass.Id)
      .query(`
        SELECT AVG(Score) as average, COUNT(*) as count
        FROM [dbo].[Scores]
        WHERE ClassId = @classId
      `);
    const data = result.recordset[0];
    count = data.count || 0;
    average = data.average ? Number(data.average) : 0;
  }

  if (count === 0) {
    return { success: true, answer: `Lớp ${matchedClass.Name} hiện chưa có điểm thi nào được ghi nhận.` };
  }

  return {
    success: true,
    answer: `Điểm trung bình của lớp ${matchedClass.Name} (${matchedClass.Code}) là ${average.toFixed(2)} điểm (dựa trên ${count} bài kiểm tra).`,
    average: Number(average.toFixed(2)),
    className: matchedClass.Name
  };
}

async function classInfo(userId, role, question, db) {
  if (role !== 'teacher') return { success: false, answer: 'Chỉ giảng viên có quyền sử dụng chức năng này' };

  const classMatch = question.match(/(toeic|ielts|toefl|test)\s*[-_]?\s*([0-9a-zA-Z]+)?/i) ||
                     question.match(/lớp\s+([a-zA-Z0-9\s-]+)/i);
  if (!classMatch) {
    return { success: true, answer: 'Bạn chưa cho biết tên hoặc mã lớp cần xem thông tin.' };
  }

  const queryToken = classMatch[0].trim().toLowerCase();
  const classes = await getTeacherClasses(userId, db);
  const matchedClass = classes.find(c =>
    c.Code.toLowerCase().includes(queryToken) ||
    c.Name.toLowerCase().includes(queryToken)
  );

  if (!matchedClass) {
    return { success: true, answer: `Không tìm thấy lớp "${classMatch[0]}" trong các lớp bạn phụ trách.` };
  }

  let studentCount = 0;
  if (Array.isArray(db?.classStudents)) {
    studentCount = db.classStudents.filter(cs => cs.ClassId === matchedClass.Id && cs.Status === 'active').length;
  } else {
    const result = await db.request()
      .input('classId', sql.Int, matchedClass.Id)
      .query(`
        SELECT COUNT(*) as StudentCount
        FROM [dbo].[ClassStudents]
        WHERE ClassId = @classId AND Status = 'active'
      `);
    studentCount = result.recordset[0]?.StudentCount || 0;
  }

  return {
    success: true,
    answer: `Lớp ${matchedClass.Name} (${matchedClass.Code}) hiện có ${studentCount}/${matchedClass.MaxStudents || 30} học viên. Trạng thái: ${matchedClass.Status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}.`,
    classInfo: {
      ...matchedClass,
      StudentCount: studentCount
    }
  };
}

// ============================================
// ADMIN IMPLEMENTATIONS
// ============================================

async function adminStats(db) {
  let studentCount = 0, teacherCount = 0, classCount = 0;

  if (Array.isArray(db?.users)) {
    studentCount = db.students.length;
    teacherCount = db.teachers.length;
    classCount = db.classes.length;
  } else {
    const result = await db.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM [dbo].[Students] WHERE Status = 'active') as StudentCount,
        (SELECT COUNT(*) FROM [dbo].[Teachers] WHERE Status = 'active') as TeacherCount,
        (SELECT COUNT(*) FROM [dbo].[Classes] WHERE Status = 'active') as ClassCount
    `);
    const row = result.recordset[0];
    studentCount = row.StudentCount;
    teacherCount = row.TeacherCount;
    classCount = row.ClassCount;
  }

  return {
    success: true,
    answer: `Thống kê hệ thống LinguaHub: Hiện có ${studentCount} học viên, ${teacherCount} giảng viên và ${classCount} lớp học đang hoạt động.`,
    data: { studentCount, teacherCount, classCount }
  };
}

async function adminCountStudents(db) {
  let count = 0;
  if (Array.isArray(db?.students)) {
    count = db.students.length;
  } else {
    const result = await db.request().query(`SELECT COUNT(*) as count FROM [dbo].[Students] WHERE Status = 'active'`);
    count = result.recordset[0].count;
  }
  return {
    success: true,
    answer: `Trung tâm hiện có tổng cộng ${count} học viên đang theo học.`,
    count
  };
}

async function adminCountTeachers(db) {
  let count = 0;
  if (Array.isArray(db?.teachers)) {
    count = db.teachers.length;
  } else {
    const result = await db.request().query(`SELECT COUNT(*) as count FROM [dbo].[Teachers] WHERE Status = 'active'`);
    count = result.recordset[0].count;
  }
  return {
    success: true,
    answer: `Trung tâm hiện có ${count} giảng viên đang công tác.`,
    count
  };
}

async function adminCountClasses(db) {
  let count = 0;
  if (Array.isArray(db?.classes)) {
    count = db.classes.length;
  } else {
    const result = await db.request().query(`SELECT COUNT(*) as count FROM [dbo].[Classes] WHERE Status = 'active'`);
    count = result.recordset[0].count;
  }
  return {
    success: true,
    answer: `Hiện có ${count} lớp học đang hoạt động trong hệ thống.`,
    count
  };
}

async function adminListTeachers(db) {
  let teachers = [];
  if (Array.isArray(db?.teachers)) {
    teachers = db.teachers.map(t => {
      const u = db.users.find(user => user.Id === t.UserId);
      return { FullName: u?.FullName, Qualification: t.Qualification, Phone: t.Phone };
    }).filter(t => t.FullName);
  } else {
    const result = await db.request().query(`
      SELECT u.FullName, t.Qualification, t.Phone
      FROM [dbo].[Teachers] t
      INNER JOIN [dbo].[Users] u ON t.UserId = u.Id
      WHERE t.Status = 'active'
    `);
    teachers = result.recordset;
  }

  const list = teachers.map(t => `${t.FullName} (${t.Qualification || 'Giảng viên'}, SĐT: ${t.Phone || 'N/A'})`).join('; ');
  return {
    success: true,
    answer: `Danh sách ${teachers.length} giảng viên: ${list}`,
    teachers
  };
}

async function adminListClasses(db) {
  let classes = [];
  if (Array.isArray(db?.classes)) {
    classes = db.classes.map(c => {
      const t = db.teachers.find(teacher => teacher.Id === c.MainTeacherId);
      const u = db.users.find(user => user.Id === t?.UserId);
      return { Name: c.Name, Code: c.Code, TeacherName: u?.FullName || 'Chưa phân công' };
    });
  } else {
    const result = await db.request().query(`
      SELECT c.Name, c.Code, u.FullName as TeacherName
      FROM [dbo].[Classes] c
      LEFT JOIN [dbo].[Teachers] t ON c.MainTeacherId = t.Id
      LEFT JOIN [dbo].[Users] u ON t.UserId = u.Id
      WHERE c.Status = 'active'
    `);
    classes = result.recordset;
  }

  const list = classes.map(c => `${c.Name} [${c.Code}] - GV: ${c.TeacherName}`).join('; ');
  return {
    success: true,
    answer: `Danh sách ${classes.length} lớp học: ${list}`,
    classes
  };
}

async function adminListStudents(db) {
  let students = [];
  if (Array.isArray(db?.students)) {
    students = db.students.map(s => {
      const u = db.users.find(user => user.Id === s.UserId);
      return { FullName: u?.FullName, Email: u?.Email, Phone: s.Phone };
    }).filter(s => s.FullName);
  } else {
    const result = await db.request().query(`
      SELECT u.FullName, u.Email, s.Phone
      FROM [dbo].[Students] s
      INNER JOIN [dbo].[Users] u ON s.UserId = u.Id
      WHERE s.Status = 'active'
    `);
    students = result.recordset;
  }

  const list = students.slice(0, 10).map(s => `${s.FullName} (${s.Email})`).join(', ');
  const more = students.length > 10 ? ` và ${students.length - 10} học viên khác` : '';
  return {
    success: true,
    answer: `Danh sách ${students.length} học viên: ${list}${more}`,
    students
  };
}

async function adminClassInfo(question, db) {
  const classMatch = question.match(/(toeic|ielts|toefl|test)\s*[-_]?\s*([0-9a-zA-Z]+)?/i) ||
                     question.match(/lớp\s+([a-zA-Z0-9\s-]+)/i);
  if (!classMatch) {
    return { success: true, answer: 'Bạn chưa cho biết tên hoặc mã lớp cần xem thông tin.' };
  }

  const queryToken = classMatch[0].trim().toLowerCase();
  let matchedClass = null;
  let teacherName = 'Chưa phân công';
  let studentCount = 0;

  if (Array.isArray(db?.classes)) {
    matchedClass = db.classes.find(c => c.Code.toLowerCase().includes(queryToken) || c.Name.toLowerCase().includes(queryToken));
    if (matchedClass) {
      const t = db.teachers.find(teacher => teacher.Id === matchedClass.MainTeacherId);
      const u = db.users.find(user => user.Id === t?.UserId);
      teacherName = u?.FullName || 'Chưa phân công';
      studentCount = db.classStudents.filter(cs => cs.ClassId === matchedClass.Id && cs.Status === 'active').length;
    }
  } else {
    const result = await db.request().query(`
      SELECT c.*, u.FullName as TeacherName,
        (SELECT COUNT(*) FROM [dbo].[ClassStudents] cs WHERE cs.ClassId = c.Id AND cs.Status = 'active') as StudentCount
      FROM [dbo].[Classes] c
      LEFT JOIN [dbo].[Teachers] t ON c.MainTeacherId = t.Id
      LEFT JOIN [dbo].[Users] u ON t.UserId = u.Id
      WHERE LOWER(c.Code) LIKE '%${queryToken}%' OR LOWER(c.Name) LIKE '%${queryToken}%'
    `);
    if (result.recordset.length > 0) {
      matchedClass = result.recordset[0];
      teacherName = matchedClass.TeacherName || 'Chưa phân công';
      studentCount = matchedClass.StudentCount || 0;
    }
  }

  if (!matchedClass) {
    return { success: true, answer: `Tôi không tìm thấy dữ liệu phù hợp trong hệ thống cho lớp "${classMatch[0]}".` };
  }

  return {
    success: true,
    answer: `Lớp ${matchedClass.Name} (${matchedClass.Code}): Giảng viên phụ trách là ${teacherName}, hiện có ${studentCount}/${matchedClass.MaxStudents || 30} học viên. Trạng thái: ${matchedClass.Status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}.`,
    classInfo: matchedClass
  };
}

// ============================================
// STUDENT IMPLEMENTATIONS
// ============================================

async function studentMyClasses(userId, db) {
  let classes = [];

  if (Array.isArray(db?.students)) {
    const student = db.students.find(s => s.UserId === userId);
    if (student) {
      const enrolledClassIds = db.classStudents
        .filter(cs => cs.StudentId === student.Id && cs.Status === 'active')
        .map(cs => cs.ClassId);

      classes = db.classes
        .filter(c => enrolledClassIds.includes(c.Id))
        .map(c => {
          const t = db.teachers.find(teacher => teacher.Id === c.MainTeacherId);
          const u = db.users.find(user => user.Id === t?.UserId);
          return {
            Name: c.Name,
            Code: c.Code,
            TeacherName: u?.FullName || 'Chưa phân công',
            Description: c.Description
          };
        });
    }
  } else {
    const result = await db.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT c.Name, c.Code, c.Description, uTeacher.FullName as TeacherName
        FROM [dbo].[Students] s
        INNER JOIN [dbo].[ClassStudents] cs ON s.Id = cs.StudentId
        INNER JOIN [dbo].[Classes] c ON cs.ClassId = c.Id
        LEFT JOIN [dbo].[Teachers] t ON c.MainTeacherId = t.Id
        LEFT JOIN [dbo].[Users] uTeacher ON t.UserId = uTeacher.Id
        WHERE s.UserId = @userId AND cs.Status = 'active'
      `);
    classes = result.recordset;
  }

  if (classes.length === 0) {
    return { success: true, answer: 'Bạn hiện chưa tham gia lớp học nào trong hệ thống.' };
  }

  const classList = classes.map(c => `${c.Name} (${c.Code}) do ${c.TeacherName} phụ trách`).join(', ');
  return {
    success: true,
    answer: `Bạn đang theo học ${classes.length} lớp: ${classList}.`,
    classes
  };
}

async function studentMyTeacher(userId, db) {
  let teachers = [];

  if (Array.isArray(db?.students)) {
    const student = db.students.find(s => s.UserId === userId);
    if (student) {
      const classIds = db.classStudents.filter(cs => cs.StudentId === student.Id && cs.Status === 'active').map(cs => cs.ClassId);
      teachers = db.classes
        .filter(c => classIds.includes(c.Id))
        .map(c => {
          const t = db.teachers.find(teacher => teacher.Id === c.MainTeacherId);
          const u = db.users.find(user => user.Id === t?.UserId);
          return { TeacherName: u?.FullName, ClassName: c.Name, Qualification: t?.Qualification, Phone: t?.Phone };
        })
        .filter(t => t.TeacherName);
    }
  } else {
    const result = await db.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT uTeacher.FullName as TeacherName, c.Name as ClassName, t.Qualification, t.Phone
        FROM [dbo].[Students] s
        INNER JOIN [dbo].[ClassStudents] cs ON s.Id = cs.StudentId
        INNER JOIN [dbo].[Classes] c ON cs.ClassId = c.Id
        INNER JOIN [dbo].[Teachers] t ON c.MainTeacherId = t.Id
        INNER JOIN [dbo].[Users] uTeacher ON t.UserId = uTeacher.Id
        WHERE s.UserId = @userId AND cs.Status = 'active'
      `);
    teachers = result.recordset;
  }

  if (teachers.length === 0) {
    return { success: true, answer: 'Bạn chưa được phân công vào lớp có giáo viên phụ trách.' };
  }

  const list = teachers.map(t => `${t.TeacherName} (Lớp ${t.ClassName}, ${t.Qualification || 'Giảng viên'})`).join('; ');
  return {
    success: true,
    answer: `Giáo viên phụ trách các lớp của bạn: ${list}.`,
    teachers
  };
}

async function studentMyAttendance(userId, db) {
  let attendanceList = [];

  if (Array.isArray(db?.students)) {
    const student = db.students.find(s => s.UserId === userId);
    if (student) {
      attendanceList = db.attendance
        .filter(a => a.StudentId === student.Id)
        .map(a => {
          const cls = db.classes.find(c => c.Id === a.ClassId);
          return {
            ClassName: cls?.Name,
            Date: a.AttendanceDate,
            Status: a.Status === 'present' ? 'Có mặt' : a.Status === 'late' ? 'Muộn' : 'Vắng'
          };
        });
    }
  } else {
    const result = await db.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT c.Name as ClassName, a.AttendanceDate as Date, a.Status
        FROM [dbo].[Students] s
        INNER JOIN [dbo].[Attendance] a ON s.Id = a.StudentId
        INNER JOIN [dbo].[Classes] c ON a.ClassId = c.Id
        WHERE s.UserId = @userId
        ORDER BY a.AttendanceDate DESC
      `);
    attendanceList = result.recordset.map(a => ({
      ...a,
      Status: a.Status === 'present' ? 'Có mặt' : a.Status === 'late' ? 'Muộn' : 'Vắng'
    }));
  }

  if (attendanceList.length === 0) {
    return { success: true, answer: 'Bạn chưa có dữ liệu điểm danh nào trong hệ thống.' };
  }

  const presentCount = attendanceList.filter(a => a.Status === 'Có mặt' || a.Status === 'Muộn').length;
  const absentCount = attendanceList.filter(a => a.Status === 'Vắng').length;
  return {
    success: true,
    answer: `Lịch sử điểm danh của bạn: Có mặt ${presentCount} buổi, Vắng ${absentCount} buổi trong tổng số ${attendanceList.length} buổi học đã ghi nhận.`,
    attendance: attendanceList
  };
}

async function studentMyScores(userId, db) {
  let scores = [];

  if (Array.isArray(db?.students)) {
    const student = db.students.find(s => s.UserId === userId);
    if (student) {
      scores = db.scores
        .filter(sc => sc.StudentId === student.Id)
        .map(sc => {
          const cls = db.classes.find(c => c.Id === sc.ClassId);
          return {
            ClassName: cls?.Name,
            ExamName: sc.ExamName,
            Score: sc.Score,
            MaxScore: sc.MaxScore
          };
        });
    }
  } else {
    const result = await db.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT c.Name as ClassName, sc.ExamName, sc.Score, sc.MaxScore
        FROM [dbo].[Students] s
        INNER JOIN [dbo].[Scores] sc ON s.Id = sc.StudentId
        INNER JOIN [dbo].[Classes] c ON sc.ClassId = c.Id
        WHERE s.UserId = @userId
      `);
    scores = result.recordset;
  }

  if (scores.length === 0) {
    return { success: true, answer: 'Bạn chưa có kết quả điểm thi nào được cập nhật.' };
  }

  const list = scores.map(s => `${s.ExamName} (Lớp ${s.ClassName}): ${s.Score}/${s.MaxScore} điểm`).join(', ');
  return {
    success: true,
    answer: `Kết quả điểm thi của bạn: ${list}.`,
    scores
  };
}

async function studentMyInfo(userId, db) {
  let user = null, student = null;

  if (Array.isArray(db?.users)) {
    user = db.users.find(u => u.Id === userId);
    student = db.students.find(s => s.UserId === userId);
  } else {
    const result = await db.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT u.FullName, u.Email, u.Username, s.Phone, s.JoinDate, s.Status
        FROM [dbo].[Users] u
        INNER JOIN [dbo].[Students] s ON u.Id = s.UserId
        WHERE u.Id = @userId
      `);
    if (result.recordset.length > 0) {
      const row = result.recordset[0];
      return {
        success: true,
        answer: `Thông tin tài khoản học viên: Họ tên: ${row.FullName}, Email: ${row.Email}, SĐT: ${row.Phone || 'Chưa cập nhật'}, Trạng thái: ${row.Status === 'active' ? 'Đang học' : 'Tạm dừng'}.`,
        profile: row
      };
    }
  }

  if (!user) {
    return { success: true, answer: 'Không tìm thấy thông tin tài khoản của bạn.' };
  }

  return {
    success: true,
    answer: `Thông tin tài khoản học viên: Họ tên: ${user.FullName}, Email: ${user.Email}, SĐT: ${student?.Phone || 'Chưa cập nhật'}, Trạng thái: ${student?.Status === 'active' ? 'Đang học' : 'Tạm dừng'}.`,
    profile: { FullName: user.FullName, Email: user.Email, Phone: student?.Phone }
  };
}

// Export module
module.exports = {
  INTENTS,
  detectIntent,
  executeAiQuery
};
