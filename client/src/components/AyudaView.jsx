import {
  BookOpen,
  GitBranch,
  Route,
  BarChart3,
  Layers,
  ClipboardList,
  Sun,
  MousePointer,
  CheckCircle2,
  Link,
  Eye,
  HelpCircle,
  ArrowRight,
  Info,
} from 'lucide-react';

const ESTADOS = [
  { key: 'pendiente', label: 'Pendiente',  color: '#64748B', desc: 'Aún no cursada.' },
  { key: 'inscripto', label: 'Inscripto',  color: '#7C3AED', desc: 'Inscripto/a, todavía no iniciada.' },
  { key: 'cursando',  label: 'Cursando',   color: '#0891B2', desc: 'En curso actualmente.' },
  { key: 'regular',   label: 'Regular',    color: '#EA580C', desc: 'Cursada y con final pendiente.' },
  { key: 'aprobada',  label: 'Aprobada',   color: '#16A34A', desc: 'Finalizada con nota.' },
];

const VISTAS = [
  {
    icon: BookOpen,
    label: 'Plan de Estudios',
    desc: 'Vista principal. Muestra todas las materias organizadas por año y cuatrimestre en una grilla. Hacé clic en cualquier materia para editar su estado.',
  },
  {
    icon: GitBranch,
    label: 'Árbol',
    desc: 'Visualización horizontal de dependencias. Las líneas verdes indican prerequisitos cumplidos; las rojas punteadas, prerequisitos pendientes. Pasá el cursor sobre una materia para resaltar sus conexiones.',
  },
  {
    icon: Route,
    label: 'Camino Sugerido',
    desc: 'Propone un orden óptimo para completar la carrera partiendo de tu estado actual, respetando las correlativas.',
  },
  {
    icon: BarChart3,
    label: 'Notas',
    desc: 'Dashboard de analytics con tu promedio general, distribución de notas y comparativa entre años.',
  },
  {
    icon: Layers,
    label: 'Electivas',
    desc: 'Gestión de materias electivas. Podés editar nombre, estado, nota y créditos. Los créditos aprobados cuentan para desbloquear el EFIP II (mínimo 8).',
  },
  {
    icon: ClipboardList,
    label: 'EFIP I / EFIP II',
    desc: 'Contenido oficial de los Exámenes Finales Integradores Presenciales: módulos, temas, competencias, bibliografía y metodología.',
  },
  {
    icon: Sun,
    label: 'Materias de Verano',
    desc: 'Listado orientativo de materias disponibles en el período de verano, con su año/cuatrimestre y relaciones de desbloqueo.',
  },
];

function Step({ n, children }) {
  return (
    <div className="ayuda-step">
      <span className="ayuda-step-n">{n}</span>
      <span className="ayuda-step-text">{children}</span>
    </div>
  );
}

function Tip({ children }) {
  return (
    <div className="ayuda-tip">
      <Info size={13} className="ayuda-tip-icon" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export default function AyudaView() {
  return (
    <div className="efip-view-root ayuda-root">

      {/* ── Hero ── */}
      <div className="efip-view-hero">
        <div className="efip-view-hero-left">
          <span className="efip-view-obligatorio" style={{ background: 'var(--color-primary-accent)' }}>GUÍA DE USO</span>
          <h2 className="efip-view-titulo">Ayuda</h2>
          <p className="efip-view-subtitulo">Seguimiento de carrera · Lic. en Ciencia de Datos UES21</p>
        </div>
        <div className="efip-view-hero-stats">
          <div className="efip-view-stat"><strong>5</strong><span>Estados</span></div>
          <div className="efip-view-stat"><strong>7</strong><span>Vistas</span></div>
          <div className="efip-view-stat"><strong>∞</strong><span>Correlativas</span></div>
        </div>
      </div>

      {/* ── Estado de materias ── */}
      <div className="efip-view-section-label">
        <MousePointer size={13} aria-hidden="true" />
        Cambiar el estado de una materia
      </div>
      <div className="nd-card efip-view-info-card ayuda-card">
        <p className="efip-view-body-text" style={{ marginBottom: 14 }}>
          Cada materia puede estar en uno de cinco estados que reflejan tu progreso. Para cambiarlo:
        </p>
        <Step n={1}>Hacé clic sobre cualquier tarjeta en <strong>Plan de Estudios</strong> o en el <strong>Árbol</strong>.</Step>
        <Step n={2}>Se abre el panel lateral derecho con el detalle de la materia.</Step>
        <Step n={3}>Seleccioná el nuevo estado haciendo clic en uno de los botones de estado.</Step>
        <Step n={4}>Si corresponde, ingresá la nota (escala 0–10) y el período cursado.</Step>
        <Step n={5}>Presioná <strong>Guardar cambios</strong>. La app se actualiza al instante.</Step>
        <Tip>Los cambios se guardan en la base de datos local del servidor. No se necesita conexión a internet.</Tip>

        <div className="ayuda-estados-grid">
          {ESTADOS.map(e => (
            <div key={e.key} className="ayuda-estado-item">
              <span className="card-badge" style={{ background: e.color, color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '.03em', padding: '3px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                {e.label}
              </span>
              <span className="ayuda-estado-desc">{e.desc}</span>
            </div>
          ))}
        </div>

        <div className="ayuda-flujo">
          {ESTADOS.map((e, i) => (
            <span key={e.key} className="ayuda-flujo-row">
              <span className="ayuda-flujo-badge" style={{ background: e.color }}>{e.label}</span>
              {i < ESTADOS.length - 1 && <ArrowRight size={12} className="ayuda-flujo-arrow" />}
            </span>
          ))}
        </div>
      </div>

      {/* ── Correlativas ── */}
      <div className="efip-view-section-label">
        <Link size={13} aria-hidden="true" />
        Correlativas (Prerrequisitos)
      </div>
      <div className="nd-card efip-view-info-card ayuda-card">
        <p className="efip-view-body-text" style={{ marginBottom: 14 }}>
          Una correlativa es una materia que debés tener en estado <strong>Regular</strong> o <strong>Aprobada</strong> para poder cursar otra. Las materias con prerequisitos pendientes aparecen con el estado <span className="ayuda-inline-badge" style={{ background: '#DC2626' }}>Bloqueada</span>.
        </p>

        <div className="ayuda-subsection-label">Ver prerequisitos de una materia</div>
        <Step n={1}>Abrí la materia haciendo clic en su tarjeta.</Step>
        <Step n={2}>En el panel lateral, la sección <em>«Para cursar, necesitás»</em> muestra todas sus correlativas con su estado actual (✅ cumplida / 🔒 pendiente).</Step>
        <Step n={3}>La sección <em>«Al aprobarla, desbloqueás»</em> muestra qué materias se habilitarán.</Step>

        <div className="ayuda-subsection-label" style={{ marginTop: 12 }}>Agregar o eliminar una correlativa</div>
        <Step n={1}>Abrí el panel lateral de la materia destino.</Step>
        <Step n={2}>En la sección de correlativas, usá el desplegable <em>«Agregar correlativa…»</em> y seleccioná la materia prerequisito.</Step>
        <Step n={3}>Presioná <strong>Agregar</strong>. Para eliminarla, hacé clic en el botón ✕ junto a la correlativa.</Step>
        <Tip>En la vista Árbol podés ver todas las relaciones de correlativas de un vistazo. Las líneas verdes son prerequisitos cumplidos; las rojas punteadas son prerequisitos faltantes.</Tip>
      </div>

      {/* ── Electivas ── */}
      <div className="efip-view-section-label">
        <Layers size={13} aria-hidden="true" />
        Electivas y créditos
      </div>
      <div className="nd-card efip-view-info-card ayuda-card">
        <p className="efip-view-body-text" style={{ marginBottom: 14 }}>
          Las materias electivas son optativas: podés elegir cuáles cursás. Cada una tiene un valor en <strong>créditos</strong>. Para rendir el <strong>EFIP II</strong> necesitás al menos <strong>8 créditos</strong> de electivas aprobadas.
        </p>
        <Step n={1}>Ir a la pestaña <strong>Electivas</strong> en el menú lateral.</Step>
        <Step n={2}>Hacé clic en cualquier electiva para editar su nombre, estado, nota y créditos.</Step>
        <Step n={3}>El panel de KPIs en el encabezado muestra el total de créditos electivos aprobados en tiempo real.</Step>
        <Tip>Las electivas asignadas a un cuatrimestre aparecen también en la vista Árbol junto a las materias de ese período.</Tip>
      </div>

      {/* ── Notas ── */}
      <div className="efip-view-section-label">
        <BarChart3 size={13} aria-hidden="true" />
        Notas y privacidad
      </div>
      <div className="nd-card efip-view-info-card ayuda-card">
        <p className="efip-view-body-text" style={{ marginBottom: 14 }}>
          Las notas se ingresan en escala <strong>0 a 10</strong> (se aceptan decimales, por ejemplo 7.5). Una vez cargadas, aparecen como barra de progreso en cada tarjeta del Plan de Estudios.
        </p>
        <Step n={1}>Para cargar o editar una nota, abrí el panel lateral de la materia.</Step>
        <Step n={2}>Ingresá el valor en el campo <em>«Nota (0–10)»</em> (visible cuando el estado es Inscripto, Cursando, Regular o Aprobada).</Step>
        <Step n={3}>Guardá los cambios.</Step>

        <div className="ayuda-subsection-label" style={{ marginTop: 12 }}>Modo privacidad</div>
        <p className="efip-view-body-text">
          El botón <Eye size={12} style={{ display: 'inline', verticalAlign: 'middle' }} aria-hidden="true" /> <strong>Ocultar notas</strong> en el encabezado oculta todos los valores numéricos de la app — útil para hacer capturas de pantalla sin exponer tus calificaciones. El estado se recuerda entre sesiones.
        </p>
      </div>

      {/* ── Vistas ── */}
      <div className="efip-view-section-label">
        <BookOpen size={13} aria-hidden="true" />
        Vistas disponibles
      </div>
      <div className="ayuda-vistas-grid">
        {VISTAS.map((v, i) => {
          const Icon = v.icon;
          const colors = [
            { color: 'var(--disponible)', bg: 'var(--disponible-bg)', border: 'var(--disponible-border)' },
            { color: 'var(--cursando)',   bg: 'var(--cursando-bg)',   border: 'var(--cursando-border)'   },
            { color: 'var(--aprobada)',   bg: 'var(--aprobada-bg)',   border: 'var(--aprobada-border)'   },
            { color: 'var(--inscripto)',  bg: 'var(--inscripto-bg)',  border: 'var(--inscripto-border)'  },
          ];
          const c = colors[i % colors.length];
          return (
            <div key={v.label} className="ayuda-vista-item" style={{ '--mod-color': c.color, '--mod-bg': c.bg, '--mod-border': c.border }}>
              <div className="ayuda-vista-head">
                <div className="efip-view-modulo-icon"><Icon size={16} strokeWidth={2} aria-hidden="true" /></div>
                <div>
                  <div className="efip-view-modulo-num">Vista</div>
                  <div className="efip-view-modulo-titulo">{v.label}</div>
                </div>
              </div>
              <p className="ayuda-vista-desc">{v.desc}</p>
            </div>
          );
        })}
      </div>

      {/* ── Controles generales ── */}
      <div className="efip-view-section-label">
        <HelpCircle size={13} aria-hidden="true" />
        Controles generales
      </div>
      <div className="nd-card efip-view-info-card ayuda-card">
        <div className="ayuda-controles-grid">
          <div className="ayuda-control-item">
            <div className="ayuda-control-icon"><Eye size={16} strokeWidth={2} /></div>
            <div>
              <div className="ayuda-control-label">Ocultar / Mostrar notas</div>
              <div className="ayuda-control-desc">Botón en el encabezado. Oculta todos los valores numéricos para capturas de pantalla. Persiste entre sesiones.</div>
            </div>
          </div>
          <div className="ayuda-control-item">
            <div className="ayuda-control-icon"><Sun size={16} strokeWidth={2} /></div>
            <div>
              <div className="ayuda-control-label">Tema claro / oscuro</div>
              <div className="ayuda-control-desc">Ícono en la parte inferior del menú lateral. Alterna entre modo claro y modo oscuro. Se guarda en el navegador.</div>
            </div>
          </div>
          <div className="ayuda-control-item">
            <div className="ayuda-control-icon"><CheckCircle2 size={16} strokeWidth={2} /></div>
            <div>
              <div className="ayuda-control-label">Barra de progreso global</div>
              <div className="ayuda-control-desc">En el encabezado muestra el porcentaje de materias obligatorias aprobadas sobre el total del plan.</div>
            </div>
          </div>
          <div className="ayuda-control-item">
            <div className="ayuda-control-icon"><Info size={16} strokeWidth={2} /></div>
            <div>
              <div className="ayuda-control-label">Alertas automáticas</div>
              <div className="ayuda-control-desc">El panel de alertas en Plan de Estudios notifica materias disponibles para cursar y créditos electivos faltantes para el EFIP II.</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Datos y almacenamiento ── */}
      <div className="efip-view-section-label">
        <Info size={13} aria-hidden="true" />
        Datos y almacenamiento
      </div>
      <div className="nd-card efip-view-info-card ayuda-card">
        <p className="efip-view-body-text">
          Toda la información (estados, notas, correlativas, electivas) se guarda en una base de datos <strong>SQLite local</strong> que gestiona el servidor Express incluido en el proyecto. Los datos no se envían a ningún servidor externo.
        </p>
        <Tip>Si reiniciás el servidor con una base de datos nueva, se recrean las materias y correlativas del plan oficial. Los datos personales (estados, notas) no se recuperan automáticamente — hacé backup del archivo <code>db.sqlite</code> si necesitás conservarlos.</Tip>
      </div>

    </div>
  );
}
