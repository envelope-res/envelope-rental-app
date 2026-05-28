import React, { useState, useEffect } from 'react';
import { adminAPI, formatPrice } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const ADMIN_PIN = 'envelope2024';

export default function Admin() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('admin_unlocked') === '1');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hourPacks, setHourPacks] = useState([]);
  const [tab, setTab] = useState('reservations');
  const [filter, setFilter] = useState('all');
  const [blockForm, setBlockForm] = useState({ startTime: '', endTime: '', reason: '' });
  const [blockMsg, setBlockMsg] = useState('');
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState(null);

  const unlock = () => {
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('admin_unlocked', '1');
      setUnlocked(true);
    } else {
      setPinError('PIN incorrecto');
      setTimeout(() => setPinError(''), 2000);
    }
  };

  useEffect(() => {
    if (!unlocked) return;
    setLoading(true);
    adminAPI.getAllReservations()
      .then(r => setReservations(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    adminAPI.getHourPacks()
      .then(r => setHourPacks(r.data))
      .catch(() => {});
  }, [unlocked]);

  useEffect(() => {
    const close = () => setOpenMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const updateStatus = async (id, status) => {
    setOpenMenu(null);
    try {
      await adminAPI.updateStatus(id, status);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch {
      alert('Error al actualizar. Reiniciá el servidor y volvé a intentar.');
    }
  };

  const blockSlot = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.blockSlot(blockForm);
      setBlockMsg('Horario bloqueado exitosamente');
      setBlockForm({ startTime: '', endTime: '', reason: '' });
    } catch {
      setBlockMsg('Error al bloquear. Verificá el servidor.');
    }
    setTimeout(() => setBlockMsg(''), 3000);
  };

  const filtered = reservations.filter(r => {
    const matchStatus = filter === 'all' || r.status === filter;
    const matchSearch = !search || r.service_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) || r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.payment_code?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    revenue: reservations.reduce((s, r) => s + (r.total_price || 0), 0),
    hours: reservations.reduce((s, r) => s + (r.duration_hours || 0), 0),
    packHoursTotal: hourPacks.reduce((s, p) => s + (p.total_hours || 0), 0),
    packHoursRemaining: hourPacks.reduce((s, p) => s + (p.remaining_hours || 0), 0),
  };

  const formatDT = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (!unlocked) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 24, position: 'relative',
      }}>
        <div className="orb orb-blue" style={{ width: 400, height: 400, top: 0, right: '10%', position: 'absolute' }} />
        <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔐</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Panel de Administración</h1>
            <p style={{ fontSize: 14, color: '#5a6492' }}>Ingresá el PIN para acceder</p>
          </div>
          <div style={{ background: 'rgba(20,24,54,0.9)', border: '1px solid #1e2347', borderRadius: 20, padding: '32px 28px' }}>
            {pinError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#ef4444' }}>
                ⚠️ {pinError}
              </div>
            )}
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5a6492', marginBottom: 8 }}>PIN de administrador</label>
            <input
              className="input-dark" type="password" placeholder="••••••••••••"
              value={pin} onChange={e => setPin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && unlock()}
              autoFocus
            />
            <button className="btn-primary" onClick={unlock} style={{ width: '100%', justifyContent: 'center', marginTop: 16, padding: 14 }}>
              🚀 Acceder
            </button>
            <div style={{ marginTop: 16, fontSize: 11, color: '#3a4270', textAlign: 'center' }}>
              PIN demo: <span style={{ color: '#00d99f' }}>envelope2024</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
            ADMIN PANEL
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px' }}>Panel de Control</h1>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem('admin_unlocked'); setUnlocked(false); }}
          className="btn-ghost" style={{ fontSize: 13 }}
        >
          🔒 Cerrar sesión admin
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'Total reservas', value: stats.total, icon: '📅', color: '#00d99f' },
          { label: 'Pendientes', value: stats.pending, icon: '⏳', color: '#f59e0b' },
          { label: 'Confirmadas', value: stats.confirmed, icon: '✅', color: '#0099ff' },
          { label: 'Horas totales', value: `${stats.hours}h`, icon: '⏱️', color: '#a855f7' },
          { label: 'Ingresos est.', value: formatPrice(stats.revenue), icon: '💰', color: '#10b981' },
          { label: 'Hs packs usadas', value: `${stats.packHoursTotal - stats.packHoursRemaining}h`, icon: '✔️', color: '#a855f7' },
          { label: 'Hs packs pendientes', value: `${stats.packHoursRemaining}h`, icon: '🕐', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(20,24,54,0.9)', border: '1px solid #1e2347',
            borderRadius: 14, padding: '16px 20px',
          }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color, letterSpacing: '-0.5px', marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#5a6492' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(20,24,54,0.8)', borderRadius: 12, padding: 4, width: 'fit-content', border: '1px solid #1e2347' }}>
        {[
          { id: 'reservations', label: '📅 Reservas' },
          { id: 'block', label: '🚫 Bloquear Horarios' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))' : 'transparent',
            border: tab === t.id ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
            color: tab === t.id ? '#f59e0b' : 'rgba(255,255,255,0.5)',
            padding: '10px 22px', borderRadius: 9, cursor: 'pointer',
            fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* RESERVATIONS TAB */}
      {tab === 'reservations' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              className="input-dark" placeholder="🔍 Buscar por servicio, código, email..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, maxWidth: 360 }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  background: filter === f ? 'rgba(0,217,159,0.15)' : 'rgba(20,24,54,0.8)',
                  border: filter === f ? '1px solid rgba(0,217,159,0.3)' : '1px solid #1e2347',
                  color: filter === f ? '#00d99f' : '#5a6492',
                  padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                  fontWeight: 600, fontSize: 12, transition: 'all 0.2s',
                }}>
                  {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : f === 'confirmed' ? 'Confirmadas' : 'Canceladas'}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 13, color: '#5a6492' }}>{filtered.length} resultado(s)</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#5a6492', padding: 60 }}>Cargando reservas...</div>
          ) : filtered.length === 0 ? (
            <div style={{
              background: 'rgba(20,24,54,0.5)', border: '1px dashed #1e2347',
              borderRadius: 16, padding: 48, textAlign: 'center', color: '#5a6492',
            }}>
              No hay reservas {filter !== 'all' ? `con estado "${filter}"` : ''}.
            </div>
          ) : (
            <div style={{ background: 'rgba(20,24,54,0.6)', border: '1px solid #1e2347', borderRadius: 16, overflow: 'auto' }}>
              <table className="data-table" style={{ minWidth: 800 }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Servicio</th>
                    <th>Usuario</th>
                    <th>Fecha inicio</th>
                    <th>Duración</th>
                    <th>Código</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th style={{ width: 48 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td style={{ color: '#5a6492', fontSize: 12 }}>#{r.id}</td>
                      <td style={{ fontWeight: 600, maxWidth: 220 }}>
                        <div style={{ fontSize: 13 }}>{r.service_name}</div>
                        {r.notes && (
                          <div style={{ fontSize: 11, color: '#5a6492', marginTop: 2 }} title={r.notes}>
                            {r.notes.slice(0, 40)}{r.notes.length > 40 ? '...' : ''}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 13, color: '#5a6492' }}>
                        {r.name || r.email || (r.user_id ? `User #${r.user_id}` : 'Anónimo')}
                      </td>
                      <td style={{ fontSize: 13, color: '#5a6492', whiteSpace: 'nowrap' }}>
                        {formatDT(r.start_time)}
                      </td>
                      <td style={{ fontSize: 13 }}>{r.duration_hours}h</td>
                      <td>
                        <code style={{ fontSize: 11, color: '#00d99f', background: 'rgba(0,217,159,0.08)', padding: '2px 8px', borderRadius: 4 }}>
                          {r.payment_code}
                        </code>
                      </td>
                      <td style={{ fontWeight: 700, color: '#00d99f' }}>{formatPrice(r.total_price)}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td style={{ position: 'relative' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === r.id ? null : r.id); }}
                          style={{
                            background: 'transparent', border: '1px solid #1e2347',
                            color: '#5a6492', width: 32, height: 32, borderRadius: 8,
                            cursor: 'pointer', fontSize: 16, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}
                        >⋯</button>
                        {openMenu === r.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: 'absolute', right: 0, top: 38, zIndex: 100,
                              background: '#0f1330', border: '1px solid #1e2347',
                              borderRadius: 10, overflow: 'hidden', minWidth: 160,
                              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                            }}
                          >
                            {r.status === 'pending' && (<>
                              <button onClick={() => updateStatus(r.id, 'confirmed')} style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                background: 'transparent', border: 'none', color: '#00d99f',
                                padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                              }}>✓ Confirmar</button>
                              <button onClick={() => updateStatus(r.id, 'cancelled')} style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                background: 'transparent', border: 'none', color: '#ef4444',
                                padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                              }}>✕ Cancelar</button>
                            </>)}
                            {r.status === 'confirmed' && (<>
                              <button onClick={() => updateStatus(r.id, 'completed')} style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                background: 'transparent', border: 'none', color: '#0099ff',
                                padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                              }}>★ Completar</button>
                              <button onClick={() => updateStatus(r.id, 'cancelled')} style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                background: 'transparent', border: 'none', color: '#ef4444',
                                padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                              }}>✕ Cancelar</button>
                            </>)}
                            {(r.status === 'completed' || r.status === 'cancelled') && (
                              <button onClick={() => updateStatus(r.id, 'pending')} style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                background: 'transparent', border: 'none', color: '#5a6492',
                                padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                              }}>↺ Reabrir</button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* BLOCK SLOTS TAB */}
      {tab === 'block' && (
        <div style={{ maxWidth: 560 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Bloquear horarios</h2>
          <p style={{ fontSize: 14, color: '#5a6492', marginBottom: 28 }}>
            Marcá periodos como no disponibles (mantenimiento, eventos privados, etc.)
          </p>

          {blockMsg && (
            <div style={{
              background: 'rgba(0,217,159,0.1)', border: '1px solid rgba(0,217,159,0.3)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#00d99f',
            }}>
              ✅ {blockMsg}
            </div>
          )}

          <div style={{ background: 'rgba(20,24,54,0.9)', border: '1px solid #1e2347', borderRadius: 16, padding: '28px 32px' }}>
            <form onSubmit={blockSlot}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5a6492', marginBottom: 8 }}>
                    Inicio del bloqueo *
                  </label>
                  <input className="input-dark" type="datetime-local"
                    value={blockForm.startTime}
                    onChange={e => setBlockForm(f => ({ ...f, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5a6492', marginBottom: 8 }}>
                    Fin del bloqueo *
                  </label>
                  <input className="input-dark" type="datetime-local"
                    value={blockForm.endTime}
                    onChange={e => setBlockForm(f => ({ ...f, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5a6492', marginBottom: 8 }}>
                  Motivo del bloqueo
                </label>
                <input className="input-dark" type="text"
                  placeholder="Ej: Mantenimiento técnico, evento privado..."
                  value={blockForm.reason}
                  onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14 }}>
                🚫 Bloquear horario
              </button>
            </form>
          </div>

          <div style={{
            marginTop: 24, padding: '20px 24px',
            background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 12, fontSize: 13, color: '#5a6492', lineHeight: 1.7,
          }}>
            ⚠️ Los horarios bloqueados no aparecerán disponibles en el sistema de reservas.
            Usá esta función para mantenimiento, eventos especiales o días no laborables adicionales.
          </div>
        </div>
      )}
    </div>
  );
}
