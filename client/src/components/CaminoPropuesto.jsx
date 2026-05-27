import { useMemo } from 'react';
import { CalendarDays, Flag, GitBranch, Route, Target } from 'lucide-react';
import { cuatrimestreLabel } from '../utils/cuatrimestres';

const CAPACIDAD = 6;
const ESTADOS_OK = new Set(['regular', 'aprobada']);
const ESTADOS_ACTIVOS = new Set(['inscripto', 'cursando']);

function cumpleCorrelativas(materia, estadoMap) {
  return (materia.correlativas ?? []).every(c => ESTADOS_OK.has(estadoMap[c.correlativa_id]));
}

function desbloqueos(materia, pendientes, estadoMap) {
  const baseOk = new Set(
    pendientes
      .filter(m => m.id !== materia.id && cumpleCorrelativas(m, estadoMap))
      .map(m => m.id)
  );
  const nextMap = { ...estadoMap, [materia.id]: 'regular' };

  return pendientes.filter(m =>
    m.id !== materia.id &&
    !baseOk.has(m.id) &&
    cumpleCorrelativas(m, nextMap)
  );
}

function pesoMateria(materia, pendientes, estadoMap) {
  const unlocks = desbloqueos(materia, pendientes, estadoMap);
  const cuatrimestre = materia.cuatrimestre ?? (materia.tipo === 'ingreso' ? 0 : 99);
  const tipoPeso = materia.tipo === 'ingreso' ? -2 : 0;

  return {
    unlocks,
    score: (unlocks.length * 100) - (cuatrimestre * 8) + tipoPeso,
  };
}

function ordenarCandidatas(a, b, pendientes, estadoMap) {
  const pa = pesoMateria(a, pendientes, estadoMap);
  const pb = pesoMateria(b, pendientes, estadoMap);
  return pb.score - pa.score || (a.cuatrimestre ?? 99) - (b.cuatrimestre ?? 99) || a.id - b.id;
}

function buildCamino(materias, electivas, creditosElectivas) {
  const estadoMap = Object.fromEntries(materias.map(m => [m.id, m.estado]));
  const relevantes = materias.filter(m => ['ingreso', 'obligatoria'].includes(m.tipo));
  const activas = relevantes
    .filter(m => ESTADOS_ACTIVOS.has(m.estado))
    .sort((a, b) => (a.cuatrimestre ?? 0) - (b.cuatrimestre ?? 0) || a.id - b.id);
  const finales = materias
    .filter(m => m.estado === 'regular')
    .sort((a, b) => (a.cuatrimestre ?? 0) - (b.cuatrimestre ?? 0) || a.id - b.id);

  for (const m of activas) estadoMap[m.id] = 'regular';

  let pendientes = relevantes
    .filter(m => m.estado === 'pendiente')
    .sort((a, b) => (a.cuatrimestre ?? 0) - (b.cuatrimestre ?? 0) || a.id - b.id);

  const etapas = [];
  let guard = 0;

  while (pendientes.length > 0 && guard < 16) {
    guard += 1;
    const disponibles = pendientes
      .filter(m => cumpleCorrelativas(m, estadoMap))
      .sort((a, b) => ordenarCandidatas(a, b, pendientes, estadoMap));

    if (disponibles.length === 0) break;

    const seleccionadas = disponibles.slice(0, CAPACIDAD);
    const ids = new Set(seleccionadas.map(m => m.id));
    const unlockMap = Object.fromEntries(
      seleccionadas.map(m => [m.id, pesoMateria(m, pendientes, estadoMap).unlocks])
    );

    etapas.push({
      nombre: `Tramo ${etapas.length + 1}`,
      materias: seleccionadas,
      unlockMap,
    });

    for (const m of seleccionadas) estadoMap[m.id] = 'regular';
    pendientes = pendientes.filter(m => !ids.has(m.id));
  }

  const efip1 = materias.find(m => m.id === 50);
  const efip2 = materias.find(m => m.id === 51);
  const efip1Ok = efip1 && cumpleCorrelativas(efip1, estadoMap);
  const efip2Ok = efip2 && cumpleCorrelativas(efip2, estadoMap) && (creditosElectivas ?? 0) >= 8;
  const faltanElectivas = Math.max(0, 8 - (creditosElectivas ?? 0));
  const avance = relevantes.filter(m => ['aprobada', 'regular', 'cursando', 'inscripto'].includes(m.estado)).length;

  return {
    activas,
    finales,
    etapas,
    bloqueadas: pendientes,
    efip1,
    efip2,
    efip1Ok,
    efip2Ok,
    faltanElectivas,
    electivasPendientes: electivas.filter(e => e.estado !== 'aprobada'),
    modo: avance === 0 ? 'desde cero' : 'avanzado',
  };
}

function EstadoPill({ children, className = '' }) {
  return <span className={`camino-pill ${className}`}>{children}</span>;
}

function MateriaMini({ materia, unlocks = [], onSelect }) {
  return (
    <button className="camino-materia" type="button" onClick={() => onSelect?.(materia.id)}>
      <span className="camino-materia-title">{materia.nombre}</span>
      <span className="camino-materia-meta">
        {cuatrimestreLabel(materia.cuatrimestre)}
        {unlocks.length > 0 && <strong>{unlocks.length} desbloquea</strong>}
      </span>
    </button>
  );
}

export default function CaminoPropuesto({ materias, electivas, creditosElectivas, onSelect }) {
  const camino = useMemo(
    () => buildCamino(materias, electivas, creditosElectivas),
    [materias, electivas, creditosElectivas]
  );

  const totalPlan = camino.etapas.reduce((sum, etapa) => sum + etapa.materias.length, 0);

  return (
    <section className="camino-root">
      <div className="camino-header">
        <div>
          <div className="camino-kicker">
            <Route size={16} strokeWidth={2.4} aria-hidden="true" />
            Camino propuesto
          </div>
          <h2>Secuencia sugerida para optimizar correlativas</h2>
        </div>
        <div className="camino-header-meta">
          <EstadoPill>{camino.modo}</EstadoPill>
          <EstadoPill>{CAPACIDAD} materias max.</EstadoPill>
          <EstadoPill>{totalPlan} pendientes planificadas</EstadoPill>
        </div>
      </div>

      <div className="camino-disclaimer">
        Este recorrido no es obligatorio: es una sugerencia para priorizar materias, destrabar correlativas y ordenar el estudio con el estado actual de tu carrera.
      </div>

      {(camino.activas.length > 0 || camino.finales.length > 0) && (
        <div className="camino-now">
          {camino.activas.length > 0 && (
            <div className="camino-now-block">
              <div className="camino-block-title">
                <CalendarDays size={15} aria-hidden="true" />
                En curso o inscriptas
              </div>
              <div className="camino-chip-list">
                {camino.activas.map(m => <EstadoPill key={m.id} className="camino-pill-active">{m.nombre}</EstadoPill>)}
              </div>
            </div>
          )}
          {camino.finales.length > 0 && (
            <div className="camino-now-block">
              <div className="camino-block-title">
                <Target size={15} aria-hidden="true" />
                Finales para cerrar
              </div>
              <div className="camino-chip-list">
                {camino.finales.map(m => <EstadoPill key={m.id} className="camino-pill-final">{m.nombre}</EstadoPill>)}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="camino-board" style={{ '--camino-cols': Math.max(1, camino.etapas.length) }}>
        {camino.etapas.map((etapa, index) => (
          <article key={etapa.nombre} className="camino-stage">
            <div className="camino-stage-head">
              <span>{etapa.nombre}</span>
              <small>{index === 0 ? 'próxima carga' : 'después de regularizar'}</small>
            </div>
            <div className="camino-stage-body">
              {etapa.materias.map(m => (
                <MateriaMini
                  key={m.id}
                  materia={m}
                  unlocks={etapa.unlockMap[m.id]}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="camino-milestones">
        <div className={`camino-milestone ${camino.efip1Ok ? 'ok' : ''}`}>
          <Flag size={18} aria-hidden="true" />
          <div>
            <strong>EFIP I</strong>
            <span>{camino.efip1?.estado === 'aprobada' ? 'aprobado' : camino.efip1Ok ? 'queda disponible en este camino' : 'requiere completar sus correlativas'}</span>
          </div>
        </div>
        <div className={`camino-milestone ${camino.faltanElectivas === 0 ? 'ok' : ''}`}>
          <GitBranch size={18} aria-hidden="true" />
          <div>
            <strong>Electivas</strong>
            <span>{camino.faltanElectivas === 0 ? '8 créditos cubiertos' : `faltan ${camino.faltanElectivas} créditos para EFIP II`}</span>
          </div>
        </div>
        <div className={`camino-milestone ${camino.efip2Ok ? 'ok' : ''}`}>
          <Flag size={18} aria-hidden="true" />
          <div>
            <strong>EFIP II</strong>
            <span>{camino.efip2?.estado === 'aprobada' ? 'aprobado' : camino.efip2Ok ? 'queda disponible al cierre' : 'depende de correlativas y electivas'}</span>
          </div>
        </div>
      </div>

      {camino.bloqueadas.length > 0 && (
        <div className="camino-blocked">
          <strong>Sin ubicar todavía:</strong>
          <span>{camino.bloqueadas.map(m => m.nombre).join(', ')}</span>
        </div>
      )}
    </section>
  );
}
