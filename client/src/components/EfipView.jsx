import { BookOpen, Target, Brain, Database, BarChart2, Cpu, MessageSquare, CheckCircle2, Info } from 'lucide-react';

const MODULE_ICONS = [Brain, Database, BarChart2, Cpu, MessageSquare];

const MODULE_VARIANTS = [
  { color: 'var(--disponible)', bg: 'var(--disponible-bg)', border: 'var(--disponible-border)' },
  { color: 'var(--cursando)',   bg: 'var(--cursando-bg)',   border: 'var(--cursando-border)'   },
  { color: 'var(--aprobada)',   bg: 'var(--aprobada-bg)',   border: 'var(--aprobada-border)'   },
  { color: 'var(--inscripto)',  bg: 'var(--inscripto-bg)',  border: 'var(--inscripto-border)'  },
];

const EFIP_DATA = {
  1: {
    titulo: 'EFIP I',
    subtitulo: 'Examen Final Integrador Presencial',
    fundamentacion: 'El Examen Final Integrador Presencial, EFIP I, constituye una instancia clave del Sistema Educativo a Distancia diseñado por Universidad Siglo 21 y aprobado por el Ministerio de Educación de la Nación, mediante resolución de CONEAU. Forma parte del sistema de evaluación y da cuenta los procedimientos académicos y administrativos de las instancias de evaluación de los aprendizajes y el desarrollo de competencias de escritura y oralidad, y constituye "un vínculo temporalmente sincrónico en la relación docente-alumno". Los Exámenes Finales Integradores Presenciales (EFIP) constituyen parte del modelo académico de Educación a Distancia adoptado por la Universidad Siglo 21 y son de carácter obligatorio.',
    objetivo: 'Obtener una visión cualitativa y cuantitativa de la integración y transferencia que realiza el/la estudiante sobre los conocimientos de las distintas asignaturas en su desarrollo profesional en formación.',
    competencias: [
      {
        tipo: 'Institucional',
        nombre: 'Gestión del conocimiento',
        descripcion: 'Dirige procesos de obtención, construcción, aplicación y comunicación de nuevo conocimiento, en función de la resolución de problemas teóricos o prácticos.',
        ucs: [
          'UC1: Adquisición de información relevante y organizada',
          'UC2: Generación del conocimiento',
          'UC3: Transferencia del conocimiento',
          'UC4: Comunicación del Conocimiento',
        ],
      },
    ],
    modulos: [
      {
        numero: 1,
        titulo: 'Fundamentos de la ciencia de datos',
        temas: [
          '1.1. Introducción a la ciencia de datos',
          '1.2. Macrodatos y su relevancia',
          '1.3. Introducción a la inteligencia artificial y aplicaciones en la ciencia de datos',
        ],
      },
      {
        numero: 2,
        titulo: 'Análisis de datos y programación',
        temas: [
          '2.1. Análisis de datos con R - Studio',
          '2.2. Procesamiento de datos en R - Studio',
          '2.3. Programación en Python para ciencia de datos',
        ],
      },
      {
        numero: 3,
        titulo: 'Bases de datos',
        temas: [
          '3.1. Fundamentos de bases de datos',
          '3.2. Lenguaje SQL',
        ],
      },
      {
        numero: 4,
        titulo: 'Visualización de datos y herramientas avanzadas',
        temas: [
          '4.1. Introducción a la visualización de datos',
          '4.2. Herramientas avanzadas en Python',
          '4.3. Manipulación y análisis de datos avanzados',
          '4.4. Comunicación visual y toma de decisiones',
        ],
      },
    ],
    bibliografia: [
      { codigo: 'INF352', nombre: 'Introducción a la Ciencia de Datos' },
      { codigo: 'INF291', nombre: 'Base de Datos 1' },
      { codigo: 'INF353', nombre: 'Análisis de Datos' },
      { codigo: 'CEX337', nombre: 'Estadística y Probabilidad' },
      { codigo: 'CSS212', nombre: 'Metodología de Análisis de Datos Cuantitativos' },
      { codigo: 'INF354', nombre: 'Visualización de Datos' },
    ],
    metodologia: 'La instancia contempla una evaluación escrita y otra oral sobre los contenidos establecidos por el/la Directora/a de la carrera. Se utiliza la didáctica de casos como instrumentos educativos simulados, que pueden basarse en la vida real o incluir información variada para que el/la estudiante pueda tener un contexto más completo. Al final del caso se presentan las preguntas críticas. Este modelo permite, en caso de ser necesario, el trabajo en grupos para dar respuesta a las indagaciones sobre el caso.',
  },
  2: {
    titulo: 'EFIP II',
    subtitulo: 'Examen Final Integrador Presencial',
    fundamentacion: 'El Examen Final Integrador Presencial (EFIP II) es una instancia fundamental para evaluar los conocimientos y competencias adquiridos por los estudiantes a lo largo de su formación profesional. Forma parte del Sistema Integral de Evaluación y cumple con los requisitos establecidos por la normativa vigente del Sistema Educativo a Distancia, diseñado por la Universidad Siglo 21 y aprobado por el Ministerio de Educación de la Nación mediante resolución de la CONEAU. Este examen integra los procedimientos académicos y administrativos previstos para la evaluación de aprendizajes, así como para el desarrollo de competencias en escritura y oralidad. Representa además un momento de interacción sincrónica entre docentes y estudiantes.',
    objetivo: 'Obtener una visión cualitativa y cuantitativa de la integración y transferencia que realiza el/la estudiante sobre los conocimientos de las distintas asignaturas en su desarrollo profesional en formación.',
    competencias: [
      {
        tipo: 'Institucional',
        nombre: 'Gestión del conocimiento',
        descripcion: 'Dirige procesos de obtención, construcción, aplicación y comunicación de nuevo conocimiento, en función de la resolución de problemas teóricos o prácticos.',
        ucs: [
          'UC1: Adquisición de información relevante y organizada',
          'UC2: Generación del conocimiento',
          'UC3: Transferencia del conocimiento',
          'UC4: Comunicación del Conocimiento',
        ],
      },
      {
        tipo: 'Profesional',
        nombre: 'Explotación de datos en áreas tecnológicas y de sistemas',
        descripcion: '',
        ucs: ['UC2: Analiza grandes datos identificados'],
      },
    ],
    modulos: [
      {
        numero: 1,
        titulo: 'Aprendizaje automático e Inteligencia Artificial',
        temas: [
          '1.1. Algoritmos de aprendizaje automático.',
          '1.2. Conceptos de Inteligencia Artificial.',
          '1.3. Librerías de Python para machine learning.',
        ],
      },
      {
        numero: 2,
        titulo: 'Aprendizaje profundo',
        temas: [
          '2.1. Modelos de Aprendizaje Profundo.',
          '2.2. Arquitecturas y Bibliotecas.',
          '2.3. Redes Neuronales, Algoritmo "Back-Propagation"',
        ],
      },
      {
        numero: 3,
        titulo: 'Procesamiento del Lenguaje Natural',
        temas: [
          '3.1. Expresiones regulares: segmentación y normalización.',
          '3.2. Lematización y radicalización.',
          '3.3. Modelos de Lenguaje Natural.',
        ],
      },
    ],
    bibliografiaTexto: 'Al ser un examen integrador, el alumno —según la temática elegida— deberá remitirse como base, a la bibliografía de las materias que abordan la temática seleccionada. Toda la Bibliografía vista en la carrera hasta el momento.',
    metodologia: 'La instancia contempla una evaluación escrita y otra oral sobre los contenidos establecidos por el/la Directora/a de la carrera. Se utiliza la didáctica de casos como instrumentos educativos simulados, que pueden basarse en la vida real o incluir información variada para que el/la estudiante pueda tener un contexto más completo. Al final del caso se presentan las preguntas críticas. Este modelo permite, en caso de ser necesario, el trabajo en grupos para dar respuesta a las indagaciones sobre el caso.',
  },
};

export default function EfipView({ tipo }) {
  const data = EFIP_DATA[tipo];

  return (
    <div className="efip-view-root">

      {/* ── Hero ── */}
      <div className="efip-view-hero">
        <div className="efip-view-hero-left">
          <span className="efip-view-obligatorio">OBLIGATORIO</span>
          <h2 className="efip-view-titulo">{data.titulo}</h2>
          <p className="efip-view-subtitulo">{data.subtitulo} · Universidad Siglo 21</p>
        </div>
        <div className="efip-view-hero-stats">
          <div className="efip-view-stat">
            <strong>{data.modulos.length}</strong>
            <span>Módulos</span>
          </div>
          <div className="efip-view-stat">
            <strong>{data.modulos.reduce((a, m) => a + m.temas.length, 0)}</strong>
            <span>Temas</span>
          </div>
          <div className="efip-view-stat">
            <strong>2</strong>
            <span>Instancias</span>
          </div>
        </div>
      </div>

      {/* ── Info grid ── */}
      <div className="efip-view-info-grid">
        <div className="nd-card efip-view-info-card">
          <div className="efip-view-card-label">
            <Info size={14} aria-hidden="true" />
            Fundamentación
          </div>
          <p className="efip-view-body-text">{data.fundamentacion}</p>
        </div>
        <div className="nd-card efip-view-info-card">
          <div className="efip-view-card-label">
            <Target size={14} aria-hidden="true" />
            Objetivo general
          </div>
          <p className="efip-view-body-text">{data.objetivo}</p>
        </div>
      </div>

      {/* ── Módulos ── */}
      <div className="efip-view-section-label">Contenido</div>
      <div className="efip-view-modulos-grid" style={{ '--efip-cols': data.modulos.length }}>
        {data.modulos.map((mod, i) => {
          const Icon = MODULE_ICONS[i % MODULE_ICONS.length];
          const v = MODULE_VARIANTS[i % MODULE_VARIANTS.length];
          return (
            <div
              key={mod.numero}
              className="efip-view-modulo"
              style={{ '--mod-color': v.color, '--mod-bg': v.bg, '--mod-border': v.border }}
            >
              <div className="efip-view-modulo-head">
                <div className="efip-view-modulo-icon">
                  <Icon size={16} strokeWidth={2} aria-hidden="true" />
                </div>
                <div>
                  <div className="efip-view-modulo-num">Módulo {mod.numero}</div>
                  <div className="efip-view-modulo-titulo">{mod.titulo}</div>
                </div>
              </div>
              <ul className="efip-view-modulo-list">
                {mod.temas.map((t, j) => (
                  <li key={j} className="efip-view-modulo-item">
                    <CheckCircle2 size={12} strokeWidth={2.5} className="efip-view-check" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* ── Competencias ── */}
      <div className="efip-view-section-label">Competencias</div>
      <div className="efip-view-comp-grid">
        {data.competencias.map((c, i) => (
          <div key={i} className="nd-card efip-view-comp-card">
            <div className="efip-view-comp-tipo">{c.tipo}</div>
            <div className="efip-view-comp-nombre">{c.nombre}</div>
            {c.descripcion && <p className="efip-view-body-text">{c.descripcion}</p>}
            <ul className="efip-view-uc-list">
              {c.ucs.map((uc, j) => (
                <li key={j} className="efip-view-uc-item">{uc}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Bibliografía ── */}
      <div className="efip-view-section-label">
        <BookOpen size={13} aria-hidden="true" />
        Bibliografía
      </div>
      <div className="nd-card efip-view-biblio-card">
        {data.bibliografia ? (
          <div className="efip-view-biblio-chips">
            {data.bibliografia.map((b, i) => (
              <div key={i} className="efip-view-biblio-chip">
                <span className="efip-view-biblio-codigo">{b.codigo}</span>
                <span className="efip-view-biblio-nombre">{b.nombre}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="efip-view-body-text">{data.bibliografiaTexto}</p>
        )}
      </div>

      {/* ── Metodología ── */}
      <div className="efip-view-section-label">Metodología</div>
      <div className="nd-card efip-view-info-card">
        <p className="efip-view-body-text">{data.metodologia}</p>
      </div>

    </div>
  );
}
