import { useMemo } from 'react';

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

export default function MateriaCard({ materia, estadoMap, selectedId, onSelect }) {
  const visual = computeVisualEstado(materia, estadoMap);
  const isSelected = materia.id === selectedId;
  const hasCorrelativas = (materia.correlativas?.length ?? 0) > 0;

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
        {materia.nota && <span className="card-nota">{materia.nota}</span>}
      </div>
      {materia.periodo && <div className="card-periodo">{materia.periodo}</div>}
    </div>
  );
}
