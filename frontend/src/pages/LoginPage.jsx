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

  useEffect(() => {
    const token = getToken();
    if (token) {
      verifyToken()
        .then(() => navigate('/admin'))
        .catch(() => { });
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
      <main className="login-wrapper">
        <div className="login-card">
          <div className="login-card__header">
            <span className="login-card__mark" aria-hidden="true" />
            <span className="login-card__eyebrow">Galeri Yudi</span>
            <h1 className="login-card__title">Masuk ke Dashboard</h1>
            <p className="login-card__subtitle">Kelola produk dan katalog Anda.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="login-form__group">
              <label htmlFor="login-username" className="login-form__label">
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
                <button
                  type="button"
                  className="login-form__eye"
                  onClick={() => setShowPassword(p => !p)}
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

            {error && (
              <div className="login-form__error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`login-form__submit ${loading ? 'is-loading' : ''} ${success ? 'is-success' : ''}`}
              disabled={loading || success}
            >
              {success ? 'Login berhasil' : loading ? 'Memproses…' : 'Masuk'}
            </button>
          </form>

          <div className="login-card__footer">
            <Link to="/" className="login-card__footer-link">
              Kembali ke website
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
