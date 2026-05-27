import { AlertTriangle, BookOpen, Layers, Unlock, Info, GraduationCap } from 'lucide-react';

const ANIO_LABEL = { 1: '1er Año', 2: '2do Año', 3: '3er Año', 4: '4to Año' };
const C_LABEL    = { 1:'C1', 2:'C2', 3:'C3', 4:'C4', 5:'C5', 6:'C6', 7:'C7', 8:'C8' };

// tipo: 'obligatoria' | 'electiva' | 'ingreso'
// desbloquea: nombres de materias que se habilitan al aprobar esta
const MATERIAS = [
  // ── Obligatorias 1er Año ─────────────────────────────────────
  { nombre: 'Lógica Simbólica',                                          tipo: 'obligatoria', anio: 1, c: 1, desbloquea: [] },
  { nombre: 'Introducción a la Ciencia de Datos',                        tipo: 'obligatoria', anio: 1, c: 1, desbloquea: [] },
  { nombre: 'Sistemas de Información',                                    tipo: 'obligatoria', anio: 1, c: 1, desbloquea: [] },
  { nombre: 'Programación Orientada a Objetos',                          tipo: 'obligatoria', anio: 1, c: 2, desbloquea: ['Algoritmos y Estructuras de Datos I', 'Programación para Ciencia de Datos'] },
  { nombre: 'Base de Datos I',                                           tipo: 'obligatoria', anio: 1, c: 2, desbloquea: ['Base de Datos II'] },
  { nombre: 'Estadística y Probabilidad',                                tipo: 'obligatoria', anio: 1, c: 2, desbloquea: [] },
  // ── Obligatorias 2do Año ─────────────────────────────────────
  { nombre: 'Introducción a Tecnologías de la Información y las Comunicaciones', tipo: 'obligatoria', anio: 2, c: 3, desbloquea: [] },
  { nombre: 'Algoritmos y Estructuras de Datos I',                       tipo: 'obligatoria', anio: 2, c: 3, desbloquea: ['Algoritmos y Estructuras de Datos II'] },
  { nombre: 'Sistemas Operativos',                                       tipo: 'obligatoria', anio: 2, c: 3, desbloquea: ['Sistemas Operativos Avanzados'] },
  { nombre: 'Base de Datos II',                                          tipo: 'obligatoria', anio: 2, c: 3, desbloquea: ['Seminario de Práctica en Ciencia de Datos'] },
  { nombre: 'Innovación Tecnológica',                                    tipo: 'obligatoria', anio: 2, c: 3, desbloquea: [] },
  { nombre: 'Algoritmos y Estructuras de Datos II',                      tipo: 'obligatoria', anio: 2, c: 4, desbloquea: [] },
  { nombre: 'Metodología de Análisis de Datos Cuantitativos',            tipo: 'obligatoria', anio: 2, c: 4, desbloquea: [] },
  // ── Obligatorias 3er Año ─────────────────────────────────────
  { nombre: 'Inteligencia Artificial',                                   tipo: 'obligatoria', anio: 3, c: 5, desbloquea: ['Aprendizaje Automático', 'Aprendizaje Profundo', 'Procesamiento de Lenguaje Natural'] },
  { nombre: 'Ética y Deontología Profesional',                           tipo: 'obligatoria', anio: 3, c: 5, desbloquea: [] },
  { nombre: 'Seguridad Informática',                                     tipo: 'obligatoria', anio: 3, c: 5, desbloquea: [] },
  { nombre: 'Herramientas Matemáticas VI – Modelos de Simulación',       tipo: 'obligatoria', anio: 3, c: 6, desbloquea: [] },
  { nombre: 'Estrategia',                                                tipo: 'obligatoria', anio: 3, c: 6, desbloquea: [] },
  { nombre: 'Grupo y Liderazgo',                                         tipo: 'obligatoria', anio: 3, c: 6, desbloquea: [] },
  // ── Obligatorias 4to Año ─────────────────────────────────────
  { nombre: 'Desarrollo Emprendedor',                                    tipo: 'obligatoria', anio: 4, c: 7, desbloquea: [] },
  { nombre: 'Oratoria',                                                  tipo: 'obligatoria', anio: 4, c: 7, desbloquea: [] },
  { nombre: 'Emprendimientos Universitarios',                            tipo: 'obligatoria', anio: 4, c: 8, desbloquea: [] },
  { nombre: 'Auditoría de Sistemas',                                     tipo: 'obligatoria', anio: 4, c: 8, desbloquea: [] },
  // ── Materias de Ingreso ───────────────────────────────────────
  { nombre: 'Tecnología, Humanidades y Modelos Globales',                tipo: 'ingreso',     desbloquea: [] },
  { nombre: 'Aprender en el Siglo 21',                                   tipo: 'ingreso',     desbloquea: [] },
  // ── Electivas ────────────────────────────────────────────────
  { nombre: 'Certificaciones Digitales',                                 tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Ciberdelitos',                                              tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Capital Humano Intercultural',                              tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Gestión Sustentable de las Organizaciones',                 tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Marketing Internacional',                                   tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Tecnologías para la Sustentabilidad',                       tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Herramientas Digitales para Emprendedores',                 tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Nuevas Economías e Innovación Social',                      tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Programación Lógica',                                       tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Estudios de Género para la Formación Profesional',          tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Gestión de Equipos de Alto Rendimiento',                    tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Cultsearching Corporativo',                                 tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Responsabilidad Social',                                    tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Marketing Digital',                                         tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Mediación Comunitaria y Cultura de Paz',                    tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Eventos, Ceremonial y Protocolo',                           tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Big Data',                                                  tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Innovación para Nuevos Negocios',                           tipo: 'electiva',    desbloquea: [] },
  { nombre: 'Global Perspectives',                                       tipo: 'electiva',    desbloquea: [] },
];

const obligatorias = MATERIAS.filter(m => m.tipo === 'obligatoria');
const electivas    = MATERIAS.filter(m => m.tipo === 'electiva');
const ingreso      = MATERIAS.filter(m => m.tipo === 'ingreso');

// Group obligatorias by anio
const porAnio = obligatorias.reduce((acc, m) => {
  const key = m.anio;
  if (!acc[key]) acc[key] = [];
  acc[key].push(m);
  return acc;
}, {});

function MateriaRow({ m }) {
  const tieneUnlocks = m.desbloquea?.length > 0;
  return (
    <div className="mv-row">
      <div className="mv-row-left">
        {m.tipo === 'electiva' && (
          <span className="mv-badge mv-badge-electiva" title="Electiva">
            <Layers size={10} strokeWidth={2.5} />
            Electiva
          </span>
        )}
        {m.tipo === 'ingreso' && (
          <span className="mv-badge mv-badge-ingreso" title="Materia de ingreso">
            <GraduationCap size={10} strokeWidth={2.5} />
            Ingreso
          </span>
        )}
        <span className="mv-nombre">{m.nombre}</span>
      </div>
      <div className="mv-row-right">
        {m.tipo === 'obligatoria' && (
          <span className="mv-periodo">
            {ANIO_LABEL[m.anio]} · {C_LABEL[m.c]}
          </span>
        )}
        {tieneUnlocks && (
          <span className="mv-unlocks" title={`Desbloquea: ${m.desbloquea.join(', ')}`}>
            <Unlock size={11} strokeWidth={2.5} />
            {m.desbloquea.length === 1
              ? m.desbloquea[0]
              : `${m.desbloquea.length} materias`}
          </span>
        )}
      </div>
    </div>
  );
}

export default function MateriasVerano() {
  const totalOblig = obligatorias.length;
  const totalElec  = electivas.length;
  const totalIngr  = ingreso.length;

  return (
    <div className="mv-root">

      {/* ── Disclaimer ── */}
      <div className="mv-disclaimer">
        <AlertTriangle size={16} strokeWidth={2} className="mv-disclaimer-icon" aria-hidden="true" />
        <div>
          <strong>Información provisional sujeta a cambios.</strong> Este listado es orientativo y puede modificarse según los criterios de la Universidad Siglo 21. Para confirmar disponibilidad, inscripción y fechas consultá directamente con la Universidad.
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="mv-stats">
        <div className="mv-stat-chip">
          <strong>{MATERIAS.length}</strong>
          <span>total</span>
        </div>
        <div className="mv-stat-chip mv-stat-chip-oblig">
          <strong>{totalOblig}</strong>
          <span>obligatorias</span>
        </div>
        <div className="mv-stat-chip mv-stat-chip-elec">
          <Layers size={12} strokeWidth={2.5} aria-hidden="true" />
          <strong>{totalElec}</strong>
          <span>electivas</span>
        </div>
        <div className="mv-stat-chip mv-stat-chip-ingr">
          <GraduationCap size={12} strokeWidth={2.5} aria-hidden="true" />
          <strong>{totalIngr}</strong>
          <span>ingreso</span>
        </div>
      </div>

      {/* ── Obligatorias por año ── */}
      <div className="efip-view-section-label">
        <BookOpen size={13} aria-hidden="true" />
        Materias del Plan de Estudio
      </div>
      <div className="nd-card mv-list-card">
        {[1, 2, 3, 4].map(anio => (
          <div key={anio} className="mv-anio-group">
            <div className="mv-anio-header">{ANIO_LABEL[anio]}</div>
            {porAnio[anio].map((m, i) => <MateriaRow key={i} m={m} />)}
          </div>
        ))}
      </div>

      {/* ── Ingreso ── */}
      <div className="efip-view-section-label">
        <GraduationCap size={13} aria-hidden="true" />
        Materias de Ingreso
      </div>
      <div className="nd-card mv-list-card">
        {ingreso.map((m, i) => <MateriaRow key={i} m={m} />)}
      </div>

      {/* ── Electivas ── */}
      <div className="efip-view-section-label">
        <Layers size={13} aria-hidden="true" />
        Electivas y Optativas
      </div>
      <div className="nd-card mv-list-card">
        {electivas.map((m, i) => <MateriaRow key={i} m={m} />)}
      </div>

      {/* ── Leyenda ── */}
      <div className="mv-legend">
        <div className="mv-legend-item">
          <span className="mv-badge mv-badge-electiva"><Layers size={10} strokeWidth={2.5} /> Electiva</span>
          <span>Materia no obligatoria de la Lic. en Ciencia de Datos. Puede contabilizar como crédito electivo.</span>
        </div>
        <div className="mv-legend-item">
          <span className="mv-badge mv-badge-ingreso"><GraduationCap size={10} strokeWidth={2.5} /> Ingreso</span>
          <span>Materia del tramo de ingreso universitario.</span>
        </div>
        <div className="mv-legend-item">
          <span className="mv-unlocks mv-unlocks-demo"><Unlock size={11} strokeWidth={2.5} /> Materia</span>
          <span>Aprobar esta materia desbloquea la/s que se indican.</span>
        </div>
        <div className="mv-legend-item">
          <span className="mv-periodo mv-periodo-demo">3er Año · C5</span>
          <span>Año y cuatrimestre en el plan de estudios.</span>
        </div>
        <div className="mv-legend-item">
          <Info size={13} className="mv-legend-info" aria-hidden="true" />
          <span>Las materias sin badge son obligatorias de la carrera.</span>
        </div>
      </div>

    </div>
  );
}
