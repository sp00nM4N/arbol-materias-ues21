import {
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  CircleMinus,
  Clock3,
  PencilLine,
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
  pendiente: CircleDashed,
  disponible: CircleDashed,
  cursando: PencilLine,
  bloqueada: CircleMinus,
  regular: Clock3,
};

export default function EstadoIcon({ estado, className = '', size = 21, strokeWidth = 2.6 }) {
  const Icon = ESTADO_ICONS[estado] ?? CircleDashed;
  return (
    <Icon
      className={className}
      size={size}
      strokeWidth={strokeWidth}
      aria-label={ESTADO_LABELS[estado] ?? estado}
    />
  );
}
