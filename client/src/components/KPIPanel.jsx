export default function KPIPanel({ aprobadas, cursando, regulares, total, creditosElectivas }) {
  const pendientes = total - aprobadas - cursando - regulares;

  const chips = [
    { dot: '#4ade80', label: `${aprobadas} aprobadas` },
    { dot: '#67e8f9', label: `${cursando} cursando` },
    { dot: '#fdba74', label: `${regulares} regulares` },
    { dot: '#cbd5e1', label: `${pendientes} pendientes` },
    { dot: '#a78bfa', label: `${creditosElectivas} créditos electivos` },
  ];

  return (
    <div className="kpi-row">
      {chips.map(c => (
        <div key={c.label} className="kpi-chip">
          <span className="dot" style={{ background: c.dot }} />
          {c.label}
        </div>
      ))}
    </div>
  );
}
