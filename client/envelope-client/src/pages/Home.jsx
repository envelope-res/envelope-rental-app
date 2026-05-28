import React from 'react';
import { Link } from 'react-router-dom';
import { SERVICES, formatPrice } from '../services/api';

const STATS = [
  { value: '500+', label: 'Sesiones realizadas' },
  { value: '200+', label: 'DJs de la comunidad' },
  { value: '1', label: 'Estudio disponible' },
  { value: '98%', label: 'Satisfacción' },
];

const ALL_SERVICES = [
  ...Object.values(SERVICES).map((s, i) => ({
    ...s,
    num: `0${i + 1}`,
    link: '/reservas',
    cta: 'Reservar',
  })),
  {
    id: 'rental', num: '04', name: 'Alquiler de Equipos', color: '#f59e0b',
    description: '2× Pioneer CDJ-3000 + DJM-A9 para tu evento o estudio privado.',
    options: [{ id: 'r', price: 230000 }],
    link: '/equipos', cta: 'Consultar',
  },
];

export default function Home() {
  return (
    <div>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden',
        background: '#04060f',
      }}>
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.3 }} />

        {/* vertical center line — subtle structural element */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: '50%',
          width: 1,
          background: 'linear-gradient(to bottom, transparent, rgba(0,217,159,0.12) 40%, transparent)',
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: 1200, margin: '0 auto', width: '100%',
          padding: '0 24px 72px',
          position: 'relative', zIndex: 1,
        }}>
          {/* top info bar */}
          <div className="hero-reveal hero-reveal-1" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            paddingTop: 20, marginBottom: 52,
          }}>
            <span style={{ fontSize: 11, color: '#5a6492', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Villa María · Córdoba
            </span>
            <span style={{ fontSize: 11, color: '#5a6492', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              2× Pioneer CDJ-3000 · DJM-A9
            </span>
          </div>

          {/* headline */}
          <h1 className="hero-reveal hero-reveal-2" style={{
            fontSize: 'clamp(52px, 10.5vw, 148px)',
            fontWeight: 900,
            lineHeight: 0.88,
            letterSpacing: '-3px',
            textTransform: 'uppercase',
            marginBottom: 44,
          }}>
            Cabina DJ<br />
            <span style={{ color: '#00d99f' }}>Profesional</span>
          </h1>

          {/* divider */}
          <div className="hero-reveal hero-reveal-3" style={{
            height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 44,
          }} />

          {/* bottom row */}
          <div className="hero-reveal hero-reveal-4 grid-hero" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'end',
          }}>
            <p style={{
              fontSize: 16, color: 'rgba(255,255,255,0.48)', lineHeight: 1.8, maxWidth: 420,
            }}>
              Practicá, grabá y aprendé con equipos Pioneer de última generación.
              Reservá por hora o en packs. Sin compromisos.
            </p>

            <div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
                <Link to="/reservas" className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}>
                  Reservar ahora
                </Link>
                <Link to="/comunidad" className="btn-secondary" style={{ fontSize: 15, padding: '14px 32px' }}>
                  Ver comunidad
                </Link>
              </div>

              <div className="hero-reveal hero-reveal-5" style={{ display: 'flex', gap: 40 }}>
                {[['$20k', 'desde / hora'], ['L–V', '17 a 22 hs'], ['Sáb', '10 a 20 hs']].map(([v, l]) => (
                  <div key={v}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>{v}</div>
                    <div style={{ fontSize: 10, color: '#5a6492', marginTop: 4, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#00d99f', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
            Servicios
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Todo lo que podés hacer acá
            </h2>
            <span style={{ fontSize: 11, color: '#2e344f', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              04 disponibles
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {ALL_SERVICES.map((service) => (
            <Link key={service.id} to={service.link} style={{ textDecoration: 'none', display: 'flex' }}>
              <div className="service-card" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: service.color,
                    letterSpacing: '0.15em', fontVariantNumeric: 'tabular-nums',
                  }}>
                    {service.num}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: service.color,
                    background: `${service.color}18`,
                    padding: '3px 10px', borderRadius: 20,
                  }}>
                    {service.cta}
                  </span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.2px' }}>
                  {service.name}
                </h3>
                <p style={{ fontSize: 13, color: '#5a6492', lineHeight: 1.65, flex: 1, marginBottom: 24 }}>
                  {service.description}
                </p>
                <div style={{ fontSize: 16, fontWeight: 800, color: service.color, letterSpacing: '-0.3px' }}>
                  desde {formatPrice(service.options[0].price)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid #0f1220', borderBottom: '1px solid #0f1220' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#00d99f', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
                Proceso
              </p>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, letterSpacing: '-0.5px' }}>
                Cómo funciona
              </h2>
            </div>
            <span style={{ fontSize: 11, color: '#2e344f', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              3 pasos
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { n: '01', title: 'Elegí tu servicio', desc: 'Cabina práctica, grabación, clases o alquiler de equipos.' },
              { n: '02', title: 'Seleccioná fecha y hora', desc: 'Calendario interactivo con disponibilidad en tiempo real.' },
              { n: '03', title: 'A practicar', desc: 'Llegá al estudio y disfrutá del equipo profesional.' },
            ].map((step) => (
              <div key={step.n} className="glass-card" style={{ padding: '32px 28px' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(0,217,159,0.08)', border: '1px solid rgba(0,217,159,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, color: '#00d99f', marginBottom: 20,
                  letterSpacing: '0.05em',
                }}>
                  {step.n}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.2px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 13, color: '#5a6492', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          borderTop: '1px solid #1e2347',
          borderLeft: '1px solid #1e2347',
        }}>
          {STATS.map(s => (
            <div key={s.value} style={{
              padding: '40px 28px',
              borderRight: '1px solid #1e2347',
              borderBottom: '1px solid #1e2347',
            }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: '#00d99f', letterSpacing: '-2px', marginBottom: 8 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: '#5a6492', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIOS ──────────────────────────────────── */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#00d99f', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
              Testimonios
            </p>
            <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Lo que dice la comunidad
            </h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 64 }}>
          {[
            { name: 'Valentina R.', role: 'DJ · 6 meses practicando', quote: 'El equipo es increíble, igual al de los festivales. Aprendí más en 2 meses acá que en años con setup casero. Lo recomiendo sin dudas.' },
            { name: 'Mateo S.', role: 'Productor · Residente Villa María', quote: 'Grabé mi primer set en video con las DJI y quedó a nivel profesional. El espacio es privado, cómodo, y el sonido con los JBL es otro nivel.' },
            { name: 'Lucía B.', role: 'Estudiante avanzada', quote: 'Las clases 1:1 me cambiaron la cabeza. El instructor me enseñó técnicas que no encontré en ningún tutorial. Vale cada peso.' },
            { name: 'Seba G.', role: 'DJ · Eventos privados', quote: 'Alquilé los CDJ-3000 para un evento y todo salió perfecto. Traslado, montaje, asesoramiento. Equipo muy profesional.' },
          ].map(t => (
            <div key={t.name} className="glass-card" style={{ padding: '28px 24px' }}>
              <div style={{ fontSize: 32, color: '#00d99f', lineHeight: 1, marginBottom: 16, opacity: 0.5 }}>"</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, marginBottom: 20 }}>
                {t.quote}
              </p>
              <div style={{ borderTop: '1px solid #1e2347', paddingTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: '#5a6492', marginTop: 3 }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', alignItems: 'center',
          padding: '28px 32px',
          background: 'rgba(10,14,39,0.5)', border: '1px solid #1e2347', borderRadius: 16,
        }}>
          {[
            { label: 'Transferencia Bancaria', sub: 'Alias: envelope.rental' },
            { label: 'MercadoPago', sub: 'Aceptamos MP' },
            { label: 'Equipos Pioneer', sub: '100% certificados' },
            { label: 'Garantía Envelope', sub: 'Satisfacción o repetís gratis' },
          ].map(b => (
            <div key={b.label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 18px', borderRadius: 10,
              background: 'rgba(20,24,54,0.8)', border: '1px solid #1e2347',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d99f', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{b.label}</div>
                <div style={{ fontSize: 10, color: '#5a6492' }}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HORARIOS ─────────────────────────────────────── */}
      <section style={{ padding: '60px 24px 100px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{
          background: 'rgba(10,14,39,0.6)',
          border: '1px solid #1e2347',
          borderRadius: 16, padding: '40px 48px',
        }}>
          <div className="grid-schedule" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#00d99f', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>
                Horarios
              </p>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                Abrimos cuando<br />vos podés practicar
              </h2>
              <p style={{ fontSize: 13, color: '#5a6492', lineHeight: 1.8 }}>
                Diseñamos los horarios para que puedas entrenar después del trabajo o estudiar los fines de semana.
              </p>
            </div>
            <div>
              {[
                { day: 'Lunes – Viernes', hours: '17:00 → 22:00', available: true },
                { day: 'Sábados', hours: '10:00 → 20:00', available: true },
                { day: 'Domingos', hours: 'Cerrado', available: false },
              ].map(h => (
                <div key={h.day} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 0', borderBottom: '1px solid #1a1f40',
                }}>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{h.day}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: h.available ? '#00d99f' : '#4a5568',
                    background: h.available ? 'rgba(0,217,159,0.08)' : 'transparent',
                    padding: '4px 12px', borderRadius: 5,
                  }}>
                    {h.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{
        borderTop: '1px solid #1e2347',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 40 }}>
          <div>
            <p style={{ fontSize: 11, color: '#5a6492', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>
              Próximo paso
            </p>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-1px' }}>
              Reservá tu sesión hoy.
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/reservas" className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}>
              Reservar ahora
            </Link>
            <Link to="/equipos" className="btn-secondary" style={{ fontSize: 15, padding: '14px 32px' }}>
              Ver equipos
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
