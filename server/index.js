const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./envelope.db', (err) => {
  if (err) console.error('DB Error:', err);
  else {
    console.log('DB conectada');
    initDB();
  }
});

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) reject(err);
    else resolve({ id: this.lastID, changes: this.changes });
  });
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

function initDB() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      service_type TEXT,
      service_name TEXT,
      start_time TEXT,
      end_time TEXT,
      duration_hours INTEGER,
      total_price DECIMAL(10,2),
      status TEXT DEFAULT 'pending',
      payment_code TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS hour_packs (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      total_hours INTEGER,
      remaining_hours INTEGER,
      expiry_date TEXT,
      total_price DECIMAL(10,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      title TEXT,
      description TEXT,
      event_date TEXT,
      location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS recorded_sets (
      id INTEGER PRIMARY KEY,
      dj_name TEXT,
      title TEXT,
      description TEXT,
      youtube_url TEXT,
      video_length_minutes INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS blocked_slots (
      id INTEGER PRIMARY KEY,
      start_time TEXT,
      end_time TEXT,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await dbRun(
      'INSERT INTO users (email, password, name, phone) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, phone]
    );
    const token = jwt.sign({ id: result.id }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: result.id, email, name } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user.id, email, name: user.name } });
  } catch (err) {
    res.status(400).json({ error: err.message });
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

app.post('/api/reservations', async (req, res) => {
  try {
    const { userId, serviceType, serviceName, startTime, endTime, durationHours, totalPrice, paymentCode, notes } = req.body;
    const result = await dbRun(
      `INSERT INTO reservations 
       (user_id, service_type, service_name, start_time, end_time, duration_hours, total_price, payment_code, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId || null, serviceType, serviceName, startTime, endTime, durationHours, totalPrice, paymentCode, notes]
    );
    res.json({ id: result.id, paymentCode });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/reservations', verifyToken, async (req, res) => {
  try {
    const reservations = await dbAll(
      'SELECT * FROM reservations WHERE user_id = ? ORDER BY start_time DESC',
      [req.userId]
    );
    res.json(reservations);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/reservations', async (req, res) => {
  try {
    const reservations = await dbAll(
      'SELECT r.*, u.email, u.name FROM reservations r LEFT JOIN users u ON r.user_id = u.id ORDER BY r.start_time DESC'
    );
    res.json(reservations);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/available-slots', async (req, res) => {
  try {
    const { date } = req.query;
    const dayOfWeek = new Date(date).getDay();
    const isSaturday = dayOfWeek === 6;
    const startHour = isSaturday ? 10 : 17;
    const endHour = isSaturday ? 20 : 22;
    
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const time = `${date}T${hour.toString().padStart(2, '0')}:00:00`;
      slots.push({ time, available: true });
    }
    
    res.json(slots);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/hour-packs', async (req, res) => {
  try {
    const { userId, hours, price } = req.body;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const result = await dbRun(
      `INSERT INTO hour_packs (user_id, total_hours, remaining_hours, total_price, expiry_date)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, hours, hours, price, expiryDate.toISOString()]
    );
    res.json({ id: result.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/hour-packs', verifyToken, async (req, res) => {
  try {
    const packs = await dbAll(
      `SELECT * FROM hour_packs WHERE user_id = ? ORDER BY expiry_date DESC`,
      [req.userId]
    );
    res.json(packs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/events', verifyToken, async (req, res) => {
  try {
    const { title, description, eventDate, location } = req.body;
    const result = await dbRun(
      `INSERT INTO events (user_id, title, description, event_date, location)
       VALUES (?, ?, ?, ?, ?)`,
      [req.userId, title, description, eventDate, location]
    );
    res.json({ id: result.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await dbAll(
      `SELECT e.*, u.name as dj_name FROM events e
       JOIN users u ON e.user_id = u.id
       WHERE e.event_date >= datetime('now')
       ORDER BY e.event_date ASC`
    );
    res.json(events);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/recorded-sets', async (req, res) => {
  try {
    const sets = await dbAll('SELECT * FROM recorded_sets ORDER BY created_at DESC');
    res.json(sets);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/recorded-sets', async (req, res) => {
  try {
    const { djName, title, description, youtubeUrl, videoLengthMinutes } = req.body;
    const result = await dbRun(
      `INSERT INTO recorded_sets (dj_name, title, description, youtube_url, video_length_minutes)
       VALUES (?, ?, ?, ?, ?)`,
      [djName, title, description, youtubeUrl, videoLengthMinutes]
    );
    res.json({ id: result.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
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
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/admin/reservations/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Estado inválido' });
    const result = await dbRun(
      'UPDATE reservations SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/block-slots', async (req, res) => {
  try {
    const { startTime, endTime, reason } = req.body;
    const result = await dbRun(
      `INSERT INTO blocked_slots (start_time, end_time, reason)
       VALUES (?, ?, ?)`,
      [startTime, endTime, reason]
    );
    res.json({ id: result.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});