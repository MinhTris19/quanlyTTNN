document.addEventListener('DOMContentLoaded', () => {
  const roleButtons = document.querySelectorAll('.role-btn');
  const forms = document.querySelectorAll('.auth-form');

  roleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedRole = button.dataset.role;

      roleButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      forms.forEach((form) => form.classList.remove('active-form'));

      const targetForm = document.querySelector(`.auth-form[data-role="${selectedRole}"]`);
      if (targetForm) {
        targetForm.classList.add('active-form');
      }
    });
  });

  forms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = new FormData(form);
      const username = data.get('username')?.toString().trim();
      const password = data.get('password')?.toString();
      const role = form.dataset.role;

      if (!username || !password) {
        alert('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
        return;
      }

      // Show loading
      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Đang xác thực...';

      try {
        const result = await login(username, password);

        if (result.success) {
          // Check role match
          const userRole = result.user.role;
          if (role === 'admin' && (userRole === 'admin' || result.user.isAdmin)) {
            window.location.href = 'admin.html';
          } else if (role === 'teacher' && userRole === 'teacher') {
            window.location.href = 'teacher.html';
          } else if (role === 'student' && userRole === 'student') {
            window.location.href = 'student.html';
          } else {
            // User role doesn't match selected tab, but redirect them to their actual role page
            alert(`Đăng nhập thành công với vai trò: ${userRole === 'admin' ? 'Quản trị viên' : userRole === 'teacher' ? 'Giảng viên' : 'Học viên'}`);
            if (userRole === 'admin') window.location.href = 'admin.html';
            else if (userRole === 'teacher') window.location.href = 'teacher.html';
            else window.location.href = 'student.html';
          }
        } else {
          alert('❌ ' + (result.message || 'Thông tin đăng nhập hoặc mật khẩu không chính xác'));
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('❌ Lỗi kết nối máy chủ');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  });
});
