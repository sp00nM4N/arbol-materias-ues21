import { useMemo, useState } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gradeColor(n) {
  if (n >= 9) return '#16a34a';
  if (n >= 7) return '#0284c7';
  if (n >= 6) return '#ea580c';
  return '#dc2626';
}

function avg(arr) {
  if (!arr.length) return null;
  return arr.reduce((s, x) => s + x, 0) / arr.length;
}

function fmtAvg(n) {
  return n == null ? '—' : n.toFixed(2);
}

function cuatriLabel(c) {
  if (c === 0) return 'Ingreso';
  return `C${c}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color = '#1a202c' }) {
  return (
    <div className="nd-kpi">
      <div className="nd-kpi-value" style={{ color }}>{value}</div>
      <div className="nd-kpi-label">{label}</div>
      {sub && <div className="nd-kpi-sub">{sub}</div>}
    </div>
  );
}

function HBar({ label, value, count, maxVal = 10 }) {
  const pct = (value / maxVal) * 100;
  const color = gradeColor(value);
  return (
    <div className="nd-hbar-row">
      <div className="nd-hbar-label">{label}</div>
      <div className="nd-hbar-track">
        <div className="nd-hbar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="nd-hbar-val" style={{ color }}>
        {value.toFixed(1)}
        <span className="nd-hbar-count">({count})</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NotasDashboard({ materias, electivas }) {
  const [sortCol, setSortCol] = useState('nota');
  const [sortAsc, setSortAsc] = useState(false);

  // All items with a grade, normalized
  const allItems = useMemo(() => [
    ...materias
      .filter(m => m.nota != null)
      .map(m => ({
        ...m,
        source: 'materia',
        colLabel: cuatriLabel(m.cuatrimestre ?? 0),
      })),
    ...(electivas ?? [])
      .filter(e => e.nota != null)
      .map(e => ({
        ...e,
        source:      'electiva',
        tipo:        'electiva',
        anio:        null,
        cuatrimestre: null,
        colLabel:    'Electiva',
      })),
  ], [materias, electivas]);

  const aprobadas = useMemo(() => allItems.filter(m => m.estado === 'aprobada'), [allItems]);
  const regulares = useMemo(() => allItems.filter(m => m.estado === 'regular'),  [allItems]);

  // KPIs
  const promOblig = useMemo(() => {
    const ns = aprobadas.filter(m => m.source === 'materia' && m.tipo === 'obligatoria').map(m => m.nota);
    return avg(ns);
  }, [aprobadas]);

  const promGeneral = useMemo(() => avg(aprobadas.map(m => m.nota)), [aprobadas]);

  const notaMax = useMemo(() => aprobadas.length ? Math.max(...aprobadas.map(m => m.nota)) : null, [aprobadas]);
  const notaMin = useMemo(() => aprobadas.length ? Math.min(...aprobadas.map(m => m.nota)) : null, [aprobadas]);

  const notaMaxItem = useMemo(() => aprobadas.find(m => m.nota === notaMax), [aprobadas, notaMax]);
  const notaMinItem = useMemo(() => aprobadas.find(m => m.nota === notaMin), [aprobadas, notaMin]);

  // Histogram: count per grade (1–10)
  const distribution = useMemo(() => {
    const counts = Array(11).fill(0);
    for (const m of allItems) {
      const g = Math.round(m.nota);
      if (g >= 1 && g <= 10) counts[g]++;
    }
    const maxCount = Math.max(...counts.slice(1), 1);
    return counts.slice(1).map((count, i) => ({ grade: i + 1, count, maxCount }));
  }, [allItems]);

  // Promedio by cuatrimestre (obligatorias + ingreso)
  const byCuatri = useMemo(() => {
    const groups = {};
    for (const m of materias.filter(m => m.nota != null && m.cuatrimestre != null)) {
      const k = m.cuatrimestre;
      if (!groups[k]) groups[k] = [];
      groups[k].push(m.nota);
    }
    return Object.entries(groups)
      .map(([c, notas]) => ({ cuatrimestre: +c, avg: avg(notas), count: notas.length }))
      .sort((a, b) => a.cuatrimestre - b.cuatrimestre);
  }, [materias]);

  // Promedio by period (all items with período)
  const byPeriodo = useMemo(() => {
    const groups = {};
    for (const m of allItems.filter(m => m.periodo)) {
      if (!groups[m.periodo]) groups[m.periodo] = [];
      groups[m.periodo].push(m.nota);
    }
    return Object.entries(groups)
      .map(([periodo, notas]) => ({ periodo, avg: avg(notas), count: notas.length }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
  }, [allItems]);

  // Trend: compare first-half vs second-half period averages
  const trend = useMemo(() => {
    if (byPeriodo.length < 3) return null;
    const avgs   = byPeriodo.map(p => p.avg);
    const mid    = Math.floor(avgs.length / 2);
    const first  = avg(avgs.slice(0, mid));
    const second = avg(avgs.slice(mid));
    const diff   = second - first;
    if (diff >  0.25) return { icon: '↗', label: `Mejorando (+${diff.toFixed(2)} pts)`, color: '#16a34a' };
    if (diff < -0.25) return { icon: '↘', label: `Bajando (${diff.toFixed(2)} pts)`,    color: '#dc2626' };
    return               { icon: '→', label: 'Rendimiento estable',                      color: '#64748b' };
  }, [byPeriodo]);

  // Sortable table
  const sortedItems = useMemo(() => {
    const items = [...allItems];
    items.sort((a, b) => {
      let va = a[sortCol] ?? (sortAsc ? Infinity : -Infinity);
      let vb = b[sortCol] ?? (sortAsc ? Infinity : -Infinity);
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va === vb) return 0;
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return items;
  }, [allItems, sortCol, sortAsc]);

  function toggleSort(col) {
    if (sortCol === col) setSortAsc(a => !a);
    else { setSortCol(col); setSortAsc(col !== 'nota'); }
  }

  const SortHdr = ({ col, children }) => (
    <th onClick={() => toggleSort(col)} className={sortCol === col ? 'active' : ''} style={{ cursor: 'pointer' }}>
      {children}{sortCol === col ? (sortAsc ? ' ↑' : ' ↓') : ''}
    </th>
  );

  if (allItems.length === 0) {
    return (
      <div className="nd-empty">
        <p>Todavía no hay notas registradas.</p>
        <p>Abrí una materia aprobada o regular desde el Plan de Estudios y cargá la nota.</p>
      </div>
    );
  }

  return (
    <div className="nd-root">

      {/* ── KPIs ── */}
      <div className="nd-kpis">
        <KpiCard
          label="Promedio obligatorias"
          value={fmtAvg(promOblig)}
          color={promOblig ? gradeColor(promOblig) : '#64748b'}
          sub={`${aprobadas.filter(m => m.source === 'materia' && m.tipo === 'obligatoria').length} aprobadas`}
        />
        {promGeneral !== promOblig && (
          <KpiCard
            label="Promedio general"
            value={fmtAvg(promGeneral)}
            color={promGeneral ? gradeColor(promGeneral) : '#64748b'}
            sub="incl. electivas e ingreso"
          />
        )}
        <KpiCard
          label="Nota más alta"
          value={notaMax ?? '—'}
          color={notaMax ? gradeColor(notaMax) : '#64748b'}
          sub={notaMaxItem?.nombre?.split(' ').slice(0, 3).join(' ')}
        />
        <KpiCard
          label="Nota más baja"
          value={notaMin ?? '—'}
          color={notaMin ? gradeColor(notaMin) : '#64748b'}
          sub={notaMinItem?.nombre?.split(' ').slice(0, 3).join(' ')}
        />
        {trend && (
          <KpiCard
            label="Evolución"
            value={trend.icon}
            color={trend.color}
            sub={trend.label}
          />
        )}
        {regulares.length > 0 && (
          <KpiCard
            label="Regulares"
            value={regulares.length}
            color="#ea580c"
            sub="finales pendientes"
          />
        )}
      </div>

      {/* ── Charts row ── */}
      <div className="nd-charts">

        {/* Distribución de notas (histogram) */}
        <div className="nd-card">
          <div className="nd-card-title">Distribución de notas</div>
          <div className="nd-hist">
            {distribution.map(({ grade, count, maxCount }) => (
              <div key={grade} className="nd-hist-col">
                <div className="nd-hist-count">{count > 0 ? count : ''}</div>
                <div
                  className="nd-hist-bar"
                  style={{
                    height: `${(count / maxCount) * 120}px`,
                    background: gradeColor(grade),
                    opacity: count === 0 ? 0.12 : 1,
                  }}
                />
                <div className="nd-hist-grade">{grade}</div>
              </div>
            ))}
          </div>
          <div className="nd-hist-legend">
            {[['< 6','#dc2626'],['6','#ea580c'],['7–8','#0284c7'],['9–10','#16a34a']].map(([l, c]) => (
              <span key={l} className="nd-hist-legend-item">
                <i style={{ background: c }} />{l}
              </span>
            ))}
          </div>
        </div>

        {/* Promedio por cuatrimestre */}
        {byCuatri.length > 0 && (
          <div className="nd-card">
            <div className="nd-card-title">Promedio por cuatrimestre</div>
            <div className="nd-hbars">
              {byCuatri.map(({ cuatrimestre, avg: a, count }) => (
                <HBar key={cuatrimestre} label={cuatriLabel(cuatrimestre)} value={a} count={count} />
              ))}
            </div>
          </div>
        )}

        {/* Evolución por período */}
        {byPeriodo.length > 1 && (
          <div className="nd-card">
            <div className="nd-card-title">Evolución por período</div>
            <div className="nd-hbars">
              {byPeriodo.map(({ periodo, avg: a, count }) => (
                <HBar key={periodo} label={periodo} value={a} count={count} />
              ))}
            </div>
          </div>
        )}

        {/* Regulares en riesgo */}
        {regulares.length > 0 && (
          <div className="nd-card nd-card-risk">
            <div className="nd-card-title">⚠️ Regulares — finales pendientes</div>
            {[...regulares].sort((a, b) => a.nota - b.nota).map(m => (
              <div key={`${m.source}-${m.id}`} className="nd-risk-row">
                <div className="nd-risk-name">{m.nombre}</div>
                <div className="nd-risk-meta">
                  {m.cuatrimestre != null && <span>{cuatriLabel(m.cuatrimestre)}</span>}
                  {m.periodo && <span>{m.periodo}</span>}
                  <span className="nd-risk-nota" style={{ color: gradeColor(m.nota), borderColor: gradeColor(m.nota) + '44' }}>
                    {m.nota}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail table ── */}
      <div className="nd-card nd-table-card">
        <div className="nd-card-title">
          Detalle
          <span className="nd-table-hint">— hacé clic en los encabezados para ordenar</span>
        </div>
        <div className="nd-table-wrap">
          <table className="nd-table">
            <thead>
              <tr>
                <SortHdr col="nombre">Materia</SortHdr>
                <SortHdr col="cuatrimestre">C</SortHdr>
                <SortHdr col="periodo">Período</SortHdr>
                <SortHdr col="nota">Nota</SortHdr>
                <SortHdr col="estado">Estado</SortHdr>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map(m => (
                <tr key={`${m.source}-${m.id}`} className={m.estado === 'regular' ? 'nd-tr-risk' : ''}>
                  <td>{m.nombre}</td>
                  <td>{m.colLabel}</td>
                  <td>{m.periodo ?? '—'}</td>
                  <td>
                    <span
                      className="nd-grade-pill"
                      style={{ color: gradeColor(m.nota), background: gradeColor(m.nota) + '1a', borderColor: gradeColor(m.nota) + '55' }}
                    >
                      {m.nota}
                    </span>
                  </td>
                  <td>
                    <span className={`card-badge badge-${m.estado}`}>{m.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
