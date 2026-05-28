import React, { useState, useEffect } from 'react';
import { eventsAPI, setsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEMO_EVENTS = [
  { id: 1, title: 'Open Deck Night', description: 'Noche abierta para DJs de la comunidad. Todos los géneros bienvenidos.', event_date: '2026-06-15T21:00:00', location: 'Envelope Studio, Villa María', dj_name: 'Comunidad Envelope' },
  { id: 2, title: 'Workshop: Técnicas de Mezcla', description: 'Aprende mezcla avanzada con loops, efectos y performance en vivo.', event_date: '2026-06-22T18:00:00', location: 'Envelope Studio, Villa María', dj_name: 'DJ Marco' },
  { id: 3, title: 'Techno Session Vol.3', description: 'Sesión de techno y minimal con DJs locales e internacionales.', event_date: '2026-07-05T22:00:00', location: 'Villa María, Córdoba', dj_name: 'Collective EEE' },
];

const DEMO_SETS = [
  { id: 1, dj_name: 'DJ Valentina', title: 'Techno Mix Session #12', description: 'Set grabado en Envelope con equipo Pioneer. Techno oscuro.', youtube_url: '', video_length_minutes: 62 },
  { id: 2, dj_name: 'Mateo Beats', title: 'House Grooves Vol.7', description: 'Deep house y afro con ediciones propias.', youtube_url: '', video_length_minutes: 45 },
  { id: 3, dj_name: 'DJ Lucía', title: 'Minimal Loop Session', description: 'Exploración minimalista. Grabado con 2 cámaras en Envelope.', youtube_url: '', video_length_minutes: 90 },
  { id: 4, dj_name: 'Seba Groove', title: 'Back2Back con Nere', description: 'B2B electro y techno de medianoche.', youtube_url: '', video_length_minutes: 120 },
];

function EventCard({ event }) {
  const date = new Date(event.event_date);
  return (
    <div className="glass-card" style={{ padding: 24, display: 'flex', gap: 20 }}>
      {/* Date box */}
      <div style={{
        minWidth: 64, height: 64, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(0,217,159,0.15), rgba(0,153,255,0.1))',
        border: '1px solid rgba(0,217,159,0.3)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#00d99f', lineHeight: 1 }}>
          {date.getDate()}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#5a6492', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {date.toLocaleDateString('es-AR', { month: 'short' })}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#5a6492', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
          {event.dj_name}
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{event.title}</h3>
        <p style={{ fontSize: 13, color: '#5a6492', lineHeight: 1.6, marginBottom: 10 }}>{event.description}</p>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#3a4270' }}>
          <span>📍 {event.location}</span>
          <span>🕐 {date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</span>
        </div>
      </div>
    </div>
  );
}

function SetCard({ set }) {
  const ytId = set.youtube_url?.match(/[?&]v=([^&]+)/)?.[1] || set.youtube_url?.split('/').pop();
  return (
    <div className="glass-card" style={{ overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Thumbnail */}
      <div style={{
        height: 160, background: `linear-gradient(135deg, #0f1535, #141836)`,
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {ytId && (
          <img
            src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
            alt={set.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        )}
        <div style={{
          position: 'absolute', width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(0,217,159,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0,217,159,0.5)',
        }}>
          ▶
        </div>
        <div style={{
          position: 'absolute', bottom: 8, right: 8, fontSize: 11, fontWeight: 600,
          background: 'rgba(0,0,0,0.8)', color: 'white', padding: '3px 8px', borderRadius: 4,
        }}>
          {Math.floor(set.video_length_minutes / 60)}:{String(set.video_length_minutes % 60).padStart(2, '0')}
        </div>
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#00d99f', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {set.dj_name}
        </div>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, lineHeight: 1.4 }}>{set.title}</h3>
        <p style={{ fontSize: 12, color: '#5a6492', lineHeight: 1.6 }}>{set.description}</p>
        <a href={set.youtube_url} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, color: '#00d99f', fontWeight: 600, textDecoration: 'none' }}>
          ▶ Ver en YouTube
        </a>
      </div>
    </div>
  );
}

export default function Community() {
  const { user } = useAuth();
  const [tab, setTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', description: '', eventDate: '', location: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([eventsAPI.getAll(), setsAPI.getAll()])
      .then(([evRes, setRes]) => {
        setEvents(evRes.data.length ? evRes.data : DEMO_EVENTS);
        setSets(setRes.data.length ? setRes.data : DEMO_SETS);
      })
      .catch(() => {
        setEvents(DEMO_EVENTS);
        setSets(DEMO_SETS);
      })
      .finally(() => setLoading(false));
  }, []);

  const submitEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await eventsAPI.create({ ...eventForm });
      setSuccess('¡Evento publicado exitosamente!');
      setShowEventForm(false);
      setEventForm({ title: '', description: '', eventDate: '', location: '' });
      const res = await eventsAPI.getAll();
      setEvents(res.data.length ? res.data : DEMO_EVENTS);
    } catch {
      setSuccess('Evento guardado (demo)');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#00d99f', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
          COMUNIDAD
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }}>
          La escena local vive acá
        </h1>
        <p style={{ fontSize: 15, color: '#5a6492', maxWidth: 500 }}>
          Eventos, sets grabados y la comunidad de DJs de Villa María y toda Córdoba.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 36, background: 'rgba(20,24,54,0.8)', borderRadius: 12, padding: 4, width: 'fit-content', border: '1px solid #1e2347' }}>
        {[
          { id: 'events', label: '📅 Eventos', count: events.length },
          { id: 'sets', label: '🎬 Sets Grabados', count: sets.length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? 'linear-gradient(135deg, #00d99f22, #0099ff22)' : 'transparent',
            border: tab === t.id ? '1px solid rgba(0,217,159,0.3)' : '1px solid transparent',
            color: tab === t.id ? '#00d99f' : 'rgba(255,255,255,0.5)',
            padding: '10px 22px', borderRadius: 9, cursor: 'pointer',
            fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {t.label}
            <span style={{
              background: tab === t.id ? 'rgba(0,217,159,0.2)' : 'rgba(255,255,255,0.08)',
              color: tab === t.id ? '#00d99f' : '#5a6492',
              borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700,
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      {success && (
        <div style={{
          background: 'rgba(0,217,159,0.1)', border: '1px solid rgba(0,217,159,0.3)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#00d99f',
        }}>
          ✅ {success}
        </div>
      )}

      {/* EVENTS TAB */}
      {tab === 'events' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Próximos eventos</h2>
            {user && (
              <button className="btn-primary" onClick={() => setShowEventForm(!showEventForm)} style={{ fontSize: 13, padding: '10px 20px' }}>
                + Publicar evento
              </button>
            )}
          </div>

          {showEventForm && (
            <div style={{
              background: 'rgba(20,24,54,0.9)', border: '1px solid #1e2347',
              borderRadius: 16, padding: 28, marginBottom: 28, animation: 'slideUp 0.3s ease-out',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Publicar nuevo evento</h3>
              <form onSubmit={submitEvent}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5a6492', marginBottom: 6 }}>Nombre del evento</label>
                    <input className="input-dark" placeholder="Open Deck Night" value={eventForm.title}
                      onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5a6492', marginBottom: 6 }}>Fecha y hora</label>
                    <input className="input-dark" type="datetime-local" value={eventForm.eventDate}
                      onChange={e => setEventForm(f => ({ ...f, eventDate: e.target.value }))} required />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5a6492', marginBottom: 6 }}>Ubicación</label>
                  <input className="input-dark" placeholder="Envelope Studio, CABA" value={eventForm.location}
                    onChange={e => setEventForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5a6492', marginBottom: 6 }}>Descripción</label>
                  <textarea className="input-dark" placeholder="Contá de qué trata el evento..." rows={3}
                    value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))}
                    style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="submit" className="btn-primary" disabled={submitting} style={{ opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? 'Publicando...' : '✅ Publicar evento'}
                  </button>
                  <button type="button" className="btn-ghost" onClick={() => setShowEventForm(false)}>Cancelar</button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', color: '#5a6492', padding: 60 }}>Cargando eventos...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {events.map(ev => <EventCard key={ev.id} event={ev} />)}
              {!events.length && (
                <div style={{ textAlign: 'center', color: '#5a6492', padding: 60 }}>
                  No hay eventos próximos. {user ? '¡Sé el primero en publicar!' : ''}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SETS TAB */}
      {tab === 'sets' && (
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Sets grabados en Envelope</h2>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#5a6492', padding: 60 }}>Cargando sets...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {sets.map(s => <SetCard key={s.id} set={s} />)}
            </div>
          )}
          <div style={{
            marginTop: 40, padding: '28px 32px',
            background: 'rgba(0,217,159,0.05)', border: '1px solid rgba(0,217,159,0.2)',
            borderRadius: 16, textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🎬</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>¿Grabaste tu set en Envelope?</h3>
            <p style={{ fontSize: 13, color: '#5a6492', marginBottom: 20 }}>
              Contactanos para publicarlo en la galería y llegar a toda la comunidad.
            </p>
            <a href="mailto:envelope.rental@gmail.com" className="btn-secondary" style={{ fontSize: 13 }}>
              📩 Enviar link del set
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
