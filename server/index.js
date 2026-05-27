const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, '..', 'datos.db');
const db = new Database(DB_PATH);

// ─── Schema ───────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS materias (
    id          INTEGER PRIMARY KEY,
    nombre      TEXT    NOT NULL,
    anio        INTEGER,
    cuatrimestre INTEGER,
    tipo        TEXT    DEFAULT 'obligatoria',
    estado      TEXT    DEFAULT 'pendiente',
    nota        REAL,
    periodo     TEXT
  );

  CREATE TABLE IF NOT EXISTS correlativas (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    materia_id    INTEGER NOT NULL,
    correlativa_id INTEGER NOT NULL,
    UNIQUE(materia_id, correlativa_id),
    FOREIGN KEY (materia_id)     REFERENCES materias(id),
    FOREIGN KEY (correlativa_id) REFERENCES materias(id)
  );

  CREATE TABLE IF NOT EXISTS electivas (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre    TEXT NOT NULL,
    creditos  INTEGER DEFAULT 1,
    estado    TEXT DEFAULT 'pendiente',
    proveedor TEXT,
    periodo   TEXT,
    nota      REAL,
    cuatrimestre INTEGER
  );
`);

// ─── Seed ─────────────────────────────────────────────────────────────────────
const { n: total } = db.prepare('SELECT COUNT(*) as n FROM materias').get();

if (total === 0) {
  const insertM = db.prepare(
    'INSERT INTO materias (id, nombre, anio, cuatrimestre, tipo, estado) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const materias = [
    // 1er Año – C1
    [1,  'Álgebra y Geometría',                                       1, 1, 'obligatoria', 'pendiente'],
    [2,  'Lógica Simbólica',                                          1, 1, 'obligatoria', 'pendiente'],
    [3,  'Introducción a la Ciencia de Datos',                        1, 1, 'obligatoria', 'pendiente'],
    [4,  'Sistemas de Información',                                    1, 1, 'obligatoria', 'pendiente'],
    [5,  'Introducción a los Algoritmos',                             1, 1, 'obligatoria', 'pendiente'],
    [6,  'Idioma Extranjero I',                                       1, 1, 'obligatoria', 'pendiente'],
    // 1er Año – C2
    [7,  'Análisis Matemático',                                       1, 2, 'obligatoria', 'pendiente'],
    [8,  'Programación Orientada a Objetos',                          1, 2, 'obligatoria', 'pendiente'],
    [9,  'Análisis de Datos',                                         1, 2, 'obligatoria', 'pendiente'],
    [10, 'Estadística y Probabilidad',                                1, 2, 'obligatoria', 'pendiente'],
    [11, 'Base de Datos I',                                           1, 2, 'obligatoria', 'pendiente'],
    [12, 'Idioma Extranjero II',                                      1, 2, 'obligatoria', 'pendiente'],
    // 2do Año – C3
    [13, 'Intro. a Tecnologías de Información y Comunicaciones',      2, 3, 'obligatoria', 'pendiente'],
    [14, 'Algoritmos y Estructuras de Datos I',                       2, 3, 'obligatoria', 'pendiente'],
    [15, 'Sistemas Operativos',                                       2, 3, 'obligatoria', 'pendiente'],
    [16, 'Base de Datos II',                                          2, 3, 'obligatoria', 'pendiente'],
    [17, 'Innovación Tecnológica',                                    2, 3, 'obligatoria', 'pendiente'],
    [18, 'Idioma Extranjero III',                                     2, 3, 'obligatoria', 'pendiente'],
    // 2do Año – C4
    [19, 'Sistemas Operativos Avanzados',                             2, 4, 'obligatoria', 'pendiente'],
    [20, 'Algoritmos y Estructuras de Datos II',                      2, 4, 'obligatoria', 'pendiente'],
    [21, 'Comunicaciones',                                            2, 4, 'obligatoria', 'pendiente'],
    [22, 'Programación para Ciencia de Datos',                        2, 4, 'obligatoria', 'pendiente'],
    [23, 'Metodología de Análisis de Datos Cuantitativos',            2, 4, 'obligatoria', 'pendiente'],
    [24, 'Idioma Extranjero IV',                                      2, 4, 'obligatoria', 'pendiente'],
    // 3er Año – C5
    [25, 'Inteligencia Artificial',                                   3, 5, 'obligatoria', 'pendiente'],
    [26, 'Legislación de Proyectos Tecnológicos',                     3, 5, 'obligatoria', 'pendiente'],
    [27, 'Seguridad Informática',                                     3, 5, 'obligatoria', 'pendiente'],
    [28, 'Visualización de Datos',                                    3, 5, 'obligatoria', 'pendiente'],
    [29, 'Ética y Deontología Profesional',                           3, 5, 'obligatoria', 'pendiente'],
    [30, 'Idioma Extranjero V',                                       3, 5, 'obligatoria', 'pendiente'],
    // 3er Año – C6
    [31, 'Herramientas Matemáticas VI – Modelos de Simulación',       3, 6, 'obligatoria', 'pendiente'],
    [32, 'Estrategia',                                                3, 6, 'obligatoria', 'pendiente'],
    [33, 'Computación en la Nube',                                    3, 6, 'obligatoria', 'pendiente'],
    [34, 'Grupo y Liderazgo',                                         3, 6, 'obligatoria', 'pendiente'],
    [35, 'Idioma Extranjero VI',                                      3, 6, 'obligatoria', 'pendiente'],
    [36, 'Seminario de Práctica en Ciencia de Datos',                 3, 6, 'obligatoria', 'pendiente'],
    // 4to Año – C7
    [37, 'Privacidad y Seguridad de los Datos',                       4, 7, 'obligatoria', 'pendiente'],
    [38, 'Aprendizaje Automático',                                    4, 7, 'obligatoria', 'pendiente'],
    [39, 'Desarrollo Emprendedor',                                    4, 7, 'obligatoria', 'pendiente'],
    [40, 'Inteligencia de Negocios',                                  4, 7, 'obligatoria', 'pendiente'],
    [41, 'Oratoria',                                                  4, 7, 'obligatoria', 'pendiente'],
    [42, 'Práctica Profesional en Ciencia de Datos',                  4, 7, 'obligatoria', 'pendiente'],
    // 4to Año – C8
    [43, 'Procesamiento de Lenguaje Natural',                         4, 8, 'obligatoria', 'pendiente'],
    [44, 'Metodología de Diseño y Planificación de Proyectos',        4, 8, 'obligatoria', 'pendiente'],
    [45, 'Aprendizaje Profundo',                                      4, 8, 'obligatoria', 'pendiente'],
    [46, 'Auditoría de Sistemas',                                     4, 8, 'obligatoria', 'pendiente'],
    [47, 'Emprendimientos Universitarios',                            4, 8, 'obligatoria', 'pendiente'],
    [48, 'Seminario Final en Ciencia de Datos',                       4, 8, 'obligatoria', 'pendiente'],
    // Requisitos especiales
    [49, 'Práctica Solidaria',                                        null, null, 'requisito', 'pendiente'],
  ];

  const seedMaterias = db.transaction(() => {
    for (const row of materias) insertM.run(...row);
  });
  seedMaterias();

  const insertC = db.prepare(
    'INSERT OR IGNORE INTO correlativas (materia_id, correlativa_id) VALUES (?, ?)'
  );

  // [materia_id, correlativa_id]  → "para cursar materia_id necesitás correlativa_id"
  const correlativas = [
    // Idiomas progresivos
    [12, 6], [18, 12], [24, 18], [30, 24], [35, 30],
    // C1 → C2
    [7, 1],  [8, 5],  [9, 3],  [10, 1], [11, 4],
    // C2 → C3
    [14, 8], [14, 5], [16, 11],
    // C3 → C4
    [19, 15], [20, 14], [21, 13], [22, 8], [22, 9], [23, 10],
    // C4 → C5
    [25, 20], [25, 10], [27, 19], [28, 22],
    // C5 → C6
    [31, 7],  [31, 10], [33, 19], [33, 21], [36, 25], [36, 22],
    // C6 → C7
    [37, 27], [38, 25], [40, 16], [40, 22], [42, 36],
    // C7 → C8
    [43, 38], [44, 23], [45, 38], [46, 27], [47, 39], [48, 42],
  ];

  const seedCorr = db.transaction(() => {
    for (const [m, c] of correlativas) insertC.run(m, c);
  });
  seedCorr();
}

// ─── Migrations: add new entries idempotently ──────────────────────────────────
{
  const upsert = db.prepare(
    'INSERT OR IGNORE INTO materias (id, nombre, anio, cuatrimestre, tipo, estado, nota, periodo) VALUES (?,?,?,?,?,?,?,?)'
  );
  const migrations = [
    // EFIPs (tipo='examen', no cuentan en el total de materias obligatorias)
    [50, 'EFIP I — Examen Final Integrador Parcial',  3, 6, 'examen',  'pendiente', null, null],
    [51, 'EFIP II — Examen Final Integrador Total',   4, 8, 'examen',  'pendiente', null, null],
    // Materias de ingreso (pre-aprobadas)
    [52, 'Aprender en el Siglo 21',                  null, 0, 'ingreso', 'aprobada', 9,  '2024-1'],
    [53, 'Tecnología, Humanidades y Modelos Globales', null, 0, 'ingreso', 'aprobada', 10, '2024-1'],
  ];
  for (const row of migrations) upsert.run(...row);

  // Práctica Solidaria pasa a ser obligatoria del 2° año, 3er cuatrimestre
  db.prepare(
    "UPDATE materias SET tipo='obligatoria', anio=2, cuatrimestre=3 WHERE id=49 AND tipo='requisito'"
  ).run();

  // Agrega cuatrimestre a electivas (idempotente)
  try { db.exec('ALTER TABLE electivas ADD COLUMN cuatrimestre INTEGER'); } catch (_) {}

  // Correlativas oficiales de EFIP I y EFIP II (editables desde la app)
  const upsertCorr = db.prepare(
    'INSERT OR IGNORE INTO correlativas (materia_id, correlativa_id) VALUES (?, ?)'
  );
  const efipCorrelativas = [
    // EFIP I
    [50, 3],  // Introducción a la Ciencia de Datos
    [50, 11], // Base de Datos I
    [50, 9],  // Análisis de Datos
    [50, 10], // Estadística y Probabilidad
    [50, 23], // Metodología de Análisis de Datos Cuantitativos
    [50, 28], // Visualización de Datos
    // EFIP II
    [51, 50], // EFIP I
    [51, 25], // Inteligencia Artificial
    [51, 38], // Aprendizaje Automático
    [51, 45], // Aprendizaje Profundo
    [51, 43], // Procesamiento de Lenguaje Natural
    [51, 48], // Seminario Final en Ciencia de Datos
  ];
  for (const row of efipCorrelativas) upsertCorr.run(...row);
}

// ─── Materias ─────────────────────────────────────────────────────────────────
app.get('/api/materias', (_req, res) => {
  const materias     = db.prepare('SELECT * FROM materias ORDER BY cuatrimestre, id').all();
  const correlativas = db.prepare('SELECT * FROM correlativas').all();

  const corrMap = {};
  for (const c of correlativas) {
    if (!corrMap[c.materia_id]) corrMap[c.materia_id] = [];
    corrMap[c.materia_id].push(c);
  }

  res.json(materias.map(m => ({ ...m, correlativas: corrMap[m.id] || [] })));
});

app.put('/api/materias/:id', (req, res) => {
  const { id } = req.params;
  const { estado, nota, periodo } = req.body;
  db.prepare('UPDATE materias SET estado=?, nota=?, periodo=? WHERE id=?')
    .run(estado, nota ?? null, periodo ?? null, id);
  res.json({ ok: true });
});

// ─── Correlativas ─────────────────────────────────────────────────────────────
app.get('/api/correlativas', (_req, res) => {
  const rows = db.prepare(`
    SELECT c.id, c.materia_id, c.correlativa_id,
           m1.nombre AS materia_nombre,
           m2.nombre AS correlativa_nombre
    FROM correlativas c
    JOIN materias m1 ON c.materia_id     = m1.id
    JOIN materias m2 ON c.correlativa_id = m2.id
    ORDER BY m1.cuatrimestre, m1.id
  `).all();
  res.json(rows);
});

app.post('/api/correlativas', (req, res) => {
  const { materia_id, correlativa_id } = req.body;
  try {
    const r = db.prepare('INSERT OR IGNORE INTO correlativas (materia_id, correlativa_id) VALUES (?, ?)')
      .run(materia_id, correlativa_id);
    res.json({ ok: true, id: r.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/correlativas/:id', (req, res) => {
  db.prepare('DELETE FROM correlativas WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ─── Electivas ────────────────────────────────────────────────────────────────
app.get('/api/electivas', (_req, res) => {
  res.json(db.prepare('SELECT * FROM electivas ORDER BY id').all());
});

app.post('/api/electivas', (req, res) => {
  const { nombre, creditos, estado = 'pendiente', proveedor, periodo, nota, cuatrimestre } = req.body;
  const r = db.prepare(
    'INSERT INTO electivas (nombre, creditos, estado, proveedor, periodo, nota, cuatrimestre) VALUES (?,?,?,?,?,?,?)'
  ).run(nombre, creditos ?? null, estado, proveedor ?? null, periodo ?? null, nota ?? null, cuatrimestre ?? null);
  res.json({ ok: true, id: r.lastInsertRowid });
});

app.put('/api/electivas/:id', (req, res) => {
  const { nombre, creditos, estado, proveedor, periodo, nota, cuatrimestre } = req.body;
  db.prepare(
    'UPDATE electivas SET nombre=?, creditos=?, estado=?, proveedor=?, periodo=?, nota=?, cuatrimestre=? WHERE id=?'
  ).run(nombre, creditos ?? null, estado, proveedor ?? null, periodo ?? null, nota ?? null, cuatrimestre ?? null, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/electivas/:id', (req, res) => {
  db.prepare('DELETE FROM electivas WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ─── Stats ────────────────────────────────────────────────────────────────────
app.get('/api/stats', (_req, res) => {
  const materias   = db.prepare("SELECT * FROM materias WHERE tipo = 'obligatoria'").all();
  const electivas  = db.prepare('SELECT * FROM electivas').all();
  const total      = materias.length;
  const aprobadas  = materias.filter(m => m.estado === 'aprobada').length;
  const cursando   = materias.filter(m => m.estado === 'cursando').length;
  const regulares  = materias.filter(m => m.estado === 'regular').length;
  const creditosElectivas = electivas
    .filter(e => e.estado === 'aprobada')
    .reduce((s, e) => s + e.creditos, 0);

  res.json({ total, aprobadas, cursando, regulares, creditosElectivas });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = 3001;
app.listen(PORT, () => console.log(`API corriendo en http://localhost:${PORT}`));
