import { useRef, useState, useLayoutEffect, useMemo } from 'react';
import { computeVisualEstado } from './MateriaCard';

// ─── Layout constants ─────────────────────────────────────────────────────────

const COL_W   = 142;
const COL_GAP = 10;
const NODE_GAP = 8;

// Column order: ingreso → C1…C6 → EFIP I → C7…C8 → EFIP II
const COL_KEYS = ['ingreso','c1','c2','c3','c4','c5','c6','efip1','c7','c8','efip2'];
const COL_LABEL = {
  ingreso: 'Ingreso', efip1: 'EFIP I', efip2: 'EFIP II',
  c1:'1Q', c2:'2Q', c3:'3Q', c4:'4Q', c5:'5Q', c6:'6Q', c7:'7Q', c8:'8Q',
};

// Year group headers: label, how many columns they span, accent color
const YEAR_GROUPS = [
  { label: 'Ingreso', span: 1, color: '#7c3aed' },
  { label: '1° Año',  span: 2, color: '#0284c7' },
  { label: '2° Año',  span: 2, color: '#0891b2' },
  { label: '3° Año',  span: 3, color: '#0369a1' },
  { label: '4° Año',  span: 3, color: '#4338ca' },
];

const VISUAL_LABELS = {
  aprobada:'Aprobada', cursando:'Cursando', inscripto:'Inscripto',
  regular:'Regular', disponible:'Disponible', bloqueada:'Bloqueada', pendiente:'Pendiente',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupWidth(span) {
  return span * COL_W + (span - 1) * COL_GAP;
}

function getMateriaColKey(m) {
  if (m.tipo === 'ingreso') return 'ingreso';
  if (m.tipo === 'examen')  return m.id === 50 ? 'efip1' : 'efip2';
  if (m.cuatrimestre)       return `c${m.cuatrimestre}`;
  return null;                          // requisito → skip
}

function getEfipVisual(efip, materias, creditosElectivas) {
  if (efip.estado !== 'pendiente') return efip.estado;
  const estadoMap = Object.fromEntries(materias.map(m => [m.id, m.estado]));
  const correlativasOk = (efip.correlativas ?? []).every(c =>
    ['regular','aprobada'].includes(estadoMap[c.correlativa_id])
  );
  const creditosOk = efip.id !== 51 || (creditosElectivas ?? 0) >= 8;
  return correlativasOk && creditosOk ? 'disponible' : 'bloqueada';
}

// ─── Bezier path ──────────────────────────────────────────────────────────────

function BezierPath({ sx, sy, tx, ty, met, highlighted, dimmed }) {
  const dx   = Math.abs(tx - sx);
  const cp1x = sx + dx * 0.45;
  const cp2x = tx - dx * 0.45;
  return (
    <path
      d={`M ${sx},${sy} C ${cp1x},${sy} ${cp2x},${ty} ${tx},${ty}`}
      stroke={met ? '#16a34a' : '#dc2626'}
      strokeWidth={highlighted ? 2.5 : 1.5}
      strokeDasharray={met ? undefined : '5 4'}
      strokeOpacity={dimmed ? 0.07 : highlighted ? 1 : 0.32}
      fill="none"
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TreeView({ materias, electivas = [], selectedId, onSelect, onEditElectiva, creditosElectivas }) {
  const innerRef = useRef(null);
  const nodeRefs = useRef({});
  const [lines,   setLines]   = useState([]);
  const [hovered, setHovered] = useState(null);

  const estadoMap = useMemo(
    () => Object.fromEntries(materias.map(m => [m.id, m.estado])),
    [materias]
  );

  const colMaterias = useMemo(() => {
    const map = Object.fromEntries(COL_KEYS.map(k => [k, []]));
    for (const m of materias) {
      const key = getMateriaColKey(m);
      if (key) map[key].push(m);
    }
    // Electivas con cuatrimestre asignado
    for (const e of electivas) {
      if (e.cuatrimestre) {
        const key = `c${e.cuatrimestre}`;
        if (map[key]) map[key].push({ ...e, tipo: 'electiva' });
      }
    }
    return map;
  }, [materias, electivas]);

  // Compute SVG bezier lines after DOM settles
  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const ir = inner.getBoundingClientRect();

    const p = (el) => {
      const r = el.getBoundingClientRect();
      return { l: r.left - ir.left, t: r.top - ir.top, w: r.width, h: r.height };
    };

    const newLines = [];
    for (const m of materias) {
      if (!m.correlativas?.length) continue;
      const tEl = nodeRefs.current[m.id];
      if (!tEl) continue;
      const t = p(tEl);

      for (const c of m.correlativas) {
        const sEl = nodeRefs.current[c.correlativa_id];
        if (!sEl) continue;
        const s   = p(sEl);
        const est = estadoMap[c.correlativa_id];
        newLines.push({
          id:    `${c.correlativa_id}->${m.id}`,
          sx:    s.l + s.w,  sy: s.t + s.h / 2,
          tx:    t.l,        ty: t.t + t.h / 2,
          met:   est === 'regular' || est === 'aprobada',
          srcId: c.correlativa_id,
          tgtId: m.id,
        });
      }
    }
    setLines(newLines);
  }, [materias, estadoMap]);

  const totalW = COL_KEYS.length * COL_W + (COL_KEYS.length - 1) * COL_GAP;

  return (
    <div className="tree-outer">
      <div style={{ minWidth: totalW + 32 }}>

        {/* ── Year group headers ── */}
        <div className="tree-year-row" style={{ gap: COL_GAP }}>
          {YEAR_GROUPS.map(g => (
            <div
              key={g.label}
              className="tree-year-label"
              style={{ width: groupWidth(g.span), borderColor: g.color, color: g.color }}
            >
              {g.label}
            </div>
          ))}
        </div>

        {/* ── Cuatrimestre sub-headers ── */}
        <div className="tree-subhdr-row" style={{ gap: COL_GAP }}>
          {COL_KEYS.map(key => (
            <div key={key} className={`tree-subhdr${key.startsWith('efip') ? ' tree-subhdr-efip' : ''}`} style={{ width: COL_W }}>
              {COL_LABEL[key]}
            </div>
          ))}
        </div>

        {/* ── Columns + SVG overlay ── */}
        <div ref={innerRef} className="tree-inner" style={{ gap: COL_GAP }}>

          {/* Absolute SVG for connection lines */}
          <svg
            className="tree-svg"
            style={{ width: totalW }}
            aria-hidden="true"
          >
            {lines.map(line => {
              const hl  = hovered !== null && (line.srcId === hovered || line.tgtId === hovered);
              const dim = hovered !== null && !hl;
              return <BezierPath key={line.id} {...line} highlighted={hl} dimmed={dim} />;
            })}
          </svg>

          {/* Columns */}
          {COL_KEYS.map(colKey => (
            <div
              key={colKey}
              className={`tree-col${colKey.startsWith('efip') ? ' tree-col-efip' : ''}`}
              style={{ width: COL_W, gap: NODE_GAP }}
            >
              {colMaterias[colKey].map(m => {
                const isElectiva = m.tipo === 'electiva';
                const visual = isElectiva
                  ? (m.estado ?? 'pendiente')
                  : m.tipo === 'examen'
                    ? getEfipVisual(m, materias, creditosElectivas)
                    : computeVisualEstado(m, estadoMap);
                const isSelected = !isElectiva && m.id === selectedId;
                const nodeKey = isElectiva ? `e-${m.id}` : m.id;
                return (
                  <div
                    key={nodeKey}
                    ref={el => { if (!isElectiva) nodeRefs.current[m.id] = el; }}
                    className={`tree-node ${visual}${isSelected ? ' selected-card' : ''}${m.tipo === 'examen' ? ' tree-node-examen' : ''}${isElectiva ? ' tree-node-electiva' : ''}`}
                    onClick={() => isElectiva ? onEditElectiva?.(m) : onSelect(m.id)}
                    onMouseEnter={() => !isElectiva && setHovered(m.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={isElectiva && !onEditElectiva ? { cursor: 'default' } : undefined}
                    title={isElectiva && onEditElectiva ? 'Editar electiva' : undefined}
                  >
                    {isElectiva && <div className="tree-electiva-badge">Electiva</div>}
                    <div className="tree-node-name">{m.nombre}</div>
                    <div className="tree-node-meta">
                      <span className={`card-badge badge-${visual}`}>{VISUAL_LABELS[visual] ?? visual}</span>
                      {m.nota != null && <span className="card-nota">{m.nota}</span>}
                      {isElectiva && m.creditos != null && <span className="card-nota">{m.creditos} cr.</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Legend ── */}
        <div className="tree-legend">
          <span>Conexiones:</span>
          <span className="tree-legend-item">
            <svg width="28" height="10"><line x1="0" y1="5" x2="28" y2="5" stroke="#16a34a" strokeWidth="2"/></svg>
            Prerequisito cumplido
          </span>
          <span className="tree-legend-item">
            <svg width="28" height="10"><line x1="0" y1="5" x2="28" y2="5" stroke="#dc2626" strokeWidth="2" strokeDasharray="5 3"/></svg>
            Prerequisito pendiente
          </span>
          <span style={{ color: '#94a3b8' }}>— Pasá el cursor sobre una materia para ver sus conexiones</span>
        </div>
      </div>
    </div>
  );
}
