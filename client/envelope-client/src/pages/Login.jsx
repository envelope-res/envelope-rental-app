import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.user, res.data.token);
      const hasPendingPack = Boolean(sessionStorage.getItem('pendingPack'));
      navigate(res.data.user.email === 'admin@envelope.com' ? '/admin' : hasPendingPack ? '/reservas' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px', position: 'relative',
    }}>
      <div className="orb orb-green" style={{ width: 400, height: 400, top: 0, left: '10%', position: 'absolute' }} />
      <div className="orb orb-blue" style={{ width: 300, height: 300, bottom: 0, right: '10%', position: 'absolute' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1, animation: 'slideUp 0.5s ease-out' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #00d99f, #0099ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 900, color: 'white',
              boxShadow: '0 0 20px rgba(0,217,159,0.4)',
            }}>E</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'white' }}>ENVELOPE</div>
              <div style={{ fontSize: 10, color: '#5a6492', letterSpacing: '0.15em' }}>RENTAL</div>
            </div>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 28, marginBottom: 8 }}>Bienvenido de vuelta</h1>
          <p style={{ fontSize: 14, color: '#5a6492' }}>Ingresá a tu cuenta para gestionar tus reservas</p>
        </div>

        {/* Form */}
        <div style={{
          background: 'rgba(20,24,54,0.9)', border: '1px solid #1e2347',
          borderRadius: 20, padding: '36px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              fontSize: 13, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
                Email
              </label>
              <input
                className="input-dark" type="email" name="email"
                placeholder="tu@email.com" value={form.email}
                onChange={handle} required autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
                Contraseña
              </label>
              <input
                className="input-dark" type="password" name="password"
                placeholder="••••••••" value={form.password}
                onChange={handle} required autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Ingresando...' : '🚀 Ingresar'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#5a6492' }}>
            ¿No tenés cuenta?{' '}
            <Link to="/registro" style={{ color: '#00d99f', fontWeight: 600, textDecoration: 'none' }}>
              Registrarse gratis
            </Link>
          </div>
        </div>

        {/* Demo hint */}
        <div style={{
          marginTop: 20, padding: '12px 16px',
          background: 'rgba(0,217,159,0.05)', border: '1px solid rgba(0,217,159,0.15)',
          borderRadius: 10, fontSize: 12, color: '#5a6492', textAlign: 'center',
        }}>
          Admin: <span style={{ color: '#00d99f' }}>admin@envelope.com</span>
        </div>
      </div>
    </div>
  );
}
