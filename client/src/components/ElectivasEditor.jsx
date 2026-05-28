import { useState } from 'react';
import { createElectiva, updateElectiva, deleteElectiva } from '../api';
import { CUATRIMESTRES, cuatrimestreLabel } from '../utils/cuatrimestres';

// ─── Catálogo oficial de electivas MEC ───────────────────────────────────────

const CATALOGO = [
  'Big Data',
  'Capital Humano Intercultural',
  'Certificaciones Digitales',
  'Ciberdelitos',
  'Cultsearching Corporativo',
  'Estudios de Género para la Formación Profesional',
  'Eventos, Ceremonial y Protocolo',
  'Foundations of UX and UI Design',
  'Gestión de Equipos de Alto Rendimiento',
  'Gestión Sustentable de las Organizaciones',
  'Global Perspectives',
  'Herramientas Digitales para Emprendedores',
  'Innovación para Nuevos Negocios',
  'Marketing Digital',
  'Marketing Internacional',
  'Mediación Comunitaria y Cultura de Paz',
  'Nuevas Economías e Innovación Social',
  'Responsabilidad Social',
  'Tecnologías para la Sustentabilidad',
];

const ESTADOS = [
  { key: 'pendiente', label: 'Pendiente', icon: '○' },
  { key: 'inscripto', label: 'Inscripto',  icon: '◈' },
  { key: 'cursando',  label: 'Cursando',   icon: '◎' },
  { key: 'regular',   label: 'Regular',    icon: '◑' },
  { key: 'aprobada',  label: 'Aprobada',   icon: '●' },
];

const ESTADO_LABELS = {
  pendiente: 'Pendiente', inscripto: 'Inscripto', cursando: 'Cursando',
  regular: 'Regular', aprobada: 'Aprobada',
};

const PERIODOS = ['1A', '2A', '1B', '2B'];

const HEADER_COLOR = {
  aprobada: '#16a34a', cursando: '#0891b2', inscripto: '#7c3aed',
  regular: '#ea580c', pendiente: '#64748b',
};

// ─── Panel lateral (reemplaza al modal) ──────────────────────────────────────

export function ElectivaPanel({ electiva, onSave, onClose, showNotas = true }) {
  const isNew = !electiva.id;

  const [nombre,       setNombre]       = useState(electiva.nombre        ?? '');
  const [estado,       setEstado]       = useState(electiva.estado        ?? 'pendiente');
  const [creditos,     setCreditos]     = useState(electiva.creditos      ?? '');
  const [cuatrimestre, setCuatrimestre] = useState(electiva.cuatrimestre  ?? '');
  const [periodoAnio,  setPeriodoAnio]  = useState(electiva.periodo_anio  ?? '');
  const [periodoTramo, setPeriodoTramo] = useState(electiva.periodo_tramo ?? '');
  const [nota,         setNota]         = useState(electiva.nota          ?? '');
  const [saving,       setSaving]       = useState(false);

  const fromCatalog = electiva._fromCatalog;
  const headerColor = HEADER_COLOR[isNew ? 'pendiente' : electiva.estado] ?? '#64748b';

  const showExtras = ['inscripto', 'cursando', 'regular', 'aprobada'].includes(estado);

  const hasChanges = isNew
    || nombre        !== (electiva.nombre        ?? '')
    || estado        !== (electiva.estado        ?? 'pendiente')
    || String(creditos)     !== String(electiva.creditos     ?? '')
    || String(cuatrimestre) !== String(electiva.cuatrimestre ?? '')
    || String(periodoAnio)  !== String(electiva.periodo_anio ?? '')
    || periodoTramo  !== (electiva.periodo_tramo ?? '')
    || String(nota)  !== String(electiva.nota ?? '');

  async function save() {
    if (!nombre.trim()) return;
    setSaving(true);
    await onSave({
      nombre:        nombre.trim(),
      estado,
      creditos:      creditos     !== '' ? Number(creditos)     : null,
      cuatrimestre:  cuatrimestre !== '' ? Number(cuatrimestre) : null,
      periodo_anio:  periodoAnio  !== '' ? Number(periodoAnio)  : null,
      periodo_tramo: periodoTramo || null,
      nota:          nota         !== '' ? Number(nota)         : null,
    });
    setSaving(false);
    onClose();
  }

  const periodoDisplay = periodoAnio && periodoTramo ? `${periodoAnio} ${periodoTramo}` : '';

  return (
    <>
      <div className="side-panel-overlay" onClick={onClose} />
      <div className="side-panel">
        <div style={{ height: 4, background: headerColor, flexShrink: 0 }} />

        {/* Header */}
        <div className="panel-header">
          <div className="panel-header-top">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="panel-anio-label" style={{ color: '#7c3aed' }}>
                ★ Materia Electiva
              </div>
              <div className="panel-nombre">
                {isNew ? (fromCatalog ? electiva.nombre : 'Nueva electiva') : electiva.nombre}
              </div>
            </div>
            <button className="panel-close-btn" onClick={onClose} title="Cerrar">✕</button>
          </div>
          {!isNew && (
            <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{
                background: headerColor, color: '#fff',
                fontSize: '.72rem', fontWeight: 700, padding: '3px 10px',
                borderRadius: 999, textTransform: 'uppercase', letterSpacing: '.04em',
              }}>
                {ESTADO_LABELS[electiva.estado] ?? electiva.estado}
              </span>
              {showNotas && electiva.nota != null && (
                <span style={{ fontSize: '.78rem', color: '#64748b', fontWeight: 600 }}>
                  Nota: {electiva.nota}
                </span>
              )}
              {periodoDisplay && (
                <span style={{ fontSize: '.72rem', color: '#94a3b8' }}>{periodoDisplay}</span>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="panel-body">

          {/* ── Nombre ── */}
          <div className="panel-section">
            <div className="panel-section-title">Materia</div>
            {fromCatalog
              ? <div style={{ fontSize: '.85rem', fontWeight: 600, padding: '6px 0' }}>{nombre}</div>
              : (
                <div className="field-row">
                  <input
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Nombre de la materia electiva"
                  />
                </div>
              )
            }
          </div>

          {/* ── Estado ── */}
          <div className="panel-section">
            <div className="panel-section-title">Estado</div>
            <div className="estado-buttons">
              {ESTADOS.map(e => (
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
                    <input type="number" min="2020" max="2100" step="1" placeholder="2026"
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
          </div>

          {/* ── Créditos y cuatrimestre ── */}
          <div className="panel-section">
            <div className="panel-section-title">Detalles</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div className="field-row">
                <label>Créditos <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '.7rem' }}>(vacío = 4 estimados)</span></label>
                <input type="number" min="1" max="10" placeholder="—"
                  value={creditos} onChange={e => setCreditos(e.target.value)} />
              </div>
              <div className="field-row">
                <label>Cuatrimestre en el plan</label>
                <select
                  value={cuatrimestre}
                  onChange={e => setCuatrimestre(e.target.value)}
                >
                  <option value="">— Sin asignar —</option>
                  {CUATRIMESTRES.map(({ value, longLabel }) => (
                    <option key={value} value={value}>{longLabel}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            className="btn-save btn-full"
            onClick={save}
            disabled={saving || !nombre.trim() || !hasChanges}
          >
            {saving ? 'Guardando…' : isNew ? 'Agregar al plan' : hasChanges ? 'Guardar cambios' : 'Sin cambios'}
          </button>

          <div style={{
            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
            padding: '10px 12px', fontSize: '.73rem', color: '#64748b', lineHeight: 1.5,
            marginTop: 4,
          }}>
            <strong>Flujo:</strong> Pendiente → Inscripto → Cursando → Regular → Aprobada
          </div>
        </div>
      </div>
    </>
  );
}

// Alias para compatibilidad con App.jsx (edición desde el plan)
export const ElectivaModal = ElectivaPanel;

// ─── Main component ───────────────────────────────────────────────────────────

export default function ElectivasEditor({ electivas, onUpdate, showNotas = true }) {
  const [panel,  setPanel]  = useState(null);
  const [search, setSearch] = useState('');

  const CREDITOS_REQ   = 8;
  const credAprobados  = electivas.filter(e => e.estado === 'aprobada').reduce((s, e) => s + (e.creditos ?? 0), 0);
  const creditosFaltan = Math.max(0, CREDITOS_REQ - credAprobados);

  const nombresAgregados = new Set(electivas.map(e => e.nombre.toLowerCase().trim()));

  async function handleCreate(form) {
    await createElectiva(form);
    onUpdate();
  }

  async function handleUpdate(id, form) {
    await updateElectiva(id, form);
    onUpdate();
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta electiva del plan?')) return;
    await deleteElectiva(id);
    onUpdate();
  }

  function openCatalog(nombre) {
    setPanel({ nombre, _fromCatalog: true });
  }

  const filteredCatalog = CATALOGO.filter(n =>
    n.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="electivas-section">

      {/* ── Header ── */}
      <div className="elec-header">
        <div>
          <h2>Materias Electivas</h2>
          <p>
            Necesitás <strong>8 créditos</strong> de electivas para el EFIP II.
            Llevás <strong style={{ color: credAprobados >= CREDITOS_REQ ? '#16a34a' : '#ea580c' }}>
              {credAprobados}
            </strong> crédito{credAprobados !== 1 ? 's' : ''} aprobado{credAprobados !== 1 ? 's' : ''}.
            {creditosFaltan > 0
              ? <> Te faltan <strong>{creditosFaltan}</strong>.</>
              : <strong style={{ color: '#16a34a' }}> ¡Requisito cumplido!</strong>}
          </p>
        </div>
        <div className="elec-progress-wrap">
          <div className="elec-progress-label">{credAprobados} / {CREDITOS_REQ} créditos</div>
          <div className="elec-progress-track">
            <div className="elec-progress-fill" style={{ width: `${Math.min(100, (credAprobados / CREDITOS_REQ) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* ── Mis electivas ── */}
      {electivas.length > 0 && (
        <div className="elec-block">
          <div className="elec-block-title">Mis electivas ({electivas.length})</div>
          {electivas.map(e => (
            <div key={e.id} className={`electiva-card ${e.estado}`}>
              <div className="electiva-info">
                <div className="nombre">{e.nombre}</div>
                <div className="meta">
                  <span className={`card-badge badge-${e.estado}`}>{e.estado}</span>
                  {e.cuatrimestre && <span>{cuatrimestreLabel(e.cuatrimestre)}</span>}
                  <span>{e.creditos != null ? `${e.creditos} cr.` : '4 cr. (estimado)'}</span>
                  {e.periodo_anio && e.periodo_tramo && <span>{e.periodo_anio} {e.periodo_tramo}</span>}
                  {showNotas && e.nota != null && <span style={{ fontWeight: 700 }}>Nota: {e.nota}</span>}
                </div>
              </div>
              <div className="electiva-actions">
                <button className="btn-sm" onClick={() => setPanel(e)}>Editar</button>
                <button className="btn-sm danger" onClick={() => handleDelete(e.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Catálogo ── */}
      <div className="elec-block">
        <div className="elec-block-title">
          Catálogo MEC — elegí las que vas a cursar
        </div>
        <input
          className="elec-search"
          placeholder="Buscar en el catálogo…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="catalog-grid">
          {filteredCatalog.map(nombre => {
            const added = nombresAgregados.has(nombre.toLowerCase().trim());
            return (
              <div
                key={nombre}
                className={`catalog-item${added ? ' catalog-item-added' : ''}`}
                onClick={() => !added && openCatalog(nombre)}
                title={added ? 'Ya está en tu plan' : 'Clic para agregar al plan'}
              >
                <span className="catalog-item-name">{nombre}</span>
                {added
                  ? <span className="catalog-item-check">✓</span>
                  : <span className="catalog-item-add">+ Agregar</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Personalizada ── */}
      <button
        className="btn-save"
        style={{ borderRadius: 8, padding: '9px 18px', fontSize: '.85rem' }}
        onClick={() => setPanel({ _fromCatalog: false })}
      >
        + Agregar electiva personalizada
      </button>

      {/* ── Panel lateral ── */}
      {panel && (
        <ElectivaPanel
          electiva={panel}
          onSave={panel.id
            ? (form) => handleUpdate(panel.id, form)
            : handleCreate}
          onClose={() => setPanel(null)}
          showNotas={showNotas}
        />
      )}
    </div>
  );
}
