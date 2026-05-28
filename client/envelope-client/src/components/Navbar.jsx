import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/reservas', label: 'Reservas' },
  { to: '/comunidad', label: 'Comunidad' },
  { to: '/equipos', label: 'Equipos' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(10,14,39,0.95)' : 'rgba(10,14,39,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid #1e2347' : '1px solid rgba(30,35,71,0.3)',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'linear-gradient(135deg, #00d99f, #0099ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 900, color: 'white',
                boxShadow: '0 0 15px rgba(0,217,159,0.4)',
              }}>E</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px', color: 'white' }}>
                  ENVELOPE
                </div>
                <div style={{ fontSize: 10, color: '#5a6492', letterSpacing: '0.15em', marginTop: -2 }}>
                  RENTAL
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              {links.map(l => (
                <Link key={l.to} to={l.to} className={`nav-link ${isActive(l.to) ? 'active' : ''}`}>
                  {l.label}
                </Link>
              ))}
              {user && (
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                  style={{ color: '#f59e0b' }}>
                  Admin
                </Link>
              )}
            </div>

            {/* Auth buttons */}
            <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {user ? (
                <>
                  <div style={{ fontSize: 13, color: '#8892b0' }}>
                    Hola, <span style={{ color: '#00d99f', fontWeight: 600 }}>{user.name?.split(' ')[0]}</span>
                  </div>
                  <button className="btn-ghost" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: 13 }}>
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost" style={{ padding: '8px 18px', fontSize: 13 }}>
                    Ingresar
                  </Link>
                  <Link to="/registro" className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="show-mobile"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 5, padding: 8,
              }}
            >
              <span style={{
                width: 22, height: 2, background: menuOpen ? '#00d99f' : 'white',
                borderRadius: 2, transition: 'all 0.3s',
                transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none',
              }} />
              <span style={{
                width: 22, height: 2, background: menuOpen ? '#00d99f' : 'white',
                borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s',
              }} />
              <span style={{
                width: 22, height: 2, background: menuOpen ? '#00d99f' : 'white',
                borderRadius: 2, transition: 'all 0.3s',
                transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
              }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="show-mobile" style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 999,
          background: 'rgba(10,14,39,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #1e2347',
          padding: '16px 24px 24px',
          animation: 'slideUp 0.2s ease-out',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {links.map(l => (
              <Link key={l.to} to={l.to}
                style={{
                  padding: '12px 0', color: isActive(l.to) ? '#00d99f' : 'rgba(255,255,255,0.8)',
                  textDecoration: 'none', fontWeight: 500, fontSize: 15,
                  borderBottom: '1px solid #1e2347',
                }}>
                {l.label}
              </Link>
            ))}
            {user && (
              <Link to="/dashboard" style={{ padding: '12px 0', color: '#00d99f', textDecoration: 'none', fontWeight: 500, fontSize: 15, borderBottom: '1px solid #1e2347' }}>
                Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" style={{ padding: '12px 0', color: '#f59e0b', textDecoration: 'none', fontWeight: 500, fontSize: 15, borderBottom: '1px solid #1e2347' }}>
                Admin Panel
              </Link>
            )}
            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
              {user ? (
                <button className="btn-ghost" onClick={handleLogout} style={{ flex: 1, justifyContent: 'center' }}>
                  Cerrar sesión
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Ingresar</Link>
                  <Link to="/registro" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Registrarse</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed navbar */}
      <div style={{ height: 64 }} />
    </>
  );
}
