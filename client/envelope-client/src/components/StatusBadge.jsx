import React from 'react';

const STATUS_MAP = {
  pending:   { label: 'Pendiente',  cls: 'badge-pending' },
  confirmed: { label: 'Confirmada', cls: 'badge-confirmed' },
  cancelled: { label: 'Cancelada',  cls: 'badge-cancelled' },
  completed: { label: 'Completada', cls: 'badge-completed' },
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
