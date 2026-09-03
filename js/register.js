document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = data.get('name')?.toString().trim();
    const email = data.get('email')?.toString().trim();
    const phone = data.get('phone')?.toString().trim();
    const username = data.get('username')?.toString().trim();
    const password = data.get('password')?.toString();
    const confirmPassword = data.get('confirmPassword')?.toString();
    const role = data.get('role')?.toString() || 'student';

    if (!name || !email || !phone || !username || !password || !confirmPassword) {
      alert('Vui lòng điền đầy đủ tất cả các trường thông tin');
      return;
    }

    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại');
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang xử lý đăng ký...';

    try {
      const result = await register({
        name,
        email,
        phone,
        username,
        password,
        confirmPassword,
        role
      });

      if (result.success) {
        alert('🎉 Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.');
        window.location.href = 'login.html';
      } else {
        if (result.errors) {
          const firstError = Object.values(result.errors)[0];
          alert('❌ ' + (firstError || result.message || 'Đăng ký không thành công'));
        } else {
          alert('❌ ' + (result.message || 'Đăng ký không thành công'));
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('❌ Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
