// ============================================
// AI ASSISTANT - Role-based AI Assistant Client
// ============================================

function createRoleAssistant(role) {
  const roleConfig = {
    admin: {
      title: 'AI Quản trị',
      placeholder: 'Ví dụ: "Thống kê hệ thống", "Có bao nhiêu học viên?", "Danh sách giảng viên"',
      scope: 'Hỗ trợ quản trị trung tâm: thống kê học viên, giảng viên, lớp học, báo cáo vận hành.'
    },
    teacher: {
      title: 'AI Giảng viên',
      placeholder: 'Ví dụ: "Tôi có bao nhiêu học viên?", "Hôm nay ai vắng mặt?", "Điểm của Nguyễn Văn A"',
      scope: 'Hỗ trợ giảng viên: xem lớp phụ trách, học viên trong lớp, điểm danh, điểm thi.'
    },
    student: {
      title: 'AI Học viên',
      placeholder: 'Ví dụ: "Tôi đang học lớp nào?", "Giáo viên của tôi là ai?", "Điểm thi của tôi"',
      scope: 'Hỗ trợ học viên: thông tin lớp học, lịch học, lịch sử điểm danh, bảng điểm cá nhân.'
    }
  };

  const config = roleConfig[role] || roleConfig.student;

  return {
    config,

    /**
     * Ask AI a question asynchronously
     * @param {string} question - Question from user
     * @param {object} context - Optional context data
     * @returns {Promise<string>} Answer text
     */
    async askAI(question, context = {}) {
      if (!question || !question.trim()) {
        return 'Vui lòng nhập câu hỏi trước khi gửi.';
      }

      const session = typeof getSession === 'function' ? getSession() : null;
      const sessionId = typeof getSessionId === 'function' ? getSessionId() : null;

      if (!session || !sessionId) {
        return '❌ Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.';
      }

      const payload = {
        userId: session.id,
        role: role || session.role,
        question: question.trim(),
        context: {
          page: window.location.pathname.split('/').pop() || 'index',
          userRole: session.role,
          ...context
        }
      };

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`
          },
          body: JSON.stringify(payload)
        });

        if (response.status === 401) {
          if (typeof clearSession === 'function') clearSession();
          return '❌ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        }

        if (response.status === 403) {
          return '❌ Bạn không có quyền sử dụng chức năng AI này hoặc truy cập dữ liệu ngoài phạm vi được cấp quyền.';
        }

        const data = await response.json();

        if (data.success && data.data && data.data.answer) {
          return data.data.answer;
        } else if (data.answer) {
          return data.answer;
        } else {
          return data.message || '❌ Không thể xử lý yêu cầu AI vào lúc này.';
        }
      } catch (error) {
        console.error('AI Request Error:', error);
        return '❌ Lỗi kết nối đến dịch vụ AI máy chủ.';
      }
    },

    /**
     * Synchronous answer fallback
     */
    answer(question) {
      return `${config.title}: Đang kết nối dịch vụ AI...`;
    }
  };
}
