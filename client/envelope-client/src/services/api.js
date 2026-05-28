import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? ''  // same origin in production (Express serves the build)
    : `http://${window.location.hostname}:5000`,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('envelope_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('envelope_token');
      localStorage.removeItem('envelope_user');
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
};

export const reservationsAPI = {
  create: (data) => api.post('/api/reservations', data),
  getMine: () => api.get('/api/reservations'),
  getAll: () => api.get('/api/admin/reservations'),
  getAvailableSlots: (date) => api.get(`/api/available-slots?date=${date}`),
};

export const eventsAPI = {
  getAll: () => api.get('/api/events'),
  create: (data) => api.post('/api/events', data),
};

export const setsAPI = {
  getAll: () => api.get('/api/recorded-sets'),
  create: (data) => api.post('/api/recorded-sets', data),
};

export const adminAPI = {
  blockSlot: (data) => api.post('/api/admin/block-slots', data),
  getAllReservations: () => api.get('/api/admin/reservations'),
  updateStatus: (id, status) => api.patch(`/api/admin/reservations/${id}/status`, { status }),
  getHourPacks: () => api.get('/api/admin/hour-packs'),
};

export const packsAPI = {
  getMine: () => api.get('/api/hour-packs'),
  // data: { hours, price, serviceName, paymentCode }
  create: (data) => api.post('/api/hour-packs', data),
};

export const formatPrice = (price) =>
  `$${Number(price).toLocaleString('es-CL')}`;

export const SERVICES = {
  cabin: {
    id: 'cabin',
    name: 'Cabina Práctica DJ',
    icon: '🎧',
    description: 'Espacio profesional equipado con 2× Pioneer CDJ-3000, DJM-A9 y monitores JBL 305p MKII',
    color: '#00d99f',
    options: [
      { id: 'cabin-1h', label: '1 hora',        hours: 1, price:  20000 },
      { id: 'cabin-2h', label: '2 horas',        hours: 2, price:  36000, discount: 10 },
      { id: 'cabin-4h', label: 'Pack 4 horas',   hours: 4, price:  68000, discount: 15, badge: 'Popular' },
      { id: 'cabin-6h', label: 'Pack 6 horas',   hours: 6, price:  96000, discount: 20 },
      { id: 'cabin-8h', label: 'Pack 8 horas',   hours: 8, price: 120000, discount: 25, badge: 'Mejor valor' },
    ],
  },
  video: {
    id: 'video',
    name: 'Grabación Video DJ',
    icon: '🎬',
    description: 'Graba tu set con 2× DJI Action 5 Pro en producción profesional multi-cámara',
    color: '#0099ff',
    options: [
      { id: 'video-1cam', label: '1 cámara · 1h', hours: 1, price: 70000 },
      { id: 'video-2cam', label: '2 cámaras · 1h', hours: 1, price: 90000, badge: 'Recomendado' },
    ],
  },
  classes: {
    id: 'classes',
    name: 'Clases DJ 1:1',
    icon: '🎓',
    description: 'Aprende con instructores profesionales en sesiones personalizadas',
    color: '#a855f7',
    options: [
      { id: 'class-1h', label: '1 hora', hours: 1, price: 30000 },
      { id: 'class-4h', label: 'Pack 4 clases', hours: 4, price: 100000, badge: 'Ahorrás $20k' },
    ],
  },
};

export default api;
