import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { mpAPI } from '../services/api';

function usePollingReservation(id, enabled) {
  const [reservation, setReservation] = useState(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!id || !enabled) return;
    const poll = async () => {
      try {
        const res = await mpAPI.getReservation(id);
        if (res.data.status === 'confirmed') {
          setReservation(res.data);
        } else if (attempts < 10) {
          setTimeout(() => setAttempts(a => a + 1), 2000);
        }
      } catch {}
    };
    poll();
  }, [id, attempts, enabled]);

  return reservation;
}

export function PaymentSuccess() {
  const [params] = useSearchParams();
  const reservationId = params.get('external_reference');
  const reservation = usePollingReservation(reservationId, true);

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>¡Pago exitoso!</h1>
        <p style={{ fontSize: 15, color: '#5a6492', marginBottom: 36 }}>
          Tu reserva fue confirmada. Guardá tu código para presentar al llegar.
        </p>

        {reservation ? (
          <div style={{
            background: 'rgba(20,24,54,0.9)', border: '1px solid rgba(0,217,159,0.3)',
            borderRadius: 20, padding: '28px 32px', marginBottom: 28,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#5a6492', letterSpacing: '0.15em', marginBottom: 12 }}>
              CÓDIGO DE RESERVA
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#00d99f', letterSpacing: '0.1em', marginBottom: 20 }}>
              {reservation.payment_code}
            </div>
            <div style={{ borderTop: '1px solid #1e2347', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#5a6492' }}>Servicio</span>
                <span style={{ fontWeight: 600 }}>{reservation.service_name}</span>
              </div>
              {reservation.start_time && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#5a6492' }}>Fecha</span>
                  <span style={{ fontWeight: 600 }}>
                    {new Date(reservation.start_time).toLocaleString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#5a6492' }}>Duración</span>
                <span style={{ fontWeight: 600 }}>{reservation.duration_hours}h</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(20,24,54,0.6)', border: '1px solid #1e2347',
            borderRadius: 16, padding: 28, marginBottom: 28, color: '#5a6492', fontSize: 14,
          }}>
            <div style={{ marginBottom: 8 }}>⏳ Confirmando tu reserva...</div>
            <div style={{ fontSize: 12 }}>Esto puede demorar unos segundos.</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none', padding: '14px 32px', fontSize: 15 }}>
            Ver mis reservas
          </Link>
          <Link to="/" style={{ color: '#5a6492', fontSize: 13, textDecoration: 'none' }}>Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}

export function PaymentError() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 24 }}>❌</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>El pago no se completó</h1>
        <p style={{ fontSize: 15, color: '#5a6492', marginBottom: 36 }}>
          No se realizó ningún cobro. Podés intentarlo de nuevo.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Link to="/reservas" className="btn-primary" style={{ textDecoration: 'none', padding: '14px 32px', fontSize: 15 }}>
            Intentar de nuevo
          </Link>
          <Link to="/" style={{ color: '#5a6492', fontSize: 13, textDecoration: 'none' }}>Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}

export function PaymentPending() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 24 }}>⏳</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Pago en proceso</h1>
        <p style={{ fontSize: 15, color: '#5a6492', marginBottom: 36 }}>
          Tu pago está siendo procesado. Te avisaremos cuando se confirme. Revisá tu email o el dashboard.
        </p>
        <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none', padding: '14px 32px', fontSize: 15 }}>
          Ver mis reservas
        </Link>
      </div>
    </div>
  );
}
