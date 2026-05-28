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

const ESTADOS  = ['pendiente', 'inscripto', 'cursando', 'regular', 'aprobada'];
const PERIODOS = ['1A', '2A', '1B', '2B'];

// ─── Modal (add from catalog or edit existing) ────────────────────────────────

export function ElectivaModal({ electiva, onSave, onClose, showNotas = true }) {
  const [form, setForm] = useState({
    nombre:        electiva.nombre        ?? '',
    cuatrimestre:  electiva.cuatrimestre  ?? '',
    creditos:      electiva.creditos      ?? '',
    estado:        electiva.estado        ?? 'pendiente',
    proveedor:     electiva.proveedor     ?? '',
    periodo_anio:  electiva.periodo_anio  ?? '',
    periodo_tramo: electiva.periodo_tramo ?? '',
    nota:          electiva.nota          ?? '',
  });
  const isNew = !electiva.id;

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.nombre.trim()) return;
    await onSave({
      ...form,
      nombre:       form.nombre.trim(),
      cuatrimestre: form.cuatrimestre  !== '' ? Number(form.cuatrimestre)  : null,
      creditos:     form.creditos      !== '' ? Number(form.creditos)      : null,
      nota:         form.nota          !== '' ? Number(form.nota)          : null,
      periodo_anio: form.periodo_anio  !== '' ? Number(form.periodo_anio)  : null,
      periodo_tramo: form.periodo_tramo || null,
    });
    onClose();
  }

  const fromCatalog = electiva._fromCatalog;

  return (
    <div className="edit-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={e => e.stopPropagation()}>
        <h3>{isNew ? 'Agregar electiva al plan' : 'Editar electiva'}</h3>
        <div className="form-col">

          {/* Nombre (readonly si viene del catálogo) */}
          <div className="field-row">
            <label>Materia</label>
            {fromCatalog
              ? <div className="catalog-nombre-readonly">{form.nombre}</div>
              : <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre de la materia" />
            }
          </div>

          {/* Cuatrimestre — referencia en el plan de estudios */}
          <div className="field-row">
            <label>Cuatrimestre en el plan (opcional)</label>
            <select
              value={form.cuatrimestre}
              onChange={e => set('cuatrimestre', e.target.value)}
              style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '7px 10px', fontSize: '.82rem' }}
            >
              <option value="">— Sin asignar —</option>
              {CUATRIMESTRES.map(({ value, longLabel }) => <option key={value} value={value}>{longLabel}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="field-row">
              <label>Créditos</label>
              <input
                type="number" min="1" max="10"
                value={form.creditos}
                onChange={e => set('creditos', e.target.value)}
                placeholder="4"
              />
            </div>
            <div className="field-row">
              <label>Estado</label>
              <select
                value={form.estado}
                onChange={e => set('estado', e.target.value)}
                style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '7px 10px', fontSize: '.82rem' }}
              >
                {ESTADOS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Período real — mismo esquema que materias */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="field-row">
              <label>Año</label>
              <input
                type="number" min="2020" max="2100" step="1"
                value={form.periodo_anio}
                onChange={e => set('periodo_anio', e.target.value)}
                placeholder="2026"
              />
            </div>
            <div className="field-row">
              <label>Período</label>
              <select
                value={form.periodo_tramo}
                onChange={e => set('periodo_tramo', e.target.value)}
                style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '7px 10px', fontSize: '.82rem' }}
              >
                <option value="">— Sin período —</option>
                {PERIODOS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {showNotas && (
            <div className="field-row">
              <label>Nota (opcional)</label>
              <input type="number" min="0" max="10" step="0.1" value={form.nota} onChange={e => set('nota', e.target.value)} placeholder="7.5" />
            </div>
          )}

          <div className="field-row">
            <label>Proveedor / Institución (opcional)</label>
            <input value={form.proveedor} onChange={e => set('proveedor', e.target.value)} placeholder="UES21, Coursera…" />
          </div>
        </div>

        <div className="form-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={save} disabled={!form.nombre.trim()}>
            {isNew ? 'Agregar al plan' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ElectivasEditor({ electivas, onUpdate, showNotas = true }) {
  const [modal,   setModal]   = useState(null); // null | { ...electiva } to edit/add
  const [search,  setSearch]  = useState('');

  const CREDITOS_REQ    = 8;
  const credAprobados   = electivas.filter(e => e.estado === 'aprobada').reduce((s, e) => s + (e.creditos ?? 0), 0);
  const creditosFaltan  = Math.max(0, CREDITOS_REQ - credAprobados);

  // Names already added (for catalog dedup)
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
    setModal({ nombre, _fromCatalog: true });
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
                  {e.proveedor && <span>— {e.proveedor}</span>}
                  {e.periodo_anio && e.periodo_tramo && <span>{e.periodo_anio} {e.periodo_tramo}</span>}
                  {showNotas && e.nota && <span style={{ fontWeight: 700 }}>Nota: {e.nota}</span>}
                </div>
              </div>
              <div className="electiva-actions">
                <button className="btn-sm" onClick={() => setModal(e)}>Editar</button>
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
        onClick={() => setModal({ _fromCatalog: false })}
      >
        + Agregar electiva personalizada
      </button>

      {/* ── Modal ── */}
      {modal && (
        <ElectivaModal
          electiva={modal}
          onSave={modal.id
            ? (form) => handleUpdate(modal.id, form)
            : handleCreate}
          onClose={() => setModal(null)}
          showNotas={showNotas}
        />
      )}
    </div>
  );
}
