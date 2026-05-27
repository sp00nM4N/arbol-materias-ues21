import { useMemo } from 'react';
import MateriaCard from './MateriaCard';
import { cuatrimestreLabel } from '../utils/cuatrimestres';
import { formatMateriaPeriodo } from '../utils/periodos';

const YEARS = [1, 2, 3, 4];
const CUATRIMESTRE_PAIRS = [[1,2],[3,4],[5,6],[7,8]];

// ─── EFIP card ────────────────────────────────────────────────────────────────

const EFIP_INFO = {
  50: {
    titulo:    'EFIP I',
    subtitulo: 'Examen Final Integrador Parcial — al completar el 3° año',
    descripcion: 'Evalúa los contenidos troncales del 1° al 6° cuatrimestre. Incluye instancia escrita y oral, ambas obligatorias.',
    icon: '📝',
    getRequisitos: (efip, materias) => getCorrelativaReqs(efip, materias),
  },
  51: {
    titulo:    'EFIP II',
    subtitulo: 'Examen Final Integrador Total — al completar la carrera',
    descripcion: 'Evalúa los contenidos del 7° y 8° cuatrimestre. Requisito para obtener el título de grado.',
    icon: '🎓',
    getRequisitos: (efip, materias, creditos) => {
      const electivasOk = (creditos ?? 0) >= 8;
      return [
        ...getCorrelativaReqs(efip, materias),
        {
          label: '8 créditos de electivas aprobados',
          detail: `${creditos ?? 0} / 8`,
          ok: electivasOk,
        },
      ];
    },
  },
};

const ESTADO_LABELS = {
  pendiente: 'Pendiente', inscripto: 'Inscripto', cursando: 'Cursando',
  regular: 'Regular', aprobada: 'Aprobada',
};

function getCorrelativaReqs(efip, materias) {
  const materiaMap = Object.fromEntries(materias.map(m => [m.id, m]));
  return (efip.correlativas ?? []).map(c => {
    const correlativa = materiaMap[c.correlativa_id];
    const estado = correlativa?.estado ?? 'pendiente';
    return {
      label: correlativa?.nombre ?? `#${c.correlativa_id}`,
      detail: ESTADO_LABELS[estado] ?? estado,
      ok: ['regular', 'aprobada'].includes(estado),
    };
  });
}

function EfipCard({ efip, materias, creditosElectivas, selectedId, onSelect }) {
  const info = EFIP_INFO[efip.id];
  if (!info) return null;

  const reqs = info.getRequisitos(efip, materias, creditosElectivas);
  const allMet = reqs.every(r => r.ok);

  // Visual estado: if stored estado !== pendiente show it; else compute disponible/bloqueada
  let visual = efip.estado;
  if (efip.estado === 'pendiente') {
    visual = allMet ? 'disponible' : 'bloqueada';
  }

  const metCount = reqs.filter(r => r.ok).length;
  const isSelected = efip.id === selectedId;

  return (
    <div
      className={`efip-card efip-card-${visual}${isSelected ? ' selected-card' : ''}`}
      onClick={() => onSelect(efip.id)}
    >
      <div className="efip-icon-col">{info.icon}</div>
      <div className="efip-body">
        <div className="efip-header-row">
          <div>
            <span className="efip-titulo">{info.titulo}</span>
            <span className="efip-subtitulo">{info.subtitulo}</span>
          </div>
          <span className={`card-badge badge-${visual}`}>
            {visual === 'disponible' ? 'Disponible' :
             visual === 'aprobada'   ? 'Aprobado'   :
             visual === 'inscripto'  ? 'Inscripto'  :
             visual === 'bloqueada'  ? 'Bloqueado'  : 'Pendiente'}
          </span>
        </div>
        <p className="efip-desc">{info.descripcion}</p>
        <div className="efip-reqs-row">
          {reqs.map((r, i) => (
            <span key={i} className={`efip-req-chip ${r.ok ? 'ok' : 'nok'}`}>
              {r.ok ? '✓' : '✗'} {r.label}: <strong>{r.detail}</strong>
            </span>
          ))}
        </div>
        {formatMateriaPeriodo(efip) && (
          <div style={{ fontSize: '.7rem', color: '#64748b', marginTop: 4 }}>
            Período: {formatMateriaPeriodo(efip)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main grid ────────────────────────────────────────────────────────────────

const ESTADO_LABELS_E = {
  aprobada:'Aprobada', cursando:'Cursando', inscripto:'Inscripto',
  regular:'Regular', pendiente:'Pendiente',
};

function ElectivaCard({ electiva, onEdit }) {
  return (
    <div
      className={`electiva-grid-card estado-${electiva.estado}`}
      onClick={() => onEdit?.(electiva)}
      title="Editar electiva"
      role={onEdit ? 'button' : undefined}
      tabIndex={onEdit ? 0 : undefined}
      onKeyDown={e => {
        if (!onEdit) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit(electiva);
        }
      }}
    >
      <div className="electiva-grid-badge">Electiva</div>
      <div className="electiva-grid-nombre">{electiva.nombre}</div>
      <div className="electiva-grid-meta">
        <span className={`card-badge badge-${electiva.estado}`}>{ESTADO_LABELS_E[electiva.estado] ?? electiva.estado}</span>
        {electiva.creditos != null && <span className="card-nota">{electiva.creditos} cr.</span>}
        {electiva.periodo && <span className="card-periodo">{electiva.periodo}</span>}
      </div>
    </div>
  );
}

export default function MateriasGrid({ materias, electivas = [], selectedId, onSelect, onEditElectiva, creditosElectivas, showNotas = true }) {
  const estadoMap = useMemo(
    () => Object.fromEntries(materias.map(m => [m.id, m.estado])),
    [materias]
  );

  // IDs de materias que son prerrequisito de al menos otra
  const desbloqueasSet = useMemo(() => {
    const set = new Set();
    for (const m of materias) {
      for (const c of (m.correlativas ?? [])) set.add(c.correlativa_id);
    }
    return set;
  }, [materias]);

  const byCuatrimestre = useMemo(() => {
    const map = {};
    for (const m of materias) {
      if (m.tipo === 'obligatoria' && m.cuatrimestre) {
        if (!map[m.cuatrimestre]) map[m.cuatrimestre] = [];
        map[m.cuatrimestre].push(m);
      }
    }
    return map;
  }, [materias]);

  const electivasByCuatrimestre = useMemo(() => {
    const map = {};
    for (const e of electivas) {
      if (e.cuatrimestre) {
        if (!map[e.cuatrimestre]) map[e.cuatrimestre] = [];
        map[e.cuatrimestre].push(e);
      }
    }
    return map;
  }, [electivas]);

  const ingresoMaterias = useMemo(
    () => materias.filter(m => m.tipo === 'ingreso'),
    [materias]
  );
  const requisitos = useMemo(
    () => materias.filter(m => m.tipo === 'requisito'),
    [materias]
  );
  const efip1 = useMemo(() => materias.find(m => m.id === 50), [materias]);
  const efip2 = useMemo(() => materias.find(m => m.id === 51), [materias]);

  return (
    <div>
      {/* ── Materias de ingreso ── */}
      {ingresoMaterias.length > 0 && (
        <div className="year-section">
          <div className="year-label" style={{ color: '#7c3aed' }}>Materias de ingreso</div>
          <div className="ingreso-panel">
            <div className="ingreso-panel-title">Universitarios 21 — programa de ingreso</div>
            {ingresoMaterias.map(m => (
              <div key={m.id} className="ingreso-card-wrap">
                <MateriaCard
                  materia={m}
                  estadoMap={estadoMap}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  desbloquea={desbloqueasSet.has(m.id)}
                  showNotas={showNotas}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Años 1–4 con EFIPs intercalados ── */}
      {YEARS.map((anio, yi) => {
        const [c1, c2] = CUATRIMESTRE_PAIRS[yi];
        return (
          <div key={anio}>
            <div className="year-section">
              <div className="year-label">{anio}° Año</div>
              <div className="cuatrimestres-row">
                {[c1, c2].map(c => (
                  <div key={c} className="cuatrimestre-col">
                    <div className="cuatrimestre-title">{cuatrimestreLabel(c)}</div>
                    <div className="materias-list">
                      {(byCuatrimestre[c] || []).map(m => (
                        <MateriaCard
                          key={m.id}
                          materia={m}
                          estadoMap={estadoMap}
                          selectedId={selectedId}
                          onSelect={onSelect}
                          desbloquea={desbloqueasSet.has(m.id)}
                          showNotas={showNotas}
                        />
                      ))}
                      {(electivasByCuatrimestre[c] || []).map(e => (
                        <ElectivaCard key={`e-${e.id}`} electiva={e} onEdit={onEditElectiva} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EFIP I después del 3° año */}
            {anio === 3 && efip1 && (
              <div className="year-section">
                <div className="year-label" style={{ color: '#0891b2' }}>Examen integrador — fin del 3° año</div>
                <EfipCard
                  efip={efip1}
                  materias={materias}
                  creditosElectivas={creditosElectivas}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  showNotas={showNotas}
                />
              </div>
            )}

            {/* EFIP II después del 4° año */}
            {anio === 4 && efip2 && (
              <div className="year-section">
                <div className="year-label" style={{ color: '#7c3aed' }}>Examen integrador — cierre de carrera</div>
                <EfipCard
                  efip={efip2}
                  materias={materias}
                  creditosElectivas={creditosElectivas}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* ── Requisitos especiales ── */}
      {requisitos.length > 0 && (
        <div className="year-section requisitos-section">
          <div className="year-label">Otros requisitos</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {requisitos.map(m => (
              <div key={m.id} style={{ flex: '1 1 260px' }}>
                <MateriaCard
                  materia={m}
                  estadoMap={estadoMap}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  desbloquea={desbloqueasSet.has(m.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
