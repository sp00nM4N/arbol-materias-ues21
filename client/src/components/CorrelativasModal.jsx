import { useState, useEffect } from 'react';
import { getCorrelativas, addCorrelativa, deleteCorrelativa } from '../api';

export default function CorrelativasModal({ materias, onClose }) {
  const [correlativas, setCorrelativas] = useState([]);
  const [filterMateria, setFilterMateria] = useState('');
  const [newMateria, setNewMateria]     = useState('');
  const [newCorr, setNewCorr]           = useState('');
  const [saving, setSaving]             = useState(false);

  const obligatorias = materias.filter(m => m.tipo !== 'electiva');

  async function reload() {
    const data = await getCorrelativas();
    setCorrelativas(data);
  }

  useEffect(() => { reload(); }, []);

  async function handleAdd() {
    if (!newMateria || !newCorr || newMateria === newCorr) return;
    setSaving(true);
    await addCorrelativa(Number(newMateria), Number(newCorr));
    await reload();
    setNewMateria('');
    setNewCorr('');
    setSaving(false);
  }

  async function handleDelete(id) {
    await deleteCorrelativa(id);
    await reload();
  }

  const filtered = filterMateria
    ? correlativas.filter(c => String(c.materia_id) === filterMateria)
    : correlativas;

  return (
    <div className="corr-modal-overlay" onClick={onClose}>
      <div className="corr-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>Correlativas del plan</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: '.8rem', color: '#64748b', marginBottom: 14 }}>
          Una correlativa indica que para cursar una materia necesitás tener regularizada o aprobada otra.
          Podés agregar o eliminar relaciones según el reglamento oficial de UES21.
        </p>

        {/* Filtro */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>
            Filtrar por materia
          </label>
          <select
            value={filterMateria}
            onChange={e => setFilterMateria(e.target.value)}
            style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: '.82rem', width: '100%' }}
          >
            <option value="">— Todas —</option>
            {obligatorias.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <table className="corr-table">
          <thead>
            <tr>
              <th>Para cursar…</th>
              <th>…necesitás regularizar</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={3} style={{ color: '#94a3b8', textAlign: 'center', padding: 16 }}>Sin correlativas cargadas</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id}>
                <td>{c.materia_nombre}</td>
                <td>{c.correlativa_nombre}</td>
                <td>
                  <button className="btn-del" onClick={() => handleDelete(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add new */}
        <div style={{ marginTop: 20, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
          <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#64748b', marginBottom: 10 }}>
            Agregar correlativa
          </div>
          <div className="add-corr-row">
            <div>
              <label>Para cursar</label>
              <select value={newMateria} onChange={e => setNewMateria(e.target.value)}>
                <option value="">Seleccioná materia…</option>
                {obligatorias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <div>
              <label>Necesita regularizar</label>
              <select value={newCorr} onChange={e => setNewCorr(e.target.value)}>
                <option value="">Seleccioná correlativa…</option>
                {obligatorias.filter(m => String(m.id) !== newMateria).map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>
            <button className="btn-add" onClick={handleAdd} disabled={saving || !newMateria || !newCorr}>
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
