import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: '#070b1e',
      borderTop: '1px solid #1e2347',
      padding: '48px 24px 24px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'linear-gradient(135deg, #00d99f, #0099ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 900, color: 'white',
              }}>E</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'white' }}>ENVELOPE RENTAL</div>
                <div style={{ fontSize: 10, color: '#5a6492', letterSpacing: '0.15em' }}>CABINA DJ PROFESIONAL</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#5a6492', lineHeight: 1.7 }}>
              El espacio profesional que necesitás para practicar, grabar y aprender DJ.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {['IG', 'TK', 'YT'].map(s => (
                <div key={s} style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: 'rgba(30,35,71,0.8)', border: '1px solid #1e2347',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#5a6492', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: '#5a6492', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              Servicios
            </h4>
            {['Cabina Práctica DJ', 'Grabación Video', 'Clases 1:1', 'Alquiler Equipos'].map(s => (
              <Link key={s} to="/reservas" style={{
                display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 13,
                textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.target.style.color = '#00d99f'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
              >
                {s}
              </Link>
            ))}
          </div>

          {/* Hours */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: '#5a6492', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              Horarios
            </h4>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a1f40', paddingBottom: 8, marginBottom: 8 }}>
                <span>Lunes – Viernes</span>
                <span style={{ color: '#00d99f', fontWeight: 600 }}>17:00 – 22:00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a1f40', paddingBottom: 8, marginBottom: 8 }}>
                <span>Sábados</span>
                <span style={{ color: '#00d99f', fontWeight: 600 }}>10:00 – 20:00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Domingos</span>
                <span style={{ color: '#ef4444', fontWeight: 600 }}>Cerrado</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: '#5a6492', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              Contacto
            </h4>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>📍 Villa Nueva, CP 5093 – Córdoba</div>
              <div>📩 envelope.rental@gmail.com</div>
              <div>📱 +54 353 656-8980</div>
            </div>
            <Link to="/reservas" className="btn-primary" style={{ marginTop: 20, fontSize: 13, padding: '10px 20px', justifyContent: 'center' }}>
              Reservar ahora
            </Link>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid #1e2347',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{ fontSize: 12, color: '#3a4270' }}>
            © 2025 Envelope Rental. Todos los derechos reservados.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Términos', 'Privacidad', 'Contacto'].map(l => (
              <span key={l} style={{ fontSize: 12, color: '#3a4270', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
