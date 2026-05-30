import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function GoogleButton({ onSuccess, onError, label = 'Continuar con Google' }) {
  const login = useGoogleLogin({
    onSuccess,
    onError,
    flow: 'implicit',
  });
  return (
    <button
      type="button"
      onClick={login}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 600,
        background: 'white', color: '#1a1a1a', border: 'none', cursor: 'pointer',
        marginBottom: 16, transition: 'opacity 0.2s',
      }}
      onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
      onMouseOut={e => e.currentTarget.style.opacity = '1'}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
      {label}
    </button>
  );
}

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const redirectAfterLogin = () => {
    const hasPendingPack = Boolean(sessionStorage.getItem('pendingPack'));
    navigate(hasPendingPack ? '/reservas' : '/dashboard');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden');
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    setLoading(true);
    try {
      const res = await authAPI.register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      login(res.data.user, res.data.token);
      redirectAfterLogin();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.googleAuth(tokenResponse.access_token);
      login(res.data.user, res.data.token);
      redirectAfterLogin();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse con Google');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Juan García', autocomplete: 'name' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'tu@email.com', autocomplete: 'email' },
    { name: 'phone', label: 'Teléfono / WhatsApp', type: 'tel', placeholder: '+54 353 656-8980', autocomplete: 'tel' },
    { name: 'password', label: 'Contraseña', type: 'password', placeholder: 'Mínimo 6 caracteres', autocomplete: 'new-password' },
    { name: 'confirm', label: 'Confirmar contraseña', type: 'password', placeholder: '••••••••', autocomplete: 'new-password' },
  ];

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px', position: 'relative',
    }}>
      <div className="orb orb-blue" style={{ width: 400, height: 400, top: 0, right: '10%', position: 'absolute' }} />
      <div className="orb orb-green" style={{ width: 300, height: 300, bottom: 0, left: '10%', position: 'absolute' }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1, animation: 'slideUp 0.5s ease-out' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
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
          <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 28, marginBottom: 8 }}>Crear cuenta gratis</h1>
          <p style={{ fontSize: 14, color: '#5a6492' }}>Empezá a reservar la cabina en minutos</p>
        </div>

        <div className="auth-card" style={{
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
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0 16px' }}>
              {fields.map((f, i) => (
                <div key={f.name} style={{ marginBottom: 16, gridColumn: isMobile ? '1 / -1' : (i === 0 ? '1 / -1' : (i >= 3 ? '1 / -1' : 'auto')) }}>
                  <label className="auth-label" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
                    {f.label}
                  </label>
                  <input
                    className="input-dark" type={f.type} name={f.name}
                    placeholder={f.placeholder} value={form[f.name]}
                    onChange={handle} required={f.name !== 'phone'}
                    autoComplete={f.autocomplete}
                  />
                </div>
              ))}
            </div>

            <button type="submit" className="btn-primary auth-btn" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#1e2347' }} />
            <span style={{ fontSize: 12, color: '#3a4270', whiteSpace: 'nowrap' }}>o registrate con</span>
            <div style={{ flex: 1, height: 1, background: '#1e2347' }} />
          </div>

          <GoogleButton
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Error al registrarse con Google')}
            label="Registrarse con Google"
          />

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#5a6492' }}>
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" style={{ color: '#00d99f', fontWeight: 600, textDecoration: 'none' }}>
              Ingresar
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#3a4270' }}>
          Al registrarte aceptás nuestros términos y condiciones.
        </p>
      </div>
    </div>
  );
}
