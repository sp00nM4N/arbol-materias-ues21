import { useMemo } from 'react';
import { cuatrimestreLabel } from '../utils/cuatrimestres';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function prereqsMet(m, map) {
  if (!m.correlativas?.length) return true;
  return m.correlativas.every(c => ['regular', 'aprobada'].includes(map[c.correlativa_id]));
}

function computeEfipDisponible(efipId, materias, creditosElectivas) {
  const map = Object.fromEntries(materias.map(m => [m.id, m.estado]));
  const efip = materias.find(m => m.id === efipId);
  const correlativasOk = (efip?.correlativas ?? []).every(c =>
    ['regular', 'aprobada'].includes(map[c.correlativa_id])
  );
  const creditosOk = efipId !== 51 || (creditosElectivas ?? 0) >= 8;
  return correlativasOk && creditosOk;
}

// Simula el próximo cuatrimestre: cursando/inscripto → regular,
// y para cada materia disponible calcula qué desbloquearía si se cursa.
function buildPlanning(materias) {
  const currentMap = Object.fromEntries(materias.map(m => [m.id, m.estado]));

  const nextMap = { ...currentMap };
  for (const m of materias) {
    if (m.estado === 'cursando' || m.estado === 'inscripto') nextMap[m.id] = 'regular';
  }

  const proximas = materias.filter(m =>
    m.tipo === 'obligatoria' && m.estado === 'pendiente' && prereqsMet(m, nextMap)
  );

  const items = proximas.map(D => {
    const withD = { ...nextMap, [D.id]: 'regular' };
    const desbloquea = materias
      .filter(m =>
        m.tipo === 'obligatoria' && m.estado === 'pendiente' && m.id !== D.id &&
        !prereqsMet(m, nextMap) && prereqsMet(m, withD)
      )
      .sort((a, b) => (a.cuatrimestre ?? 99) - (b.cuatrimestre ?? 99));
    return { materia: D, desbloquea, critica: desbloquea.length > 0 };
  });

  items.sort((a, b) => {
    if (a.critica !== b.critica) return a.critica ? -1 : 1;
    const minA = a.critica ? Math.min(...a.desbloquea.map(m => m.cuatrimestre ?? 99)) : 99;
    const minB = b.critica ? Math.min(...b.desbloquea.map(m => m.cuatrimestre ?? 99)) : 99;
    return minA - minB || (a.materia.cuatrimestre ?? 99) - (b.materia.cuatrimestre ?? 99);
  });

  return {
    criticas:   items.filter(i => i.critica),
    diferibles: items.filter(i => !i.critica),
    total:      proximas.length,
  };
}

const CAP = 6; // materias por cuatrimestre

// ─── Component ────────────────────────────────────────────────────────────────

export default function AlertasPanel({ materias, electivas = [], creditosElectivas, compact = false }) {
  const currentMap = useMemo(
    () => Object.fromEntries(materias.map(m => [m.id, m.estado])),
    [materias]
  );

  const disponibles = useMemo(
    () => materias.filter(m =>
      m.tipo === 'obligatoria' && m.estado === 'pendiente' && prereqsMet(m, currentMap)
    ),
    [materias, currentMap]
  );

  const regulares = useMemo(
    () => materias.filter(m => m.tipo === 'obligatoria' && m.estado === 'regular'),
    [materias]
  );

  const efip1 = useMemo(() => materias.find(m => m.id === 50), [materias]);
  const efip2 = useMemo(() => materias.find(m => m.id === 51), [materias]);
  const efip1Disp = efip1?.estado === 'pendiente' && computeEfipDisponible(50, materias, creditosElectivas);
  const efip2Disp = efip2?.estado === 'pendiente' && computeEfipDisponible(51, materias, creditosElectivas);
  const sinElectivas = electivas.length === 0;

  const { criticas, diferibles, total: totalProximas } = useMemo(
    () => buildPlanning(materias),
    [materias]
  );

  const excedeCap   = totalProximas > CAP;
  const hasSection1 = disponibles.length > 0 || efip1Disp || efip2Disp || regulares.length > 0 || sinElectivas;
  const hasSection2 = criticas.length > 0 || (excedeCap && diferibles.length > 0);

  if (!hasSection1 && !hasSection2) return null;

  return (
    <div className={`alerts-panel${compact ? ' alerts-panel-compact' : ''}`}>
      <h3>Alertas e inscripciones</h3>

      {/* ── Situación actual ── */}
      {hasSection1 && (
        <ul>
          {disponibles.length > 0 && (
            <li className="info" style={{ fontWeight: 700, width: '100%' }}>
              Podés inscribirte a {disponibles.length} materia{disponibles.length > 1 ? 's' : ''} ahora
            </li>
          )}
          {disponibles.map(m => <li key={m.id}>{m.nombre}</li>)}

          {sinElectivas && (
            <li className="electivas-warning">
              Todavía no agregaste electivas al plan. Necesitás 8 créditos para EFIP II.
            </li>
          )}

          {efip1Disp && (
            <li className="success-action">
              EFIP I disponible — cumplís todos los requisitos para rendirlo
            </li>
          )}
          {efip2Disp && (
            <li className="success-action">
              EFIP II disponible — podés completar la carrera
            </li>
          )}
          {regulares.length > 0 && (
            <li className="orange">
              {regulares.length} materia{regulares.length > 1 ? 's' : ''} regular{regulares.length > 1 ? 'es' : ''} — pendiente{regulares.length > 1 ? 's' : ''} de final
            </li>
          )}
        </ul>
      )}

      {/* ── Planificación predictiva ── */}
      {hasSection2 && (
        <div className="predictive-section predictive-alert">
          <div className="predictive-header">
            <span className="predictive-title">Próximo cuatrimestre</span>
            {excedeCap && (
              <span className="predictive-cap">
                {totalProximas} opciones disponibles · cupo habitual: {CAP}
              </span>
            )}
          </div>

          {criticas.length > 0 && (
            <div className="predictive-block critica-block">
              <div className="predictive-block-label">
                ⚠️ No diferir — cada una de estas habilita materias que quedarían bloqueadas un cuatrimestre más:
              </div>
              {criticas.map(({ materia, desbloquea }) => (
                <div key={materia.id} className="predictive-item">
                  <div className="predictive-item-name">
                    {materia.nombre}
                    <span className="predictive-cuatri">{cuatrimestreLabel(materia.cuatrimestre)}</span>
                  </div>
                  <div className="predictive-unlocks">
                    <span className="predictive-arrow">→</span>
                    {desbloquea.map((m, i) => (
                      <span key={m.id} className="predictive-unlock-chip">
                        {m.nombre}<em> {cuatrimestreLabel(m.cuatrimestre)}</em>{i < desbloquea.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {excedeCap && diferibles.length > 0 && (
            <div className="predictive-block diferible-block">
              <div className="predictive-block-label">
                ✓ Podés diferir sin bloquear nada ({diferibles.length}):
              </div>
              <div className="diferibles-chips">
                {diferibles.map(({ materia }) => (
                  <span key={materia.id} className="diferible-chip">{materia.nombre}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
