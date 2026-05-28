import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../services/api';

const EQUIPMENT = [
  {
    name: 'Pioneer CDJ-3000',
    qty: 2,
    icon: '💿',
    features: ['Jog wheel 206mm táctil', 'Pantalla 9" HD', 'Wi-Fi rekordbox', 'Streaming integrado', 'Stems & loops avanzados', 'MIDI/HID compatible'],
    color: '#00d99f',
  },
  {
    name: 'Pioneer DJM-A9',
    qty: 1,
    icon: '🎛️',
    features: ['4 canales', 'Beat FX + Sound Color FX', 'USB-C audio 32 bits', 'Fader curve custom', 'Booth independiente', 'Send/Return'],
    color: '#0099ff',
  },
  {
    name: 'JBL 305p MKII',
    qty: 2,
    icon: '🔊',
    features: ['Monitor de estudio 5"', '82W de potencia', 'Imagen estéreo amplia', 'EQ de sala integrado', 'Conexión XLR/TRS', 'Respuesta 43Hz–24kHz'],
    color: '#a855f7',
  },
];

const VIDEO_GEAR = [
  {
    name: 'DJI Action 5 Pro',
    qty: 2,
    icon: '📷',
    features: ['4K/120fps', 'HDR nativo', 'Estabilización RockSteady 4.0', 'Gran angular 155°', 'Micrófono integrado direccional', 'Grabación interna + externa'],
    color: '#f59e0b',
  },
];

const EXTRAS = [
  { icon: '🎧', label: 'Auriculares Pioneer HDJ-X10' },
  { icon: '🎬', label: '2× DJI Action 5 Pro (servicio grabación)' },
  { icon: '💡', label: 'Iluminación ambiente DJ' },
  { icon: '❄️', label: 'Espacio climatizado' },
  { icon: '📡', label: 'Wi-Fi de alta velocidad' },
  { icon: '🔒', label: 'Acceso privado al estudio' },
];

export default function RentalEquipment() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', config: '', date: '', duration: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Hola! Quiero consultar sobre alquiler de equipos.\n` +
      `Nombre: ${form.name}\nTeléfono: ${form.phone}\nEmail: ${form.email}\n` +
      `Configuración: ${form.config || 'A definir'}\n` +
      `Fecha del evento: ${form.date || 'A coordinar'}\n` +
      `Duración: ${form.duration || 'A confirmar'}\nDetalles: ${form.notes || '-'}`
    );
    window.open(`https://wa.me/543536568980?text=${msg}`, '_blank');
    setSubmitted(true);
  };

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(180deg, #050818 0%, #0a0e27 100%)',
        padding: '80px 24px 60px', position: 'relative', overflow: 'hidden',
      }}>
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
        <div className="orb orb-blue" style={{ width: 500, height: 500, top: -100, right: -100, position: 'absolute' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
            ALQUILER DE EQUIPOS
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 50px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 16 }}>
            El setup que usan los<br />
            <span className="gradient-text">pros en tu evento</span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 500, lineHeight: 1.7, marginBottom: 32 }}>
            2× Pioneer CDJ-3000 + DJM-A9 + monitores JBL 305p MKII. El rider técnico de los festivales más grandes del mundo, disponible para tu evento.
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 16, padding: '16px 28px',
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 14,
          }}>
            <div>
              <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, letterSpacing: '0.1em' }}>PRECIO ALQUILER</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>$230.000</div>
            </div>
            <div style={{ width: 1, height: 50, background: 'rgba(245,158,11,0.2)' }} />
            <div style={{ fontSize: 13, color: '#f59e0b' }}>
              Incluye traslado<br />y montaje
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div className="grid-equipment-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 48, alignItems: 'start' }}>
          <div>
            {/* Equipment cards */}
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Equipamiento incluido</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
              {EQUIPMENT.map((eq) => (
                <div key={eq.name} style={{
                  background: 'rgba(20,24,54,0.9)', border: '1px solid #1e2347',
                  borderRadius: 16, padding: '24px 28px',
                  display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, fontSize: 22,
                        background: eq.color === '#00d99f' ? 'rgba(0,217,159,0.15)' : eq.color === '#0099ff' ? 'rgba(0,153,255,0.15)' : 'rgba(168,85,247,0.15)',
                        border: eq.color === '#00d99f' ? '1px solid rgba(0,217,159,0.3)' : eq.color === '#0099ff' ? '1px solid rgba(0,153,255,0.3)' : '1px solid rgba(168,85,247,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {eq.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{eq.name}</div>
                        <div style={{ fontSize: 12, color: eq.color }}>× {eq.qty} unidad{eq.qty > 1 ? 'es' : ''}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {eq.features.map(f => (
                        <span key={f} style={{
                          background: 'rgba(30,35,71,0.8)', border: '1px solid #1e2347',
                          borderRadius: 6, padding: '4px 10px', fontSize: 12, color: 'rgba(255,255,255,0.7)',
                        }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'center', padding: '8px 16px',
                    background: eq.color === '#00d99f' ? 'rgba(0,217,159,0.1)' : eq.color === '#0099ff' ? 'rgba(0,153,255,0.1)' : 'rgba(168,85,247,0.1)',
                    border: eq.color === '#00d99f' ? '1px solid rgba(0,217,159,0.2)' : eq.color === '#0099ff' ? '1px solid rgba(0,153,255,0.2)' : '1px solid rgba(168,85,247,0.2)',
                    borderRadius: 10,
                  }}>
                    <div style={{ fontSize: 11, color: '#5a6492', marginBottom: 4 }}>Incluido</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: eq.color }}>✓</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Video gear */}
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, marginTop: 8 }}>
              Cámaras · Servicio de grabación
            </h2>
            <p style={{ fontSize: 13, color: '#5a6492', marginBottom: 16 }}>
              Incluidas en el servicio de <strong style={{ color: '#0099ff' }}>Grabación Video DJ</strong>. No disponibles para alquiler individual.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
              {VIDEO_GEAR.map((eq) => (
                <div key={eq.name} style={{
                  background: 'rgba(20,24,54,0.9)', border: '1px solid rgba(245,158,11,0.25)',
                  borderRadius: 16, padding: '24px 28px',
                  display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, fontSize: 22,
                        background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {eq.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{eq.name}</div>
                        <div style={{ fontSize: 12, color: '#f59e0b' }}>× {eq.qty} unidades</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {eq.features.map(f => (
                        <span key={f} style={{
                          background: 'rgba(30,35,71,0.8)', border: '1px solid #1e2347',
                          borderRadius: 6, padding: '4px 10px', fontSize: 12, color: 'rgba(255,255,255,0.7)',
                        }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'center', padding: '8px 16px',
                    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: 10,
                  }}>
                    <div style={{ fontSize: 11, color: '#5a6492', marginBottom: 4 }}>Grabación</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>🎬</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Extras */}
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>También incluye</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 40 }}>
              {EXTRAS.map(ex => (
                <div key={ex.label} style={{
                  background: 'rgba(20,24,54,0.7)', border: '1px solid #1e2347',
                  borderRadius: 12, padding: '16px 18px',
                  display: 'flex', alignItems: 'center', gap: 12, fontSize: 13,
                }}>
                  <span style={{ fontSize: 20 }}>{ex.icon}</span>
                  <span style={{ color: 'rgba(255,255,255,0.8)' }}>{ex.label}</span>
                </div>
              ))}
            </div>

            {/* Pricing note */}
            <div style={{
              background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 16, padding: '24px 28px',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', marginBottom: 12 }}>
                💡 ¿Necesitás algo más?
              </h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: 16 }}>
                También podemos cotizar técnico de sonido, control de luces adicional, o equipos extra para setups más grandes. Consultanos sin compromiso.
              </p>
              <Link to="/reservas" className="btn-primary" style={{ fontSize: 13, padding: '10px 20px' }}>
                Ver cabina de práctica
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div className="equipment-form-sticky" style={{ position: 'sticky', top: 80 }}>
            {submitted ? (
              <div style={{
                background: 'rgba(20,24,54,0.9)', border: '1px solid rgba(0,217,159,0.3)',
                borderRadius: 20, padding: '48px 32px', textAlign: 'center',
                animation: 'slideUp 0.5s ease-out',
              }}>
                <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>¡Consulta recibida!</h3>
                <p style={{ fontSize: 14, color: '#5a6492', lineHeight: 1.7 }}>
                  Te contactamos en menos de 24hs para coordinar los detalles del alquiler.
                </p>
                <button className="btn-secondary" onClick={() => setSubmitted(false)} style={{ marginTop: 24 }}>
                  Nueva consulta
                </button>
              </div>
            ) : (
              <div style={{
                background: 'rgba(20,24,54,0.9)', border: '1px solid #1e2347',
                borderRadius: 20, padding: '32px 28px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Solicitar cotización</h3>
                <p style={{ fontSize: 13, color: '#5a6492', marginBottom: 24 }}>
                  Completá el formulario y te respondemos en menos de 24hs.
                </p>

                <div style={{
                  background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: 10, padding: '12px 16px', marginBottom: 24,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 20 }}>💰</span>
                  <div>
                    <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>Precio base</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>{formatPrice(230000)}</div>
                  </div>
                </div>

                <form onSubmit={submit}>
                  {[
                    { name: 'name', label: 'Nombre *', type: 'text', placeholder: 'Tu nombre' },
                    { name: 'phone', label: 'Teléfono *', type: 'tel', placeholder: '+54 353 656-8980' },
                    { name: 'email', label: 'Email *', type: 'email', placeholder: 'tu@email.com' },
                  ].map(f => (
                    <div key={f.name} style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5a6492', marginBottom: 6 }}>
                        {f.label}
                      </label>
                      <input className="input-dark" type={f.type} name={f.name}
                        placeholder={f.placeholder} value={form[f.name]}
                        onChange={handle} required
                      />
                    </div>
                  ))}

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5a6492', marginBottom: 6 }}>
                      Configuración *
                    </label>
                    <select className="input-dark" name="config" value={form.config} onChange={handle} required>
                      <option value="">Seleccioná un setup</option>
                      <option value="CDJ-3000 × 2 + DJM-A9">CDJ-3000 × 2 + DJM-A9 (sin monitores)</option>
                      <option value="Setup completo: CDJ-3000 × 2 + DJM-A9 + JBL 305p × 2">Setup completo: CDJ + mixer + monitores JBL</option>
                      <option value="Setup completo + iluminación ambiente">Setup completo + iluminación ambiente</option>
                      <option value="A coordinar">No estoy seguro, necesito asesoramiento</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5a6492', marginBottom: 6 }}>
                      Fecha del evento *
                    </label>
                    <input className="input-dark" type="date" name="date" value={form.date} onChange={handle} required />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5a6492', marginBottom: 6 }}>
                      Cantidad de horas *
                    </label>
                    <select className="input-dark" name="duration" value={form.duration} onChange={handle} required>
                      <option value="">Seleccioná duración</option>
                      {['1 hora', '2 horas', '3 horas', '4 horas', '5 horas', '6 horas', '7 horas', '8+ horas'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5a6492', marginBottom: 6 }}>
                      Detalles del evento
                    </label>
                    <textarea className="input-dark" name="notes" rows={3}
                      placeholder="Tipo de evento, lugar, requerimientos especiales..."
                      value={form.notes} onChange={handle}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <button type="submit" className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                    Consultar por WhatsApp
                  </button>
                </form>
                <div style={{ borderTop: '1px solid #1e2347', marginTop: 20, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <a
                    href={`https://wa.me/543536568980?text=Hola! Quiero consultar sobre el alquiler de equipos (CDJ-3000 + DJM-A9). Fecha del evento: ${form.date || '(a coordinar)'}.`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)',
                      color: '#25d366', padding: '12px', borderRadius: 10,
                      fontWeight: 600, fontSize: 13, textDecoration: 'none', transition: 'all 0.2s',
                    }}
                  >
                    Consultar por WhatsApp
                  </a>
                  <p style={{ fontSize: 11, color: '#3a4270', textAlign: 'center' }}>
                    Sin compromiso · envelope.rental@gmail.com
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
