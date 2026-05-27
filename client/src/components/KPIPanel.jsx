import { BookOpen, CheckCircle2, Clock3, Layers, Trophy } from 'lucide-react';

export default function KPIPanel({ aprobadas, cursando, regulares, total, creditosElectivas }) {
  const pendientes = total - aprobadas - cursando - regulares;

  const cards = [
    { icon: CheckCircle2, tone: 'success', value: aprobadas, label: 'Aprobadas' },
    { icon: BookOpen, tone: 'info', value: cursando, label: 'Cursando' },
    { icon: Clock3, tone: 'warning', value: regulares, label: 'Regulares' },
    { icon: Layers, tone: 'neutral', value: pendientes, label: 'Pendientes' },
    { icon: Trophy, tone: 'primary', value: creditosElectivas, label: 'Créditos electivos' },
  ];

  return (
    <div className="kpi-row">
      {cards.map(c => {
        const Icon = c.icon;
        return (
        <div key={c.label} className={`kpi-card kpi-${c.tone}`}>
          <span className="kpi-icon">
            <Icon size={18} strokeWidth={2.4} aria-hidden="true" />
          </span>
          <span>
            <strong>{c.value}</strong>
            <small>{c.label}</small>
          </span>
        </div>
        );
      })}
    </div>
  );
}
