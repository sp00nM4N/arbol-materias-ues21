import { useState, useEffect, useCallback, useMemo } from 'react';
import { getMaterias, getElectivas, updateElectiva } from './api';
import KPIPanel from './components/KPIPanel';
import AlertasPanel from './components/AlertasPanel';
import MateriasGrid from './components/MateriasGrid';
import ElectivasEditor, { ElectivaModal } from './components/ElectivasEditor';
import SidePanel from './components/SidePanel';
import TreeView from './components/TreeView';
import NotasDashboard from './components/NotasDashboard';

export default function App() {
  const [materias, setMaterias]     = useState([]);
  const [electivas, setElectivas]   = useState([]);
  const [tab, setTab]               = useState('plan');
  const [selectedId, setSelectedId] = useState(null);
  const [editingElectiva, setEditingElectiva] = useState(null);
  const [loading, setLoading]       = useState(true);

  const reloadMaterias = useCallback(async () => {
    const data = await getMaterias();
    setMaterias(data);
  }, []);

  const reloadElectivas = useCallback(async () => {
    const data = await getElectivas();
    setElectivas(data);
  }, []);

  useEffect(() => {
    Promise.all([reloadMaterias(), reloadElectivas()]).finally(() => setLoading(false));
  }, [reloadMaterias, reloadElectivas]);

  // Derived state
  const obligatorias = materias.filter(m => m.tipo === 'obligatoria');
  const total      = obligatorias.length;
  const aprobadas  = obligatorias.filter(m => m.estado === 'aprobada').length;
  const cursando   = obligatorias.filter(m => m.estado === 'cursando').length;
  const regulares  = obligatorias.filter(m => m.estado === 'regular').length;
  const pct        = total ? Math.round((aprobadas / total) * 100) : 0;
  const creditosAprobados = electivas
    .filter(e => e.estado === 'aprobada')
    .reduce((s, e) => s + e.creditos, 0);

  // Resolve selected materia from current materias array (stays fresh after reloads)
  const selectedMateria = useMemo(
    () => selectedId ? materias.find(m => m.id === selectedId) ?? null : null,
    [selectedId, materias]
  );

  function handleSelect(id) {
    setSelectedId(prev => (prev === id ? null : id)); // toggle
  }

  function handleClosePanel() {
    setSelectedId(null);
  }

  async function handleUpdateElectivaFromPlan(form) {
    await updateElectiva(editingElectiva.id, form);
    await reloadElectivas();
  }

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#64748b' }}>
        Cargando…
      </div>
    );
  }

  return (
    <div>
      {/* ── Header ── */}
      <header className="app-header">
        <h1>Lic. en Ciencia de Datos — UES21</h1>
        <p>Seguimiento de carrera</p>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-label">
          <span>{pct}% completada</span>
          <span>{aprobadas} de {total} materias aprobadas</span>
        </div>
        <KPIPanel
          aprobadas={aprobadas}
          cursando={cursando}
          regulares={regulares}
          total={total}
          creditosElectivas={creditosAprobados}
        />
      </header>

      {/* ── Tabs ── */}
      <nav className="tabs">
        <button className={`tab-btn ${tab==='plan'?'active':''}`} onClick={() => setTab('plan')}>
          Plan de Estudios
        </button>
        <button className={`tab-btn ${tab==='arbol'?'active':''}`} onClick={() => setTab('arbol')}>
          Árbol
        </button>
        <button className={`tab-btn ${tab==='notas'?'active':''}`} onClick={() => setTab('notas')}>
          Notas
        </button>
        <button className={`tab-btn ${tab==='electivas'?'active':''}`} onClick={() => setTab('electivas')}>
          Electivas
        </button>
      </nav>

      {/* ── Content ── */}
      <main className="main-content">
        {tab === 'plan' && (
          <div className="plan-layout">
            <aside className="plan-sidebar">
              <AlertasPanel
                materias={materias}
                electivas={electivas}
                creditosElectivas={creditosAprobados}
                compact
              />
            </aside>
            <section className="plan-main">
              <MateriasGrid
                materias={materias}
                electivas={electivas}
                selectedId={selectedId}
                onSelect={handleSelect}
                onEditElectiva={setEditingElectiva}
                creditosElectivas={creditosAprobados}
              />
            </section>
          </div>
        )}
        {tab === 'arbol' && (
          <TreeView
            materias={materias}
            electivas={electivas}
            selectedId={selectedId}
            onSelect={handleSelect}
            onEditElectiva={setEditingElectiva}
            creditosElectivas={creditosAprobados}
          />
        )}
        {tab === 'notas' && (
          <NotasDashboard materias={materias} electivas={electivas} />
        )}
        {tab === 'electivas' && (
          <ElectivasEditor electivas={electivas} onUpdate={reloadElectivas} />
        )}
      </main>

      {/* ── Side panel ── */}
      {selectedMateria && (
        <SidePanel
          materia={selectedMateria}
          materias={materias}
          electivas={electivas}
          onClose={handleClosePanel}
          onUpdate={reloadMaterias}
        />
      )}

      {editingElectiva && (
        <ElectivaModal
          electiva={editingElectiva}
          onSave={handleUpdateElectivaFromPlan}
          onClose={() => setEditingElectiva(null)}
        />
      )}

    </div>
  );
}
