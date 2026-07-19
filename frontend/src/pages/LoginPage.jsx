import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAPI, verifyToken } from '../utils/api';
import { saveAuth, getToken } from '../utils/auth';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = getToken();
    if (token) {
      verifyToken()
        .then(() => navigate('/admin'))
        .catch(() => {});
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Username dan password wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const data = await loginAPI(username.trim(), password);
      saveAuth(data.token, data.user);
      setSuccess(true);
      setTimeout(() => navigate('/admin'), 800);
    } catch (err) {
      setError(err.message || 'Login gagal. Coba lagi.');
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Animated Background */}
      <div className="login-bg">
        <div className="login-bg__orb login-bg__orb--1" />
        <div className="login-bg__orb login-bg__orb--2" />
        <div className="login-bg__orb login-bg__orb--3" />
        <div className="login-bg__leaf login-bg__leaf--1">🍃</div>
        <div className="login-bg__leaf login-bg__leaf--2">🌿</div>
        <div className="login-bg__leaf login-bg__leaf--3">🍂</div>
        <div className="login-bg__leaf login-bg__leaf--4">🌱</div>
        <div className="login-bg__leaf login-bg__leaf--5">🍃</div>
      </div>

      <main className="login-wrapper">
        <div className="login-card">
          {/* Header */}
          <div className="login-card__header">
            <Link to="/" className="login-card__back" title="Kembali ke website">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </Link>
            <div className="login-card__logo">
              <div className="login-card__logo-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span className="login-card__logo-text">Galeri Yudi</span>
              <span className="login-card__badge">Admin Panel</span>
            </div>
            <h1 className="login-card__title">Selamat Datang Kembali</h1>
            <p className="login-card__subtitle">Masuk ke dashboard admin untuk mengelola produk dan katalog Anda.</p>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="login-form__group">
              <label htmlFor="login-username" className="login-form__label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Username
              </label>
              <input
                type="text"
                id="login-username"
                className="login-form__input"
                placeholder="Masukkan username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="login-form__group">
              <label htmlFor="login-password" className="login-form__label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Password
              </label>
              <div className="login-form__password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  className="login-form__input"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="login-form__eye" onClick={() => setShowPassword(p => !p)} title="Tampilkan password">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPassword ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="login-form__error active">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className={`login-form__submit ${loading ? 'loading' : ''} ${success ? 'success' : ''}`}
              disabled={loading || success}
            >
              {success ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Login Berhasil!</span>
                </>
              ) : (
                <>
                  <span className="login-form__submit-text">Masuk ke Dashboard</span>
                  {loading && (
                    <span className="login-form__submit-loader">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" strokeDasharray="31.42" strokeDashoffset="10" />
                      </svg>
                    </span>
                  )}
                  {!loading && (
                    <svg className="login-form__submit-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="login-card__footer">
            <Link to="/" className="login-card__footer-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Kembali ke Website
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
