import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden');
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    setLoading(true);
    try {
      const res = await authAPI.register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              {fields.map((f, i) => (
                <div key={f.name} style={{ marginBottom: 16, gridColumn: i === 0 ? '1 / -1' : (i >= 3 ? '1 / -1' : 'auto') }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
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

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Creando cuenta...' : '✨ Crear cuenta gratis'}
            </button>
          </form>

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
