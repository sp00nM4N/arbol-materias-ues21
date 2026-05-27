import { useMemo } from 'react';
import { formatMateriaPeriodo } from '../utils/periodos';

const LABELS = {
  aprobada:  'Aprobada',
  cursando:  'Cursando',
  inscripto: 'Inscripto',
  regular:   'Regular',
  disponible:'Disponible',
  bloqueada: 'Bloqueada',
  pendiente: 'Pendiente',
};

export function computeVisualEstado(materia, estadoMap) {
  if (materia.estado !== 'pendiente') return materia.estado;
  if (!materia.correlativas?.length) return 'disponible';
  const allMet = materia.correlativas.every(c => {
    const est = estadoMap[c.correlativa_id];
    return est === 'regular' || est === 'aprobada';
  });
  return allMet ? 'disponible' : 'bloqueada';
}

export default function MateriaCard({ materia, estadoMap, selectedId, onSelect, showNotas = true }) {
  const visual = computeVisualEstado(materia, estadoMap);
  const isSelected = materia.id === selectedId;
  const hasCorrelativas = (materia.correlativas?.length ?? 0) > 0;
  const periodo = formatMateriaPeriodo(materia);

  return (
    <div
      className={`materia-card ${visual}${isSelected ? ' selected-card' : ''}${hasCorrelativas ? ' has-correlativas' : ''}`}
      onClick={() => onSelect(materia.id)}
      title="Clic para ver detalle y editar"
    >
      {hasCorrelativas && (
        <span className="corr-indicator" title={`${materia.correlativas.length} correlativa${materia.correlativas.length > 1 ? 's' : ''}`}>
          ⇄
        </span>
      )}
      <div className="card-name">{materia.nombre}</div>
      <div className="card-meta">
        <span className={`card-badge badge-${visual}`}>{LABELS[visual]}</span>
      </div>
      {periodo && <div className="card-periodo">{periodo}</div>}
      {showNotas && materia.nota != null && (
        <div className="grade-progress">
          <div className="grade-progress__track">
            <div
              className="grade-progress__fill"
              style={{ width: `${Math.max(8, (materia.nota / 10) * 100)}%` }}
            />
          </div>
          <span className="grade-progress__value">{Number(materia.nota).toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}
