import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reservationsAPI, packsAPI, formatPrice } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reservations');

  useEffect(() => {
    Promise.all([reservationsAPI.getMine(), packsAPI.getMine()])
      .then(([rRes, pRes]) => {
        setReservations(rRes.data);
        setPacks(pRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = reservations.filter(r => new Date(r.start_time) > new Date());
  const past = reservations.filter(r => new Date(r.start_time) <= new Date());
  const totalHours = reservations.reduce((sum, r) => sum + (r.duration_hours || 0), 0);
  const remainingHours = packs.reduce((sum, p) => sum + (p.remaining_hours || 0), 0);

  const formatDT = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#00d99f', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
            DASHBOARD
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
            Bienvenido, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: 14, color: '#5a6492' }}>{user?.email}</p>
        </div>
        <Link to="/reservas" className="btn-primary">
          + Nueva reserva
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 36 }}>
        {[
          { label: 'Reservas totales', value: reservations.length, icon: '📅', color: '#00d99f' },
          { label: 'Próximas sesiones', value: upcoming.length, icon: '⏰', color: '#0099ff' },
          { label: 'Horas reservadas', value: `${totalHours}h`, icon: '⏱️', color: '#a855f7' },
          { label: 'Horas en pack', value: `${remainingHours}h`, icon: '🎟️', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(20,24,54,0.9)', border: '1px solid #1e2347',
            borderRadius: 16, padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color, letterSpacing: '-1px', marginBottom: 4 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: '#5a6492' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(20,24,54,0.8)', borderRadius: 12, padding: 4, width: 'fit-content', border: '1px solid #1e2347' }}>
        {[
          { id: 'reservations', label: '📅 Mis Reservas' },
          { id: 'packs', label: '🎟️ Mis Packs' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? 'linear-gradient(135deg, #00d99f22, #0099ff22)' : 'transparent',
            border: tab === t.id ? '1px solid rgba(0,217,159,0.3)' : '1px solid transparent',
            color: tab === t.id ? '#00d99f' : 'rgba(255,255,255,0.5)',
            padding: '10px 22px', borderRadius: 9, cursor: 'pointer',
            fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#5a6492', padding: 60, fontSize: 14 }}>
          Cargando tus reservas...
        </div>
      ) : (
        <>
          {/* RESERVATIONS TAB */}
          {tab === 'reservations' && (
            <div>
              {/* Upcoming */}
              {upcoming.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#00d99f', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d99f', boxShadow: '0 0 8px #00d99f' }} />
                    Próximas sesiones
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {upcoming.map(r => (
                      <div key={r.id} style={{
                        background: 'rgba(0,217,159,0.04)', border: '1px solid rgba(0,217,159,0.2)',
                        borderRadius: 14, padding: '20px 24px',
                        display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 16,
                      }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{r.service_name}</div>
                          <div style={{ fontSize: 13, color: '#5a6492', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                            <span>📅 {formatDT(r.start_time)}</span>
                            <span>⏱️ {r.duration_hours}h</span>
                            <span>🔑 {r.payment_code}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                          <StatusBadge status={r.status} />
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#00d99f' }}>
                            {formatPrice(r.total_price)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past */}
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#5a6492', marginBottom: 16 }}>
                  Historial de sesiones ({past.length})
                </h2>
                {past.length === 0 && reservations.length === 0 ? (
                  <div style={{
                    background: 'rgba(20,24,54,0.5)', border: '1px dashed #1e2347',
                    borderRadius: 16, padding: '48px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🎧</div>
                    <p style={{ color: '#5a6492', fontSize: 14, marginBottom: 20 }}>
                      Todavía no tenés reservas. ¡Reservá tu primera sesión!
                    </p>
                    <Link to="/reservas" className="btn-primary">Reservar ahora</Link>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(20,24,54,0.6)', border: '1px solid #1e2347', borderRadius: 16, overflow: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Servicio</th>
                          <th>Fecha</th>
                          <th>Duración</th>
                          <th>Código</th>
                          <th>Total</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(past.length > 0 ? past : reservations).map(r => (
                          <tr key={r.id}>
                            <td style={{ fontWeight: 600, maxWidth: 200 }}>{r.service_name}</td>
                            <td style={{ color: '#5a6492', fontSize: 13 }}>{formatDT(r.start_time)}</td>
                            <td style={{ color: '#5a6492' }}>{r.duration_hours}h</td>
                            <td><code style={{ fontSize: 12, color: '#00d99f', background: 'rgba(0,217,159,0.1)', padding: '2px 8px', borderRadius: 4 }}>{r.payment_code}</code></td>
                            <td style={{ fontWeight: 700 }}>{formatPrice(r.total_price)}</td>
                            <td><StatusBadge status={r.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PACKS TAB */}
          {tab === 'packs' && (
            <div>
              {packs.length === 0 ? (
                <div style={{
                  background: 'rgba(20,24,54,0.5)', border: '1px dashed #1e2347',
                  borderRadius: 16, padding: 48, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎟️</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No tenés packs activos</h3>
                  <p style={{ color: '#5a6492', fontSize: 14, marginBottom: 20 }}>
                    Los packs de horas te dan acceso a la cabina a precio reducido.
                  </p>
                  <Link to="/reservas" className="btn-primary">Ver packs disponibles</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {packs.map(p => {
                    const used = p.total_hours - p.remaining_hours;
                    const pct = (used / p.total_hours) * 100;
                    const exp = new Date(p.expiry_date);
                    const expired = exp < new Date();
                    return (
                      <div key={p.id} style={{
                        background: 'rgba(20,24,54,0.9)', border: `1px solid ${expired ? 'rgba(239,68,68,0.3)' : 'rgba(0,217,159,0.3)'}`,
                        borderRadius: 16, padding: 24,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                          <div style={{ fontSize: 28, fontWeight: 900, color: expired ? '#ef4444' : '#00d99f' }}>
                            {p.remaining_hours}h
                          </div>
                          <span className={`badge ${expired ? 'badge-cancelled' : 'badge-confirmed'}`}>
                            {expired ? 'Vencido' : 'Activo'}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#5a6492', marginBottom: 16 }}>
                          de {p.total_hours}h totales
                        </div>
                        <div style={{ height: 6, background: '#1e2347', borderRadius: 3, marginBottom: 12, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 3, width: `${pct}%`,
                            background: expired ? '#ef4444' : 'linear-gradient(90deg, #00d99f, #0099ff)',
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                        <div style={{ fontSize: 12, color: '#3a4270' }}>
                          Vence: {exp.toLocaleDateString('es-AR')}
                        </div>
                        <div style={{ fontSize: 12, color: '#3a4270', marginTop: 4 }}>
                          Valor: {formatPrice(p.total_price)}
                        </div>
                        {!expired && p.remaining_hours > 0 && (
                          <Link to={`/reservas?packId=${p.id}`} className="btn-primary" style={{ marginTop: 16, fontSize: 13, padding: '10px 20px', display: 'inline-flex' }}>
                            Reservar sesión ({p.remaining_hours}h disponibles)
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
