document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('admin-login-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang xác thực...';

    try {
      const result = await login(email, password);

      if (result.success) {
        if (result.user.role === 'admin' || result.user.isAdmin) {
          window.location.href = 'admin.html';
        } else {
          alert('❌ Tài khoản này không có quyền quản trị viên');
          clearSession();
        }
      } else {
        alert('❌ ' + (result.message || 'Thông tin đăng nhập quản trị không đúng'));
      }
    } catch (error) {
      console.error('Admin login error:', error);
      alert('❌ Lỗi kết nối đến máy chủ');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
