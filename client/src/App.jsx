import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart3,
  BookOpen,
  Eye,
  EyeOff,
  GitBranch,
  GraduationCap,
  Layers,
  Route,
} from 'lucide-react';
import { getMaterias, getElectivas, updateElectiva } from './api';
import KPIPanel from './components/KPIPanel';
import AlertasPanel from './components/AlertasPanel';
import MateriasGrid from './components/MateriasGrid';
import ElectivasEditor, { ElectivaModal } from './components/ElectivasEditor';
import SidePanel from './components/SidePanel';
import TreeView from './components/TreeView';
import NotasDashboard from './components/NotasDashboard';
import CaminoPropuesto from './components/CaminoPropuesto';
import ThemeToggle from './components/ThemeToggle';

function getInitialTheme() {
  const saved = localStorage.getItem('ues21-theme');
  if (saved === 'dark' || saved === 'light') return saved;

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export default function App() {
  const [materias, setMaterias]     = useState([]);
  const [electivas, setElectivas]   = useState([]);
  const [tab, setTab]               = useState('plan');
  const [selectedId, setSelectedId] = useState(null);
  const [editingElectiva, setEditingElectiva] = useState(null);
  const [showNotas, setShowNotas] = useState(() => localStorage.getItem('showNotas') !== 'false');
  const [theme, setTheme] = useState(getInitialTheme);
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

  useEffect(() => {
    localStorage.setItem('showNotas', showNotas ? 'true' : 'false');
  }, [showNotas]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ues21-theme', theme);
  }, [theme]);

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

  function toggleTheme() {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }

  const navItems = [
    { id: 'plan', label: 'Plan de Estudios', icon: BookOpen, target: 'plan' },
    { id: 'arbol', label: 'Árbol', icon: GitBranch, target: 'arbol' },
    { id: 'camino', label: 'Camino Sugerido', icon: Route, target: 'camino' },
    { id: 'notas', label: 'Notas', icon: BarChart3, target: 'notas' },
    { id: 'electivas', label: 'Electivas', icon: Layers, target: 'electivas' },
  ];

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#64748b' }}>
        Cargando…
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Navegación principal">
        <div className="sidebar-brand" aria-label="Licenciatura en Ciencia de Datos">
          <GraduationCap size={28} strokeWidth={2.4} aria-hidden="true" />
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = tab === item.target && item.id !== 'inicio';
            return (
              <button
                key={item.id}
                className={`sidebar-item ${active ? 'active' : ''}`}
                type="button"
                onClick={() => setTab(item.target)}
                aria-label={item.label}
                title={item.label}
              >
                <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </aside>

      <div className="app-workspace">
        <header className="app-header">
          <div className="header-topline">
            <div>
              <h1>Lic. en Ciencia de Datos — UES21</h1>
              <p>Seguimiento de carrera</p>
            </div>
            <button
              className={`privacy-toggle ${showNotas ? '' : 'privacy-toggle-off'}`}
              type="button"
              onClick={() => setShowNotas(v => !v)}
              aria-pressed={!showNotas}
              title={showNotas ? 'Ocultar notas para capturas' : 'Mostrar notas'}
            >
              {showNotas
                ? <Eye size={18} strokeWidth={2.2} aria-hidden="true" />
                : <EyeOff size={18} strokeWidth={2.2} aria-hidden="true" />}
              <span>{showNotas ? 'Ocultar notas' : 'Mostrar notas'}</span>
            </button>
          </div>
          <div className="progress-row">
            <span>{pct}% completada</span>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
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
                showNotas={showNotas}
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
            showNotas={showNotas}
          />
        )}
        {tab === 'camino' && (
          <CaminoPropuesto
            materias={materias}
            electivas={electivas}
            creditosElectivas={creditosAprobados}
            onSelect={handleSelect}
          />
        )}
        {tab === 'notas' && (
          <NotasDashboard materias={materias} electivas={electivas} showNotas={showNotas} />
        )}
        {tab === 'electivas' && (
          <ElectivasEditor electivas={electivas} onUpdate={reloadElectivas} showNotas={showNotas} />
        )}
        </main>
      </div>

      {/* ── Side panel ── */}
      {selectedMateria && (
        <SidePanel
          materia={selectedMateria}
          materias={materias}
          electivas={electivas}
          onClose={handleClosePanel}
          onUpdate={reloadMaterias}
          showNotas={showNotas}
        />
      )}

      {editingElectiva && (
        <ElectivaModal
          electiva={editingElectiva}
          onSave={handleUpdateElectivaFromPlan}
          onClose={() => setEditingElectiva(null)}
          showNotas={showNotas}
        />
      )}
    </div>
  );
}
