import { useMemo } from 'react';
import { AlertTriangle, Calendar, CheckCircle2 } from 'lucide-react';
import {
  buildPredictiveSchedule,
  PERIOD_LABEL,
  PERIOD_DATES,
  PERIOD_END_MONTH,
} from '../utils/predictivo';

function PeriodDot({ status }) {
  return <div className={`pred-dot pred-dot-${status}`} />;
}

function SubjectChip({ m }) {
  if (m.tipo === 'electiva_virtual') {
    return (
      <span className="pred-chip pred-chip-electiva-virtual">
        ★ {m.nombre}
        <span className="pred-chip-period pred-chip-period-electiva" title="Electiva necesaria para completar los 8 créditos requeridos">
          electiva
        </span>
      </span>
    );
  }
  if (m.tipo === 'idioma_grupo') {
    return (
      <span className="pred-chip pred-chip-idioma">
        🌐 {m.nombre}
        <span className="pred-chip-period pred-chip-period-idioma" title="Bloque anual: 1A → 2B">año</span>
      </span>
    );
  }
  if (m.tipo === 'idioma_ongoing') {
    return (
      <span className="pred-chip pred-chip-idioma-ongoing">
        🌐 Idioma en curso
      </span>
    );
  }
  return (
    <span className={`pred-chip pred-chip-${m.tipo}${m._inscripto ? ' pred-chip-inscripto' : ''}`}>
      {m.tipo === 'examen' ? '📝 ' : ''}
      {m.nombre}
      {m._inscripto && (
        <span className="pred-chip-period pred-chip-period-inscripto" title="Ya estás inscripto/a en esta materia">
          inscripto
        </span>
      )}
      {!m._inscripto && m.periodos_dictado && (
        <span
          className="pred-chip-period"
          title={`Solo se dicta en períodos ${m.periodos_dictado} (${m.periodos_dictado === 'A' ? '1A y 2A' : '1B y 2B'})`}
        >
          {m.periodos_dictado}
        </span>
      )}
    </span>
  );
}

export default function PredictiveView({ materias, electivas = [] }) {
  const { schedule, stuck, stuckItems, stats } = useMemo(
    () => buildPredictiveSchedule(materias, electivas),
    [materias, electivas]
  );

  const lastPlanned = [...schedule].reverse().find(s => s.status === 'planned');
  const finishText  = lastPlanned
    ? `${PERIOD_END_MONTH[lastPlanned.period]} ${lastPlanned.year}`
    : null;

  const allDone = stats.totalToSchedule === 0 && !stuck;

  let plannedIdx = 0;

  return (
    <div className="efip-view-root pred-root">

      {/* ── Hero ── */}
      <div className="efip-view-hero">
        <div className="efip-view-hero-left">
          <span className="efip-view-obligatorio pred-hero-badge">ESTIMACIÓN</span>
          <h2 className="efip-view-titulo">Predictivo</h2>
          <p className="efip-view-subtitulo">
            Proyección de finalización basada en el estado actual de la carrera
          </p>
        </div>
        <div className="efip-view-hero-stats">
          <div className="efip-view-stat">
            <strong>{stats.totalToSchedule}</strong>
            <span>Por cursar</span>
          </div>
          <div className="efip-view-stat">
            <strong>{stats.periodsCount}</strong>
            <span>Períodos</span>
          </div>
          <div className="efip-view-stat">
            <strong>{stats.avgPerPeriod}</strong>
            <span>Prom / período</span>
          </div>
          <div className="efip-view-stat">
            <strong className="pred-finish-value">{finishText ?? '—'}</strong>
            <span>Fin estimado</span>
          </div>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="mv-disclaimer">
        <AlertTriangle size={15} strokeWidth={2} className="mv-disclaimer-icon" aria-hidden="true" />
        <div>
          <strong>Estimación orientativa.</strong> Asume máximo 3 materias por período
          (1A: Mar–May · 1B: May–Jul · 2A: Ago–Oct · 2B: Oct–Dic), respeta correlativas
          y restricciones de dictado conocidas. No considera cambios de plan ni
          disponibilidad real de inscripción.
        </div>
      </div>

      {/* ── Carrera completa ── */}
      {allDone && (
        <div className="nd-card pred-done-card">
          <CheckCircle2 size={32} className="pred-done-icon" aria-hidden="true" />
          <p className="pred-done-title">¡Todas las materias completadas!</p>
          <p className="pred-done-sub">No hay materias pendientes por planificar.</p>
        </div>
      )}

      {/* ── Timeline ── */}
      {!allDone && (
        <>
          <div className="efip-view-section-label">
            <Calendar size={13} aria-hidden="true" />
            Cronograma sugerido
          </div>

          <div className="pred-timeline">
            {schedule.map((entry, i) => {
              const isCurrent = entry.status === 'current';
              const isLast    = i === schedule.length - 1;
              if (!isCurrent) plannedIdx++;

              const statusLabel = isCurrent
                ? 'En curso'
                : isLast
                  ? `Período ${plannedIdx} · Fin`
                  : `Período ${plannedIdx}`;

              return (
                <div key={i} className="pred-entry">
                  <div className="pred-gutter">
                    <PeriodDot status={entry.status} />
                    {!isLast && <div className="pred-line" />}
                  </div>

                  <div className="pred-entry-body">
                    <div className="pred-entry-header">
                      <div className="pred-period-id">
                        <span className="pred-year">{entry.year}</span>
                        <span className="pred-sep">·</span>
                        <span
                          className="pred-period-name"
                          title={PERIOD_DATES[entry.period]}
                        >
                          {PERIOD_LABEL[entry.period]}
                        </span>
                        <span className="pred-period-dates">
                          {PERIOD_DATES[entry.period]}
                        </span>
                      </div>
                      <span className={`pred-status-chip pred-status-${entry.status}`}>
                        {statusLabel}
                      </span>
                      <span className="pred-item-count">
                        {entry.items.length}&thinsp;materia{entry.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="pred-chips">
                      {entry.items.map(m => <SubjectChip key={m.id} m={m} />)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Stuck warning ── */}
      {stuck && (
        <div className="nd-card pred-stuck-card">
          <div className="pred-stuck-title">⚠ Materias no planificables</div>
          <p className="efip-view-body-text" style={{ marginBottom: 10 }}>
            Las siguientes materias no pudieron incluirse en la estimación (correlativas no
            resolubles o restricciones de período incompatibles):
          </p>
          {stuckItems.map(m => (
            <div key={m.id} className="pred-stuck-item">{m.nombre}</div>
          ))}
        </div>
      )}

      {/* ── Leyenda ── */}
      <div className="pred-legend">
        <div className="pred-legend-item">
          <PeriodDot status="current" />
          <span>En curso</span>
        </div>
        <div className="pred-legend-item">
          <PeriodDot status="planned" />
          <span>Planificado</span>
        </div>
        <div className="pred-legend-item">
          <span className="pred-chip pred-chip-examen" style={{ fontSize: 11 }}>📝 EFIP</span>
          <span>Examen integrador</span>
        </div>
        <div className="pred-legend-item">
          <span className="pred-chip-period" style={{ display: 'inline-flex' }}>A</span>
          <span>Solo períodos 1A / 2A</span>
        </div>
        <div className="pred-legend-item">
          <span className="pred-chip-period" style={{ display: 'inline-flex', background: '#7C3AED' }}>B</span>
          <span>Solo períodos 1B / 2B</span>
        </div>
      </div>

    </div>
  );
}
