import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Lock,
  LockOpen,
  TimerReset,
} from 'lucide-react';

export const ESTADO_LABELS = {
  aprobada: 'Aprobada',
  cursando: 'Cursando',
  inscripto: 'Inscripto',
  regular: 'Regular',
  disponible: 'Pendiente',
  bloqueada: 'Bloqueada',
  pendiente: 'Pendiente',
};

export const ESTADO_ICONS = {
  aprobada: CheckCircle2,
  inscripto: CalendarDays,
  pendiente: LockOpen,
  disponible: LockOpen,
  cursando: TimerReset,
  bloqueada: Lock,
  regular: Clock3,
};

export default function EstadoIcon({ estado, className = '', size = 16, strokeWidth = 2.6 }) {
  const Icon = ESTADO_ICONS[estado] ?? LockOpen;
  return (
    <Icon
      className={className}
      size={size}
      strokeWidth={strokeWidth}
      aria-label={ESTADO_LABELS[estado] ?? estado}
    />
  );
}
