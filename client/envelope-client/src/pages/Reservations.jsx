import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { SERVICES, formatPrice, reservationsAPI, packsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const DRINK_OPTIONS = ['Nada', 'Agua', 'Gaseosa', 'Cerveza', 'Energizante'];

function Calendar({ selected, onSelect }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [view, setView] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isAvailable = (day) => {
    const date = new Date(year, month, day);
    const dow = date.getDay();
    return dow !== 0 && date >= today;
  };

  const formatDate = (day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const isSelected = (day) => selected === formatDate(day);
  const isToday = (day) => {
    const d = new Date(year, month, day);
    return d.getTime() === today.getTime();
  };
  const isPast = (day) => new Date(year, month, day) < today;

  const prevMonth = () => setView(v => { const d = new Date(v); d.setMonth(d.getMonth() - 1); return d; });
  const nextMonth = () => setView(v => { const d = new Date(v); d.setMonth(d.getMonth() + 1); return d; });

  const canPrev = view > new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div style={{ background: 'rgba(20,24,54,0.9)', border: '1px solid #1e2347', borderRadius: 16, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={prevMonth} disabled={!canPrev} style={{
          background: 'none', border: 'none', color: canPrev ? 'white' : '#3a4270',
          cursor: canPrev ? 'pointer' : 'not-allowed', fontSize: 18, padding: '4px 8px',
        }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 18, padding: '4px 8px' }}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#3a4270', padding: '4px 0' }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const avail = isAvailable(day);
          const sel = isSelected(day);
          const past = isPast(day);
          const tod = isToday(day);
          const sun = new Date(year, month, day).getDay() === 0;
          return (
            <div key={day}
              className={`calendar-day ${sel ? 'selected' : past || sun ? 'disabled' : 'available'} ${tod ? 'today' : ''}`}
              onClick={() => avail && onSelect(formatDate(day))}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 16, fontSize: 11, color: '#5a6492', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: 'linear-gradient(135deg, #00d99f, #0099ff)' }} />
          Seleccionado
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, border: '1px solid rgba(0,217,159,0.5)' }} />
          Hoy
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: '#252a4a' }} />
          No disponible
        </div>
      </div>
    </div>
  );
}

function TimeSlots({ date, duration, onSelect, selected }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    reservationsAPI.getAvailableSlots(date)
      .then(res => setSlots(res.data))
      .catch(() => {
        const dow = new Date(date).getDay();
        const isSat = dow === 6;
        const start = isSat ? 10 : 17;
        const end = isSat ? 20 : 22;
        const generated = [];
        for (let h = start; h < end; h++) {
          generated.push({ time: `${date}T${String(h).padStart(2,'0')}:00:00`, available: true });
        }
        setSlots(generated);
      })
      .finally(() => setLoading(false));
  }, [date]);

  const validSlots = slots.filter((s, i) => {
    if (!s.available) return false;
    const remaining = slots.slice(i).filter(x => x.available).length;
    return remaining >= duration;
  });

  if (loading) return <div style={{ textAlign: 'center', color: '#5a6492', padding: 32 }}>Cargando horarios...</div>;

  if (!slots.length) return (
    <div style={{ textAlign: 'center', color: '#5a6492', padding: 32, fontSize: 14 }}>
      No hay horarios disponibles para esta fecha.
    </div>
  );

  return (
    <div>
      <div style={{ fontSize: 13, color: '#5a6492', marginBottom: 16 }}>
        <span>Horario {new Date(date).getDay() === 6 ? '10:00 – 20:00 hs' : '17:00 – 22:00 hs'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8 }}>
        {slots.map((slot) => {
          const time = slot.time.split('T')[1]?.slice(0, 5);
          const isValid = validSlots.some(s => s.time === slot.time);
          const isSel = selected === slot.time;
          return (
            <div key={slot.time}
              className={`time-slot ${!isValid ? 'unavailable' : ''} ${isSel ? 'selected' : ''}`}
              onClick={() => isValid && onSelect(slot.time)}
            >
              {time} hs
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 12, color: '#3a4270', marginTop: 12 }}>
        * Los slots resaltados tienen disponibilidad para {duration}h continua(s).
      </p>
    </div>
  );
}

const serviceList = Object.values(SERVICES);

// Packs (≥4h) don't need a fixed time slot — user coordinates sessions via WhatsApp
const isPack = (opt) => opt && opt.hours >= 4;

const STEPS = ['Servicio', 'Opción', 'Fecha', 'Hora', 'Datos', 'Confirmación'];

export default function Reservations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // packId in URL means user is booking a session using existing pack hours
  const packIdFromUrl = searchParams.get('packId');

  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [form, setForm] = useState({ name: user?.name || '', phone: '', email: user?.email || '', drink: 'Nada', notes: '' });
  const [booking, setBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showUpsell, setShowUpsell] = useState(false);

  // Pack-session mode: user already owns a pack and wants to schedule a session
  const isPackSession = Boolean(packIdFromUrl);

  // On mount: if user just registered with a pending pack intent, restore it
  useEffect(() => {
    if (!user) return;
    const pending = sessionStorage.getItem('pendingPack');
    if (pending) {
      try {
        const { serviceId, optionId } = JSON.parse(pending);
        sessionStorage.removeItem('pendingPack');
        const svc = SERVICES[serviceId];
        const opt = svc?.options.find(o => o.id === optionId);
        if (svc && opt) {
          setSelectedService(svc);
          setSelectedOption(opt);
          setStep(4);
        }
      } catch (e) { /* ignore */ }
    }
  }, [user]);

  // Pack-session mode: pre-select cabin service and start at step 1 (choose 1h or 2h)
  useEffect(() => {
    if (isPackSession) {
      setSelectedService(SERVICES.cabin);
      setStep(1);
    }
  }, [isPackSession]);

  useEffect(() => {
    if (step === 4 && selectedService?.id === 'cabin' &&
        (selectedOption?.id === 'cabin-1h' || selectedOption?.id === 'cabin-2h')) {
      setShowUpsell(true);
    }
  }, [step]);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const endTime = (startTime, hours) => {
    if (!startTime) return null;
    const d = new Date(startTime);
    d.setHours(d.getHours() + hours);
    return d.toISOString().slice(0, 19);
  };

  const submit = async () => {
    if (!form.name || !form.phone) return setError('Completá nombre y teléfono');
    if (!form.email) return setError('El email es requerido');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Ingresá un email válido');
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        userId: user?.id || null,
        serviceType: selectedService.id,
        serviceName: `${selectedService.name} – ${selectedOption.label}`,
        startTime: (isPack(selectedOption) && !isPackSession) ? null : selectedTime,
        endTime: (isPack(selectedOption) && !isPackSession) ? null : endTime(selectedTime, selectedOption.hours || 1),
        durationHours: selectedOption.hours || 1,
        totalPrice: isPackSession ? 0 : selectedOption.price,
        drinkOrder: form.drink !== 'Nada' ? form.drink : null,
        guestEmail: form.email,
        notes: form.notes || null,
        packId: isPackSession ? Number(packIdFromUrl) : null,
      };
      const res = await reservationsAPI.create(payload);
      const code = res.data.paymentCode;

      // If this was a pack purchase, credit hours to user's account
      if (isPack(selectedOption) && !isPackSession && user) {
        await packsAPI.create({
          hours: selectedOption.hours,
          price: selectedOption.price,
          serviceName: `${selectedService.name} – ${selectedOption.label}`,
          paymentCode: code,
        });
      }

      setBooking({ ...payload, code, userName: form.name, option: selectedOption });
      setStep(5);
    } catch (err) {
      const msg = err.response?.data?.error
        || (err.response ? `Error ${err.response.status}` : err.message)
        || 'Error al crear la reserva. Intentá de nuevo.';
      setError(msg);
      console.error('Reservation error:', err.response?.status, err.response?.data, err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  const reset = () => {
    setStep(0); setSelectedService(null); setSelectedOption(null);
    setSelectedDate(null); setSelectedTime(null); setBooking(null);
    setForm({ name: user?.name || '', phone: '', email: user?.email || '', notes: '' });
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Botón volver — arriba del todo, solo en pasos intermedios */}
      {step > 0 && step < 5 && (
        <button className="btn-back" onClick={() => setStep(step === 4 && isPack(selectedOption) ? 1 : step - 1)}>
          ‹ Volver
        </button>
      )}

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#00d99f', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
          RESERVAS
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>
          Reservar sesión
        </h1>
        <p style={{ fontSize: 14, color: '#5a6492' }}>
          Seguí los pasos para reservar tu slot en Envelope Rental.
        </p>
      </div>

      {/* Stepper — mobile: barra de progreso | desktop: dots */}
      {step < 5 && (
        <>
          {/* Mobile */}
          <div className="flex items-center gap-3 mb-8 md:hidden">
            <div style={{ flex: 1, height: 5, background: '#1e2347', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${(step / 4) * 100}%`,
                background: 'linear-gradient(90deg, #00d99f, #0099ff)',
                borderRadius: 4, transition: 'width 0.35s ease',
              }} />
            </div>
            <span style={{ fontSize: 13, color: '#00d99f', fontWeight: 700, whiteSpace: 'nowrap' }}>
              {step + 1} / 5 · {STEPS[step]}
            </span>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center mb-10">
            {STEPS.slice(0, 5).map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 64 }}>
                  <div className={`step-dot ${i < step ? 'completed' : i === step ? 'active' : 'inactive'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: i === step ? '#00d99f' : '#3a4270', whiteSpace: 'nowrap' }}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 2 && (
                  <div style={{ flex: 1, height: 1, background: i < step ? 'linear-gradient(90deg, #00d99f, #0099ff)' : '#1e2347', margin: '0 8px', minWidth: 20 }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </>
      )}

      {/* STEP 0: Servicio */}
      {step === 0 && (
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>¿Qué servicio necesitás?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {serviceList.map(svc => (
              <div key={svc.id}
                className={`service-card ${selectedService?.id === svc.id ? 'selected' : ''}`}
                onClick={() => { setSelectedService(svc); setSelectedOption(null); setStep(1); }}
              >
                <div style={{ fontSize: 32, marginBottom: 14 }}>{svc.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{svc.name}</h3>
                <p style={{ fontSize: 12, color: '#5a6492', lineHeight: 1.6, marginBottom: 12 }}>{svc.description}</p>
                <div style={{ fontSize: 13, color: svc.color, fontWeight: 700 }}>
                  Desde {formatPrice(svc.options[0].price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: Opción */}
      {step === 1 && selectedService && (
        <div>
          {isPackSession && (
            <div style={{
              background: 'rgba(0,217,159,0.08)', border: '1px solid rgba(0,217,159,0.25)',
              borderRadius: 12, padding: '14px 18px', marginBottom: 24,
              fontSize: 14, color: '#00d99f', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              🎟️ <span><strong>Usando horas de tu pack</strong> — elegí cuánto dura la sesión (se descuenta de tu saldo)</span>
            </div>
          )}
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{selectedService.icon} {selectedService.name}</h2>
          <p style={{ fontSize: 13, color: '#5a6492', marginBottom: 24 }}>
            {isPackSession ? 'Elegí duración de la sesión (1h o 2h):' : 'Elegí la duración o modalidad:'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {(isPackSession
              ? selectedService.options.filter(o => o.hours <= 2)  // pack sessions: 1h or 2h only
              : selectedService.options
            ).map(opt => (
              <div key={opt.id}
                className={`service-card ${selectedOption?.id === opt.id ? 'selected' : ''}`}
                onClick={() => {
                  if (isPack(opt) && !user) {
                    // Save intent and redirect to register
                    sessionStorage.setItem('pendingPack', JSON.stringify({ serviceId: selectedService.id, optionId: opt.id }));
                    navigate('/registro');
                    return;
                  }
                  setSelectedOption(opt);
                  setStep(isPackSession ? 2 : isPack(opt) ? 4 : 2);
                }}
                style={{ padding: 20, position: 'relative' }}
              >
                {/* Badges: etiqueta + descuento */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', minHeight: 20 }}>
                  {opt.badge && (
                    <span style={{
                      background: 'linear-gradient(135deg, #00d99f, #0099ff)',
                      color: 'white', fontSize: 9, fontWeight: 800,
                      padding: '3px 8px', borderRadius: 5, letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>
                      {opt.badge}
                    </span>
                  )}
                  {opt.discount && (
                    <span style={{
                      background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                      color: '#10b981', fontSize: 10, fontWeight: 800,
                      padding: '3px 8px', borderRadius: 5,
                    }}>
                      −{opt.discount}%
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{opt.label}</div>
                {isPackSession ? (
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#00d99f', marginTop: 4 }}>
                    Incluido en tu pack
                  </div>
                ) : (
                  <>
                    <div className="gradient-text" style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px' }}>
                      {formatPrice(opt.price)}
                    </div>
                    <div style={{ fontSize: 11, color: '#5a6492', marginTop: 6 }}>
                      ${(opt.price / opt.hours / 1000).toFixed(0)}k/hora
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Fecha */}
      {step === 2 && (
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Seleccioná una fecha</h2>

          {/* Horarios — línea compacta en mobile, oculta en desktop (lo muestra el sidebar) */}
          <p className="md:hidden" style={{ fontSize: 12, color: '#5a6492', marginBottom: 20 }}>
            Lun–Vie <span style={{ color: '#00d99f' }}>17–22hs</span>
            {' · '}Sáb <span style={{ color: '#00d99f' }}>10–20hs</span>
            {' · '}Dom <span style={{ color: '#ef4444' }}>cerrado</span>
          </p>
          <p className="hidden md:block" style={{ fontSize: 13, color: '#5a6492', marginBottom: 24 }}>
            Seleccioná el día para ver los horarios disponibles.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4 items-start">
            {/* Calendario */}
            <div>
              <Calendar selected={selectedDate} onSelect={(date) => { setSelectedDate(date); setStep(3); }} />
              {/* Fecha seleccionada — solo mobile, debajo del calendario */}
              {selectedDate && (
                <div className="md:hidden" style={{
                  marginTop: 12, padding: '10px 14px',
                  background: 'rgba(0,217,159,0.1)', borderRadius: 10,
                  border: '1px solid rgba(0,217,159,0.2)', fontSize: 13,
                }}>
                  ✅ <span style={{ color: '#00d99f', fontWeight: 700 }}>
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>
              )}
            </div>

            {/* Sidebar — solo desktop */}
            <div className="hidden md:block">
              <div style={{ background: 'rgba(20,24,54,0.9)', border: '1px solid #1e2347', borderRadius: 16, padding: 20 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#5a6492', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Horarios</h4>
                <div style={{ fontSize: 13, lineHeight: 1.8 }}>
                  <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>📅 Lun – Vie</div>
                  <div style={{ color: '#00d99f', fontWeight: 600, marginBottom: 10 }}>17:00 – 22:00 hs</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>📅 Sábados</div>
                  <div style={{ color: '#00d99f', fontWeight: 600, marginBottom: 10 }}>10:00 – 20:00 hs</div>
                  <div style={{ color: '#ef4444' }}>🚫 Domingos cerrado</div>
                </div>
                {selectedDate && (
                  <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(0,217,159,0.1)', borderRadius: 10, border: '1px solid rgba(0,217,159,0.2)', fontSize: 13 }}>
                    ✅ <span style={{ color: '#00d99f', fontWeight: 700 }}>
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* STEP 3: Hora */}
      {step === 3 && (
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Elegí el horario de inicio</h2>
          <p style={{ fontSize: 13, color: '#5a6492', marginBottom: 24 }}>
            {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            {selectedOption && ` · ${selectedOption.label}`}
          </p>
          <TimeSlots
            date={selectedDate}
            duration={selectedOption?.hours || 1}
            onSelect={(time) => { setSelectedTime(time); setStep(4); }}
            selected={selectedTime}
          />
        </div>
      )}

      {/* UPSELL MODAL */}
      {showUpsell && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(5,8,24,0.88)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px',
        }}>
          <div style={{
            background: '#0d1130', border: '1.5px solid #1e2347',
            borderRadius: 20, width: '100%', maxWidth: 460,
            boxShadow: '0 32px 80px rgba(0,0,0,0.7)', animation: 'slideUp 0.3s ease-out',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '24px 24px 20px',
              borderBottom: '1px solid #1e2347',
              background: 'linear-gradient(135deg, rgba(0,217,159,0.06), transparent)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>⚡</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>Mejor precio por hora</span>
              </div>
              <p style={{ fontSize: 13, color: '#5a6492', lineHeight: 1.6, margin: 0 }}>
                Ahora pagás{' '}
                <span style={{ color: 'white', fontWeight: 700 }}>
                  ${(selectedOption?.price / selectedOption?.hours / 1000).toFixed(0)}k/hora
                </span>
                {'. '}Con un pack bajás ese costo y tenés horas para usar en varias sesiones.
              </p>
            </div>

            {/* Pack options */}
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SERVICES.cabin.options.filter(o => ['cabin-4h','cabin-6h','cabin-8h'].includes(o.id)).map(pack => {
                const pricePerHour = Math.round(pack.price / pack.hours);
                return (
                  <button
                    key={pack.id}
                    onClick={() => {
                      if (!user) {
                        sessionStorage.setItem('pendingPack', JSON.stringify({ serviceId: selectedService.id, optionId: pack.id }));
                        navigate('/registro');
                        return;
                      }
                      setSelectedOption(pack);
                      setShowUpsell(false);
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#00d99f'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2347'}
                    style={{
                      background: 'rgba(255,255,255,0.03)', border: '1.5px solid #1e2347',
                      borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                      width: '100%', textAlign: 'left', transition: 'border-color 0.2s',
                    }}
                  >
                    {/* Fila 1: nombre + badge + descuento % */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{pack.label}</span>
                      {pack.badge && (
                        <span style={{
                          fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
                          background: 'linear-gradient(135deg, #00d99f, #0099ff)',
                          color: 'white', padding: '3px 8px', borderRadius: 4,
                          textTransform: 'uppercase',
                        }}>{pack.badge}</span>
                      )}
                      {pack.discount && (
                        <span style={{
                          fontSize: 10, fontWeight: 800,
                          background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                          color: '#10b981', padding: '2px 7px', borderRadius: 4,
                        }}>−{pack.discount}%</span>
                      )}
                    </div>
                    {/* Fila 2: precio/hora + total */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#00d99f', letterSpacing: '-0.5px', lineHeight: 1 }}>
                        {formatPrice(pricePerHour)}
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#5a6492' }}>/hora</span>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 10, color: '#3a4270', marginBottom: 1 }}>Total pack</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{formatPrice(pack.price)}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ padding: '0 24px 24px' }}>
              <button onClick={() => setShowUpsell(false)} style={{
                width: '100%', background: 'transparent', border: '1px solid #1e2347',
                color: '#5a6492', padding: '11px', borderRadius: 10,
                cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'white'}
              onMouseLeave={e => e.currentTarget.style.color = '#5a6492'}
              >
                Continuar con {selectedOption?.label} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Datos */}
      {step === 4 && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6 items-start">

          {/* Summary — arriba en mobile (order-1), derecha en desktop (order-2) */}
          <div className="order-1 md:order-2">
            <div style={{ background: 'rgba(20,24,54,0.9)', border: '1px solid #1e2347', borderRadius: 16, padding: '20px 20px' }} className="md:sticky md:top-20">
              <h4 style={{ fontSize: 11, fontWeight: 700, color: '#5a6492', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Resumen de reserva
              </h4>
              {/* En mobile: layout horizontal compacto en 2 columnas */}
              <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-3">
                {[
                  { label: 'Servicio', value: selectedService?.name },
                  { label: 'Opción', value: selectedOption?.label },
                  !isPack(selectedOption) && { label: 'Fecha', value: selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }) },
                  !isPack(selectedOption) && { label: 'Hora', value: selectedTime?.split('T')[1]?.slice(0, 5) + ' hs' },
                  isPack(selectedOption) && { label: 'Sesiones', value: 'Coordinás por WhatsApp' },
                ].filter(Boolean).map(r => (
                  <div key={r.label}>
                    <div style={{ fontSize: 10, color: '#3a4270', marginBottom: 2 }}>{r.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{r.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #1e2347', marginTop: 16, paddingTop: 16, display: 'flex', alignItems: 'baseline', gap: 12 }} className="md:block">
                <div style={{ fontSize: 11, color: '#5a6492' }} className="md:mb-1">
                  {isPackSession ? 'Costo de la sesión' : 'Total a pagar'}
                </div>
                <div className="gradient-text" style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 }}>
                  {isPackSession ? 'Pack incluido' : selectedOption && formatPrice(selectedOption.price)}
                </div>
                <div style={{ fontSize: 11, color: '#3a4270', marginTop: 4 }} className="hidden md:block">
                  {isPackSession ? `Se descuenta de tu saldo (${selectedOption?.hours}h)` : isPack(selectedOption) ? 'Abonás para confirmar el pack' : 'Se abona al llegar al estudio'}
                </div>
              </div>
            </div>
          </div>

          {/* Formulario — abajo en mobile (order-2), izquierda en desktop (order-1) */}
          <div className="order-2 md:order-1">
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Tus datos de contacto</h2>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#ef4444' }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { name: 'name', label: 'Nombre completo *', type: 'text', placeholder: 'Juan García' },
                { name: 'phone', label: 'Teléfono / WhatsApp *', type: 'tel', placeholder: '+54 353 656-8980' },
                { name: 'email', label: 'Email *', type: 'email', placeholder: 'tu@email.com' },
              ].map(f => (
                <div key={f.name}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
                    {f.label}
                  </label>
                  <input className="input-dark" type={f.type} name={f.name}
                    placeholder={f.placeholder} value={form[f.name]} onChange={handle}
                  />
                </div>
              ))}

              {/* Bebida */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
                  ¿Querés tomar algo? <span style={{ fontSize: 11, color: '#5a6492', fontWeight: 400 }}>(opcional)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DRINK_OPTIONS.map(d => (
                    <button key={d} type="button"
                      onClick={() => setForm(f => ({ ...f, drink: d }))}
                      style={{
                        padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.15s',
                        background: form.drink === d ? 'rgba(0,217,159,0.15)' : 'rgba(20,24,54,0.9)',
                        border: form.drink === d ? '1.5px solid #00d99f' : '1.5px solid #1e2347',
                        color: form.drink === d ? '#00d99f' : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
                  Notas adicionales
                </label>
                <textarea className="input-dark" name="notes" placeholder="Técnica que querés trabajar, nivel, etc."
                  value={form.notes} onChange={handle} rows={3} style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <button className="btn-primary" onClick={submit} disabled={submitting}
              style={{ marginTop: 28, width: '100%', justifyContent: 'center', padding: '16px', fontSize: 15, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Procesando...' : 'Confirmar reserva'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Confirmación */}
      {step === 5 && booking && (
        <div style={{ textAlign: 'center', padding: '60px 0', animation: 'slideUp 0.5s ease-out' }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
          <div style={{
            display: 'inline-block',
            background: 'rgba(0,217,159,0.1)', border: '1px solid rgba(0,217,159,0.3)',
            borderRadius: 12, padding: '8px 20px', fontSize: 13, fontWeight: 700,
            color: '#00d99f', marginBottom: 24,
          }}>
            ¡Reserva confirmada!
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>
            {isPack(booking.option) ? `¡Tu pack está registrado, ${booking.userName}!` : `Nos vemos en el estudio, ${booking.userName}!`}
          </h1>
          <p style={{ fontSize: 15, color: '#5a6492', marginBottom: 40 }}>
            {isPack(booking.option)
              ? 'Coordiná tus sesiones por WhatsApp. Guardá tu código para identificar el pack.'
              : 'Guardá tu código de reserva para presentar al llegar.'}
          </p>

          {/* Booking card */}
          <div style={{
            background: 'rgba(20,24,54,0.9)', border: '1px solid #1e2347',
            borderRadius: 20, textAlign: 'left', maxWidth: 480, width: '100%', margin: '0 auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}>
            {/* Payment banner — hidden for pack sessions (already paid) */}
            {!isPackSession && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(0,217,159,0.12), rgba(0,153,255,0.08))',
                borderBottom: '1px solid rgba(0,217,159,0.2)',
                padding: '20px 28px',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5a6492', letterSpacing: '0.15em', marginBottom: 6 }}>
                  {isPack(booking.option) ? 'TRANSFERÍ EL PAGO PARA ACTIVAR EL PACK' : 'TRANSFERÍ EL PAGO PARA CONFIRMAR'}
                </div>
                <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>
                  Enviá <span style={{ fontWeight: 800, color: 'white' }}>{formatPrice(booking.totalPrice)}</span> al alias:
                </div>
                <div style={{
                  fontSize: 22, fontWeight: 900, color: '#00d99f', letterSpacing: '0.05em',
                  background: 'rgba(0,217,159,0.1)', border: '1px solid rgba(0,217,159,0.3)',
                  borderRadius: 10, padding: '10px 16px', display: 'inline-block', marginBottom: 10,
                }}>
                  envelope.rental
                </div>
                <div style={{ fontSize: 12, color: '#5a6492' }}>
                  En el concepto escribí tu código: <span style={{ color: '#00d99f', fontWeight: 700 }}>{booking.code}</span>
                </div>
              </div>
            )}
            {isPackSession && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(0,217,159,0.12), rgba(0,153,255,0.08))',
                borderBottom: '1px solid rgba(0,217,159,0.2)',
                padding: '20px 28px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{ fontSize: 28 }}>🎟️</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#00d99f', marginBottom: 4 }}>Sesión descontada de tu pack</div>
                  <div style={{ fontSize: 13, color: '#5a6492' }}>
                    {booking.durationHours}h descontadas de tu saldo disponible. Revisalo en tu dashboard.
                  </div>
                </div>
              </div>
            )}

            <div style={{ padding: '20px 28px' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5a6492', letterSpacing: '0.15em', marginBottom: 6 }}>
                  CÓDIGO DE RESERVA
                </div>
                <div style={{
                  fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 900, letterSpacing: '0.15em', color: '#00d99f',
                }}>
                  {booking.code}
                </div>
              </div>
              {[
                { label: 'Servicio', value: booking.serviceName },
                !isPack(booking.option) && { label: 'Inicio', value: formatDateTime(booking.startTime) },
                { label: isPack(booking.option) ? 'Crédito' : 'Duración', value: `${booking.durationHours} hora(s)` },
              ].filter(Boolean).map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1a1f40' }}>
                  <span style={{ fontSize: 12, color: '#5a6492' }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            {isPack(booking.option) ? (
              <>
                <a
                  href={`https://wa.me/543536568980?text=Hola! Compré el ${booking.serviceName} en Envelope Rental. Código: ${booking.code}. Quiero coordinar mis sesiones.`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center', width: '100%', maxWidth: 340, padding: '14px 24px', fontSize: 15 }}
                >
                  Coordinar sesiones por WhatsApp
                </a>
                <button onClick={reset} className="btn-ghost" style={{ maxWidth: 340, width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 15 }}>
                  Volver al inicio
                </button>
              </>
            ) : (
              <>
                <a
                  href={(() => {
                    const fmt = (iso) => iso.replace(/[-:]/g, '').slice(0, 15);
                    const title = encodeURIComponent(`Envelope Rental – ${booking.serviceName}`);
                    const dates = `${fmt(booking.startTime)}/${fmt(booking.endTime)}`;
                    const details = encodeURIComponent(`Código de reserva: ${booking.code}\nAbonar ${formatPrice(booking.totalPrice)} al llegar.\nConsultas: https://wa.me/543536568980`);
                    const location = encodeURIComponent('Villa Nueva, CP 5093 – Córdoba');
                    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
                  })()}
                  target="_blank" rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center', width: '100%', maxWidth: 340, padding: '14px 24px', fontSize: 15 }}
                >
                  Agregar a mi calendario
                </a>
                <a
                  href={`https://wa.me/543536568980?text=Hola! Hice una reserva en Envelope Rental. Código: ${booking.code}. Servicio: ${booking.serviceName}.`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center', width: '100%', maxWidth: 340, padding: '14px 24px', fontSize: 15 }}
                >
                  Confirmar por WhatsApp
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
