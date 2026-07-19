/* ===================================================
   GALERI YUDI — Login Page JavaScript
   Handles login form, API calls, JWT token storage
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  const token = localStorage.getItem('galeriyudi_token');
  if (token) {
    verifyToken(token);
  }

  // Form submit
  const form = document.getElementById('login-form');
  form.addEventListener('submit', handleLogin);

  // Toggle password visibility
  const toggleBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('login-password');
  const eyeIcon = document.getElementById('eye-icon');

  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    // Swap icon
    if (isPassword) {
      eyeIcon.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      `;
    } else {
      eyeIcon.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      `;
    }
  });
});

async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const submitBtn = document.getElementById('login-submit');
  const errorEl = document.getElementById('login-error');
  const errorText = document.getElementById('login-error-text');

  // Hide previous errors
  errorEl.classList.remove('active');

  if (!username || !password) {
    showError('Username dan password wajib diisi.');
    return;
  }

  // Show loading
  submitBtn.classList.add('loading');

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || 'Login gagal. Coba lagi.');
      submitBtn.classList.remove('loading');
      return;
    }

    // Save token
    localStorage.setItem('galeriyudi_token', data.token);
    localStorage.setItem('galeriyudi_user', JSON.stringify(data.user));

    // Success animation then redirect
    submitBtn.classList.remove('loading');
    submitBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>Login Berhasil!</span>
    `;
    submitBtn.style.background = 'linear-gradient(135deg, #059669, #10b981)';

    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 800);

  } catch (err) {
    console.error('Login error:', err);
    showError('Tidak dapat terhubung ke server. Pastikan server berjalan.');
    submitBtn.classList.remove('loading');
  }
}

function showError(message) {
  const errorEl = document.getElementById('login-error');
  const errorText = document.getElementById('login-error-text');
  errorText.textContent = message;
  errorEl.classList.add('active');
}

async function verifyToken(token) {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      // Already logged in, redirect to admin
      window.location.href = 'admin.html';
    }
  } catch (err) {
    // Token invalid or server not reachable, stay on login
    localStorage.removeItem('galeriyudi_token');
    localStorage.removeItem('galeriyudi_user');
  }
}
