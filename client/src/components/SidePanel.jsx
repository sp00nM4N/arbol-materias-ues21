import { useState, useEffect, useMemo } from 'react';
import { updateMateria, addCorrelativa, deleteCorrelativa } from '../api';
import { cuatrimestreLabel } from '../utils/cuatrimestres';

const ESTADOS = [
  { key: 'pendiente', label: 'Pendiente', icon: '○' },
  { key: 'inscripto', label: 'Inscripto',  icon: '◈' },
  { key: 'cursando',  label: 'Cursando',   icon: '◎' },
  { key: 'regular',   label: 'Regular',    icon: '◑' },
  { key: 'aprobada',  label: 'Aprobada',   icon: '●' },
];

// Estados relevantes para EFIPs (no tienen "cursando" ni "regular")
const ESTADOS_EXAMEN = [
  { key: 'pendiente', label: 'Pendiente', icon: '○' },
  { key: 'inscripto', label: 'Inscripto',  icon: '◈' },
  { key: 'aprobada',  label: 'Aprobado',  icon: '●' },
];

const ESTADO_LABELS = {
  pendiente: 'Pendiente', inscripto: 'Inscripto', cursando: 'Cursando',
  regular: 'Regular', aprobada: 'Aprobada',
};

const PERIODOS = ['1A', '2A', '1B', '2B'];

function formatPeriodo(materia) {
  if (materia.periodo_anio && materia.periodo_tramo) {
    return `${materia.periodo_anio} ${materia.periodo_tramo}`;
  }
  return materia.periodo ?? '';
}

export default function SidePanel({ materia, materias, electivas, onClose, onUpdate, showNotas = true }) {
  const [estado, setEstado]   = useState(materia.estado);
  const [nota, setNota]       = useState(materia.nota ?? '');
  const [periodoAnio, setPeriodoAnio] = useState(materia.periodo_anio ?? '');
  const [periodoTramo, setPeriodoTramo] = useState(materia.periodo_tramo ?? '');
  const [saving, setSaving]   = useState(false);
  const [newCorrId, setNewCorrId] = useState('');
  const [corrSaving, setCorrSaving] = useState(false);

  const isExamen  = materia.tipo === 'examen';
  const isIngreso = materia.tipo === 'ingreso';

  useEffect(() => {
    setEstado(materia.estado);
    setNota(materia.nota ?? '');
    setPeriodoAnio(materia.periodo_anio ?? '');
    setPeriodoTramo(materia.periodo_tramo ?? '');
    setNewCorrId('');
  }, [materia.id]);

  const estadoMap = useMemo(
    () => Object.fromEntries(materias.map(m => [m.id, m.estado])),
    [materias]
  );
  const nombreMap = useMemo(
    () => Object.fromEntries(materias.map(m => [m.id, m.nombre])),
    [materias]
  );

  const creditosElectivas = useMemo(
    () => (electivas ?? []).filter(e => e.estado === 'aprobada').reduce((s, e) => s + e.creditos, 0),
    [electivas]
  );

  // EFIP requirements outside regular correlativas
  const efipReqs = isExamen && materia.id === 51
    ? [{
        label: '8 créditos de electivas aprobados',
        detail: `${creditosElectivas ?? 0} / 8`,
        ok: (creditosElectivas ?? 0) >= 8,
      }]
    : null;

  // Regular correlativas
  const prereqs = !isIngreso ? (materia.correlativas || []) : [];

  const desbloquea = materias.filter(m =>
    m.correlativas?.some(c => c.correlativa_id === materia.id)
  );

  const candidatos = materias.filter(m =>
    m.id !== materia.id &&
    (isExamen
      ? m.tipo === 'obligatoria' || (materia.id === 51 && m.id === 50)
      : m.tipo === 'obligatoria') &&
    !prereqs.some(c => c.correlativa_id === m.id)
  ).sort((a, b) => (a.cuatrimestre ?? 99) - (b.cuatrimestre ?? 99) || a.nombre.localeCompare(b.nombre));

  async function saveEstado() {
    setSaving(true);
    await updateMateria(materia.id, {
      estado,
      nota: nota !== '' ? Number(nota) : null,
      periodo_anio: periodoAnio !== '' ? Number(periodoAnio) : null,
      periodo_tramo: periodoTramo || null,
    });
    setSaving(false);
    onUpdate();
  }

  async function handleAddCorr() {
    if (!newCorrId) return;
    setCorrSaving(true);
    await addCorrelativa(materia.id, Number(newCorrId));
    setNewCorrId('');
    setCorrSaving(false);
    onUpdate();
  }

  async function handleRemoveCorr(corrRowId) {
    await deleteCorrelativa(corrRowId);
    onUpdate();
  }

  const showExtras = ['inscripto','cursando','regular','aprobada'].includes(estado);
  const estadoChanged = estado !== materia.estado
    || String(nota) !== String(materia.nota ?? '')
    || String(periodoAnio) !== String(materia.periodo_anio ?? '')
    || String(periodoTramo) !== String(materia.periodo_tramo ?? '');

  const headerColor = {
    aprobada: '#16a34a', cursando: '#0891b2', inscripto: '#7c3aed',
    regular: '#ea580c', pendiente: '#64748b',
  }[materia.estado] ?? '#64748b';

  const tipoLabel = isExamen ? '📝 Examen Integrador' : isIngreso ? '🎓 Materia de Ingreso' : null;
  const estadosBotones = isExamen ? ESTADOS_EXAMEN : ESTADOS;

  return (
    <>
      <div className="side-panel-overlay" onClick={onClose} />
      <div className="side-panel">
        <div style={{ height: 4, background: headerColor, flexShrink: 0 }} />

        {/* Header */}
        <div className="panel-header">
          <div className="panel-header-top">
            <div style={{ flex: 1, minWidth: 0 }}>
              {tipoLabel ? (
                <div className="panel-anio-label" style={{ color: isExamen ? '#0891b2' : '#7c3aed' }}>
                  {tipoLabel}
                </div>
              ) : materia.anio ? (
                <div className="panel-anio-label">
                  {materia.anio}° Año — {cuatrimestreLabel(materia.cuatrimestre)}
                </div>
              ) : null}
              <div className="panel-nombre">{materia.nombre}</div>
            </div>
            <button className="panel-close-btn" onClick={onClose} title="Cerrar">✕</button>
          </div>

          <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{
              background: headerColor, color: '#fff',
              fontSize: '.72rem', fontWeight: 700, padding: '3px 10px',
              borderRadius: 999, textTransform: 'uppercase', letterSpacing: '.04em',
            }}>
              {ESTADO_LABELS[materia.estado] ?? materia.estado}
            </span>
            {showNotas && materia.nota && <span style={{ fontSize: '.78rem', color: '#64748b', fontWeight: 600 }}>Nota: {materia.nota}</span>}
            {formatPeriodo(materia) && <span style={{ fontSize: '.72rem', color: '#94a3b8' }}>{formatPeriodo(materia)}</span>}
          </div>
        </div>

        {/* Body */}
        <div className="panel-body">

          {/* ── Estado ── */}
          <div className="panel-section">
            <div className="panel-section-title">Cambiar estado</div>
            <div className="estado-buttons">
              {estadosBotones.map(e => (
                <button
                  key={e.key}
                  className={`estado-btn e-${e.key} ${estado === e.key ? 'selected' : ''}`}
                  onClick={() => setEstado(e.key)}
                >
                  <span>{e.icon}</span> {e.label}
                </button>
              ))}
            </div>

            {showExtras && (
              <div className="extra-fields">
                <div style={{ display: 'grid', gridTemplateColumns: showNotas ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8 }}>
                  {showNotas && (
                    <div className="field-row">
                      <label>Nota (0–10)</label>
                      <input type="number" min="0" max="10" step="0.1" placeholder="7.5"
                        value={nota} onChange={e => setNota(e.target.value)} />
                    </div>
                  )}
                  <div className="field-row">
                    <label>Año</label>
                    <input type="number" min="2020" max="2100" step="1" placeholder="2025"
                      value={periodoAnio} onChange={e => setPeriodoAnio(e.target.value)} />
                  </div>
                  <div className="field-row">
                    <label>Período</label>
                    <select value={periodoTramo} onChange={e => setPeriodoTramo(e.target.value)}>
                      <option value="">Sin período</option>
                      {PERIODOS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <button
              className="btn-save btn-full"
              onClick={saveEstado}
              disabled={saving || !estadoChanged}
              style={{ marginTop: showExtras ? 12 : 4 }}
            >
              {saving ? 'Guardando…' : estadoChanged ? 'Guardar cambios' : 'Sin cambios'}
            </button>
          </div>

          {/* ── Requisitos EFIP ── */}
          {isExamen && efipReqs && (
            <div className="panel-section">
              <div className="panel-section-title">Requisitos adicionales</div>
              {efipReqs.map((r, i) => (
                <div key={i} className={`corr-item ${r.ok ? 'met' : 'unmet'}`}>
                  <span className="corr-item-icon">{r.ok ? '✅' : '🔒'}</span>
                  <div className="corr-item-info">
                    <div className="corr-item-nombre">{r.label}</div>
                    <div className="corr-item-estado">{r.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Correlativas ── */}
          {!isIngreso && (
            <div className="panel-section">
              <div className="panel-section-title">
                {isExamen ? 'Para rendir, necesitás' : 'Para cursar, necesitás'} ({prereqs.length})
              </div>

              {prereqs.length === 0 ? (
                <p style={{ fontSize: '.8rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: 10 }}>
                  Sin correlativas — {isExamen ? 'examen libre por ahora.' : 'materia libre desde el inicio.'}
                </p>
              ) : (
                prereqs.map(c => {
                  const est = estadoMap[c.correlativa_id] ?? 'pendiente';
                  const met = est === 'regular' || est === 'aprobada';
                  return (
                    <div key={c.id} className={`corr-item ${met ? 'met' : 'unmet'}`}>
                      <span className="corr-item-icon">{met ? '✅' : '🔒'}</span>
                      <div className="corr-item-info">
                        <div className="corr-item-nombre">{nombreMap[c.correlativa_id] ?? `#${c.correlativa_id}`}</div>
                        <div className="corr-item-estado">{ESTADO_LABELS[est] ?? est}</div>
                      </div>
                      <button className="btn-del" title="Eliminar" onClick={() => handleRemoveCorr(c.id)}>✕</button>
                    </div>
                  );
                })
              )}

              <div className="add-corr-inline">
                <select value={newCorrId} onChange={e => setNewCorrId(e.target.value)}>
                  <option value="">Agregar correlativa…</option>
                  {candidatos.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.cuatrimestre ? `${cuatrimestreLabel(m.cuatrimestre)} – ` : ''}{m.nombre}
                    </option>
                  ))}
                </select>
                <button className="btn-add" onClick={handleAddCorr} disabled={!newCorrId || corrSaving}>
                  Agregar
                </button>
              </div>
            </div>
          )}

          {/* ── Desbloquea ── */}
          {desbloquea.length > 0 && (
            <div className="panel-section">
              <div className="panel-section-title">Al aprobarla, desbloqueás ({desbloquea.length})</div>
              {desbloquea.map(m => (
                <div key={m.id} className="dep-item">
                  {m.nombre}
                  {m.anio && <span className="dep-item-anio">— {m.anio}° año, {cuatrimestreLabel(m.cuatrimestre)}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Leyenda */}
          <div style={{
            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
            padding: '10px 12px', fontSize: '.73rem', color: '#64748b', lineHeight: 1.5,
          }}>
            <strong>Flujo:</strong> Pendiente → Inscripto → Cursando → Regular → Aprobada
          </div>
        </div>
      </div>
    </>
  );
}
