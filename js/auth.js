const storageKey = 'linguahub-session';
const sessionIdKey = 'linguahub-sessionId';
const API_BASE_URL = window.location.protocol === 'file:' ? 'http://localhost:3000' : `${window.location.protocol}//${window.location.hostname}:3000`;

// ============================================
// SESSION MANAGEMENT (Backend-based)
// ============================================
function setSession(user) {
  localStorage.setItem(storageKey, JSON.stringify(user));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || 'null');
  } catch {
    return null;
  }
}

function getSessionId() {
  return localStorage.getItem(sessionIdKey);
}

function setSessionId(sessionId) {
  localStorage.setItem(sessionIdKey, sessionId);
}

function clearSession() {
  localStorage.removeItem(storageKey);
  localStorage.removeItem(sessionIdKey);
}

// ============================================
// API CALL HELPER with Authentication
// ============================================
async function apiCall(url, options = {}) {
  const sessionId = getSessionId();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (sessionId) {
    headers['Authorization'] = `Bearer ${sessionId}`;
  }

  try {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    const response = await fetch(fullUrl, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({ success: false, message: 'Phản hồi không hợp lệ từ máy chủ' }));

    if (response.status === 401) {
      clearSession();
      if (!window.location.pathname.endsWith('login.html') &&
          !window.location.pathname.endsWith('admin-login.html') &&
          !window.location.pathname.endsWith('register.html') &&
          window.location.pathname !== '/') {
        window.location.href = 'login.html';
      }
    }

    return { status: response.status, data };
  } catch (error) {
    console.error('API Call error:', error);
    return { status: 500, data: { success: false, message: 'Lỗi kết nối máy chủ' } };
  }
}

// ============================================
// LOGIN FUNCTION (calls backend)
// ============================================
async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (data.success) {
      setSession(data.user);
      setSessionId(data.sessionId);
      return data;
    } else {
      return { success: false, message: data.message || 'Đăng nhập thất bại', errors: data.errors };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Lỗi kết nối máy chủ' };
  }
}

// ============================================
// REGISTER FUNCTION (calls backend)
// ============================================
async function register(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    return { status: response.status, ...data };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, message: 'Lỗi kết nối máy chủ' };
  }
}

// ============================================
// LOGOUT FUNCTION
// ============================================
async function logout() {
  try {
    await apiCall('/api/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearSession();
    window.location.href = 'login.html';
  }
}
