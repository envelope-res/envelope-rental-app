const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
require('dotenv').config();

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── Database ────────────────────────────────────────────────────────────────

// Railway internal PostgreSQL connections don't use SSL.
// Only enable SSL if explicitly required (e.g. external Postgres URL with sslmode).
const sslConfig = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require')
  ? { rejectUnauthorized: false }
  : false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
});

const dbRun = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return { id: result.rows[0]?.id || null, changes: result.rowCount };
};

const dbGet = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
};

const dbAll = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return result.rows;
};


async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT,
      phone TEXT,
      google_id TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      service_type TEXT,
      service_name TEXT,
      start_time TEXT,
      end_time TEXT,
      duration_hours INTEGER,
      total_price DECIMAL(10,2),
      status TEXT DEFAULT 'pending',
      payment_code TEXT,
      notes TEXT,
      drinks_order TEXT,
      guest_email TEXT,
      pack_id INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS hour_packs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      total_hours INTEGER,
      remaining_hours INTEGER,
      expiry_date TEXT,
      total_price DECIMAL(10,2),
      service_name TEXT,
      payment_code TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      title TEXT,
      description TEXT,
      event_date TEXT,
      location TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS recorded_sets (
      id SERIAL PRIMARY KEY,
      dj_name TEXT,
      title TEXT,
      description TEXT,
      youtube_url TEXT,
      video_length_minutes INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS blocked_slots (
      id SERIAL PRIMARY KEY,
      start_time TEXT,
      end_time TEXT,
      reason TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log('✅ DB lista');
}

pool.connect()
  .then(() => { console.log('DB conectada'); initDB(); })
  .catch(err => console.error('DB Error:', err));

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post('/api/auth/google', async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'Token requerido' });

    const googleRes = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    if (!googleRes.ok) return res.status(401).json({ error: 'Token de Google inválido' });
    const googleUser = await googleRes.json();

    let user = await dbGet('SELECT * FROM users WHERE email = $1', [googleUser.email]);
    if (!user) {
      const result = await dbRun(
        'INSERT INTO users (email, name, google_id, password) VALUES ($1, $2, $3, $4) RETURNING id',
        [googleUser.email, googleUser.name, googleUser.id, '']
      );
      user = { id: result.id, email: googleUser.email, name: googleUser.name };
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error("API Error:", err); res.status(400).json({ error: err.message || err.toString(), code: err.code, detail: err.detail });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await dbRun(
      'INSERT INTO users (email, password, name, phone) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, hashedPassword, name, phone]
    );
    const token = jwt.sign({ id: result.id }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: result.id, email, name } });
  } catch (err) {
    console.error("API Error:", err); res.status(400).json({ error: err.message || err.toString(), code: err.code, detail: err.detail });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await dbGet('SELECT * FROM users WHERE email = $1', [email]);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user.id, email, name: user.name } });
  } catch (err) {
    console.error("API Error:", err); res.status(400).json({ error: err.message || err.toString(), code: err.code, detail: err.detail });
  }
});

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// ─── Reservations ─────────────────────────────────────────────────────────────

app.post('/api/reservations', async (req, res) => {
  try {
    const { userId, serviceType, serviceName, startTime, endTime, durationHours, totalPrice, drinkOrder, guestEmail, notes, packId } = req.body;

    if (packId) {
      const pack = await dbGet('SELECT * FROM hour_packs WHERE id = $1', [packId]);
      if (!pack) return res.status(404).json({ error: 'Pack no encontrado.' });
      if (pack.remaining_hours < durationHours) {
        return res.status(400).json({ error: `Horas insuficientes en el pack. Disponibles: ${pack.remaining_hours}h` });
      }
    }

    if (startTime && endTime) {
      const conflicts = await dbAll(
        `SELECT id FROM reservations
         WHERE status IN ('pending', 'confirmed')
         AND start_time < $1 AND end_time > $2`,
        [endTime, startTime]
      );
      if (conflicts.length > 0) {
        return res.status(409).json({ error: 'Este horario ya está reservado. Por favor elegí otro turno.' });
      }
    }

    const result = await dbRun(
      `INSERT INTO reservations
       (user_id, service_type, service_name, start_time, end_time, duration_hours, total_price, drinks_order, guest_email, notes, status, pack_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', $11)
       RETURNING id`,
      [userId || null, serviceType, serviceName, startTime, endTime, durationHours, totalPrice, drinkOrder || null, guestEmail || null, notes || null, packId || null]
    );

    if (packId) {
      await dbRun('UPDATE hour_packs SET remaining_hours = remaining_hours - $1 WHERE id = $2', [durationHours, packId]);
    }

    const code = `ENV-${new Date().getFullYear()}-${String(result.id).padStart(4, '0')}`;
    await dbRun('UPDATE reservations SET payment_code = $1 WHERE id = $2', [code, result.id]);

    res.json({ id: result.id, paymentCode: code });
  } catch (err) {
    console.error("API Error:", err); res.status(400).json({ error: err.message || err.toString(), code: err.code, detail: err.detail });
  }
});

app.get('/api/reservations', verifyToken, async (req, res) => {
  try {
    const reservations = await dbAll(
      'SELECT * FROM reservations WHERE user_id = $1 ORDER BY start_time DESC',
      [req.userId]
    );
    res.json(reservations);
  } catch (err) {
    console.error("API Error:", err); res.status(400).json({ error: err.message || err.toString(), code: err.code, detail: err.detail });
  }
});

app.get('/api/admin/reservations', async (req, res) => {
  try {
    const reservations = await dbAll(
      'SELECT r.*, u.email, u.name FROM reservations r LEFT JOIN users u ON r.user_id = u.id ORDER BY r.start_time DESC'
    );
    res.json(reservations);
  } catch (err) {
    console.error("API Error:", err); res.status(400).json({ error: err.message || err.toString(), code: err.code, detail: err.detail });
  }
});

// ─── Available Slots ──────────────────────────────────────────────────────────

app.get('/api/available-slots', async (req, res) => {
  try {
    const { date } = req.query;
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    if (dayOfWeek === 0) return res.json([]);
    const isSaturday = dayOfWeek === 6;
    const startHour = isSaturday ? 10 : 17;
    const endHour = isSaturday ? 20 : 22;

    const [booked, blocked] = await Promise.all([
      dbAll(
        `SELECT start_time, end_time FROM reservations
         WHERE start_time LIKE $1 AND status IN ('pending', 'confirmed')`,
        [date + '%']
      ),
      dbAll(
        `SELECT start_time, end_time FROM blocked_slots WHERE start_time LIKE $1`,
        [date + '%']
      ),
    ]);
    const occupied = [...booked, ...blocked];

    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const time = `${date}T${String(hour).padStart(2, '0')}:00:00`;
      const slotEnd = `${date}T${String(hour + 1).padStart(2, '0')}:00:00`;
      const isOccupied = occupied.some(b => b.start_time < slotEnd && b.end_time > time);
      slots.push({ time, available: !isOccupied });
    }

    res.json(slots);
  } catch (err) {
    console.error("API Error:", err); res.status(400).json({ error: err.message || err.toString(), code: err.code, detail: err.detail });
  }
});

// ─── Hour Packs ───────────────────────────────────────────────────────────────

app.post('/api/hour-packs', verifyToken, async (req, res) => {
  try {
    const { hours, price, serviceName, paymentCode } = req.body;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 180);
    const result = await dbRun(
      `INSERT INTO hour_packs (user_id, total_hours, remaining_hours, total_price, expiry_date, service_name, payment_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [req.userId, hours, hours, price, expiryDate.toISOString(), serviceName || null, paymentCode || null]
    );
    res.json({ id: result.id });
  } catch (err) {
    console.error("API Error:", err); res.status(400).json({ error: err.message || err.toString(), code: err.code, detail: err.detail });
  }
});

app.get('/api/hour-packs', verifyToken, async (req, res) => {
  try {
    const packs = await dbAll(
      'SELECT * FROM hour_packs WHERE user_id = $1 ORDER BY expiry_date DESC',
      [req.userId]
    );
    res.json(packs);
  } catch (err) {
    console.error("API Error:", err); res.status(400).json({ error: err.message || err.toString(), code: err.code, detail: err.detail });
  }
});

app.get('/api/admin/hour-packs', async (req, res) => {
  try {
    const packs = await dbAll(
      `SELECT hp.*, u.name, u.email FROM hour_packs hp
       LEFT JOIN users u ON hp.user_id = u.id
       ORDER BY hp.created_at DESC`
    );
    res.json(packs);
  } catch (err) {
    console.error("API Error:", err); res.status(400).json({ error: err.message || err.toString(), code: err.code, detail: err.detail });
  }
});

// ─── Events ───────────────────────────────────────────────────────────────────

app.post('/api/events', verifyToken, async (req, res) => {
  try {
    const { title, description, eventDate, location } = req.body;
    const result = await dbRun(
      `INSERT INTO events (user_id, title, description, event_date, location)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [req.userId, title, description, eventDate, location]
    );
    res.json({ id: result.id });
  } catch (err) {
    console.error("API Error:", err); res.status(400).json({ error: err.message || err.toString(), code: err.code, detail: err.detail });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const events = await dbAll(
      `SELECT e.*, u.name as dj_name FROM events e
       JOIN users u ON e.user_id = u.id
       WHERE e.event_date >= $1
       ORDER BY e.event_date ASC`,
      [today]
    );
    res.json(events);
  } catch (err) {
    console.error("API Error:", err); res.status(400).json({ error: err.message || err.toString(), code: err.code, detail: err.detail });
  }
});

// ─── Recorded Sets ────────────────────────────────────────────────────────────

app.get('/api/recorded-sets', async (req, res) => {
  try {
    const sets = await dbAll('SELECT * FROM recorded_sets ORDER BY created_at DESC');
    res.json(sets);
  } catch (err) {
    console.error("API Error:", err); res.status(400).json({ error: err.message || err.toString(), code: err.code, detail: err.detail });
  }
});

app.post('/api/recorded-sets', async (req, res) => {
  try {
    const { djName, title, description, youtubeUrl, videoLengthMinutes } = req.body;
    const result = await dbRun(
      `INSERT INTO recorded_sets (dj_name, title, description, youtube_url, video_length_minutes)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [djName, title, description, youtubeUrl, videoLengthMinutes]
    );
    res.json({ id: result.id });
  } catch (err) {
    console.error("API Error:", err); res.status(400).json({ error: err.message || err.toString(), code: err.code, detail: err.detail });
  }
});

// ─── Admin ────────────────────────────────────────────────────────────────────

app.patch('/api/admin/reservations/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Estado inválido' });
    const result = await dbRun(
      'UPDATE reservations SET status = $1 WHERE id = $2',
      [status, req.params.id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json({ ok: true });
  } catch (err) {
    console.error("API Error:", err); res.status(400).json({ error: err.message || err.toString(), code: err.code, detail: err.detail });
  }
});

app.post('/api/admin/block-slots', async (req, res) => {
  try {
    const { startTime, endTime, reason } = req.body;
    const result = await dbRun(
      `INSERT INTO blocked_slots (start_time, end_time, reason) VALUES ($1, $2, $3) RETURNING id`,
      [startTime, endTime, reason]
    );
    res.json({ id: result.id });
  } catch (err) {
    console.error("API Error:", err); res.status(400).json({ error: err.message || err.toString(), code: err.code, detail: err.detail });
  }
});

// ─── Mercado Pago ─────────────────────────────────────────────────────────────

const BASE_URL = process.env.APP_URL || 'https://envelope-rental-app-production.up.railway.app';

app.post('/api/mp/preference', async (req, res) => {
  try {
    const { reservationId, price, description, paymentCode } = req.body;

    const preference = new Preference(mp);
    const response = await preference.create({
      body: {
        items: [{
          title: description,
          unit_price: Number(price),
          quantity: 1,
          currency_id: 'ARS',
        }],
        external_reference: String(reservationId),
        statement_descriptor: 'ENVELOPE RENTAL',
        back_urls: {
          success: `${BASE_URL}/reservas/pago-ok`,
          failure: `${BASE_URL}/reservas/pago-error`,
          pending: `${BASE_URL}/reservas/pago-pendiente`,
        },
        auto_return: 'approved',
        notification_url: `${BASE_URL}/api/mp/webhook`,
      }
    });

    res.json({ init_point: response.init_point, id: response.id });
  } catch (err) {
    console.error('MP preference error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/mp/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const { type, data } = req.body;
    if (type === 'payment' && data?.id) {
      const payment = new Payment(mp);
      const paymentData = await payment.get({ id: data.id });

      if (paymentData.status === 'approved') {
        const reservationId = paymentData.external_reference;
        await dbRun(
          `UPDATE reservations SET status = 'confirmed' WHERE id = $1`,
          [reservationId]
        );
        console.log(`✅ Reserva ${reservationId} confirmada via MP`);
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('MP webhook error:', err);
    res.sendStatus(200); // Always 200 to MP
  }
});

// ─── Static ───────────────────────────────────────────────────────────────────

app.use(express.static(path.join(__dirname, '../client/envelope-client/build'), {
  index: false,
}));
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, '../client/envelope-client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});
