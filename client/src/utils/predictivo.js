/**
 * Períodos académicos UES21
 *
 * 1A: 15 Mar – 15 May
 * 1B: 15 May – 15 Jul
 * 2A: 15 Ago – 15 Oct
 * 2B: 15 Oct – 15 Dic
 *
 * periodos_dictado: 'A' → disponible en 1A y 2A
 *                  'B' → disponible en 1B y 2B
 *                  null → disponible en todos
 *
 * Idioma Extranjero I–VI (IDs 6,12,18,24,30,35):
 *   - Bloque anual: inicia en 1A, finaliza en 2B del mismo año.
 *   - Ocupa 1 slot por período durante los 4 períodos.
 *   - Al final (2B) se aprueban los 6 simultáneamente.
 *   - Solo puede iniciar en período 1A.
 *
 * Tratamiento de inscripto vs cursando:
 *   - cursando: ya está en curso en el período actual → effectiveDone al inicio
 *   - inscripto: está anotado para el próximo período → se muestra en ese período
 *               y sus dependientes solo quedan disponibles en el período siguiente
 */

const PERIOD_SEQ = ['1A', '1B', '2A', '2B'];

export const PERIOD_LABEL = {
  '1A': '1° A',
  '1B': '1° B',
  '2A': '2° A',
  '2B': '2° B',
};

export const PERIOD_DATES = {
  '1A': 'Mar 15 – May 15',
  '1B': 'May 15 – Jul 15',
  '2A': 'Ago 15 – Oct 15',
  '2B': 'Oct 15 – Dic 15',
};

export const PERIOD_END_MONTH = {
  '1A': 'mayo',
  '1B': 'julio',
  '2A': 'octubre',
  '2B': 'diciembre',
};

// IDs de Idioma Extranjero I–VI (bloque anual)
const IDIOMA_IDS = new Set([6, 12, 18, 24, 30, 35]);

const IDIOMA_START = {
  id: '__idioma__',
  nombre: 'Idioma Extranjero I–VI',
  tipo: 'idioma_grupo',
  cuatrimestre: 1,
  periodos_dictado: null,
  correlativas: [],
};
const IDIOMA_ONGOING = {
  id: '__idioma_ongoing__',
  nombre: 'Idioma Extranjero I–VI',
  tipo: 'idioma_ongoing',
  cuatrimestre: 1,
  periodos_dictado: null,
  correlativas: [],
};

// ─── Period helpers ────────────────────────────────────────────────────────────

export function detectPeriodContext(date = new Date()) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const y = date.getFullYear();

  const inRange = (sm, sd, em, ed) =>
    (m > sm || (m === sm && d >= sd)) && (m < em || (m === em && d < ed));

  if (inRange(3, 15, 5, 15)) return { current: '1A', scheduleFrom: '1B', scheduleYear: y };
  if (inRange(5, 15, 7, 15)) return { current: '1B', scheduleFrom: '2A', scheduleYear: y };
  if (inRange(8, 15, 10, 15)) return { current: '2A', scheduleFrom: '2B', scheduleYear: y };
  if (inRange(10, 15, 12, 15)) return { current: '2B', scheduleFrom: '1A', scheduleYear: y + 1 };

  // Receso / inscripción
  if (m < 3 || (m === 3 && d < 15)) return { current: null, scheduleFrom: '1A', scheduleYear: y };
  if ((m === 7 && d >= 15) || (m === 8 && d < 15)) return { current: null, scheduleFrom: '2A', scheduleYear: y };
  if (m === 12 && d >= 15) return { current: null, scheduleFrom: '1A', scheduleYear: y + 1 };
  return { current: null, scheduleFrom: '1A', scheduleYear: y };
}

function advancePeriod(period, year) {
  const idx = PERIOD_SEQ.indexOf(period);
  if (idx === PERIOD_SEQ.length - 1) return { period: '1A', year: year + 1 };
  return { period: PERIOD_SEQ[idx + 1], year };
}

// 'A' → matches 1A and 2A  |  'B' → matches 1B and 2B  |  null → all
function periodAllowed(periodos_dictado, period) {
  if (!periodos_dictado) return true;
  return period.endsWith(periodos_dictado);
}

function countDirectUnlocks(id, remaining) {
  let n = 0;
  for (const m of remaining.values())
    if ((m.correlativas ?? []).some(c => c.correlativa_id === id)) n++;
  return n;
}

const MAX_ITER = 80;

// Seminario Final (48) y EFIP II (51) van siempre juntos en el último período
const LAST_GROUP_IDS = new Set([48, 51]);

// ─── Main scheduler ───────────────────────────────────────────────────────────

const CREDITOS_REQUERIDOS = 8;
const CREDITOS_POR_ELECTIVA = 4;

/**
 * @param {Array}  materias
 * @param {Array}  [electivas]
 * @param {object} [opts]
 * @param {number} [opts.maxPerPeriod=3]
 * @returns {{ schedule, stuck, stuckItems, stats }}
 */
export function buildPredictiveSchedule(materias, electivas = [], opts = {}) {
  const maxPerPeriod = opts.maxPerPeriod ?? 3;

  const doneIds = new Set(
    materias.filter(m => m.estado === 'aprobada' || m.estado === 'regular').map(m => m.id)
  );

  // cursando: en curso en el período actual → se considera terminado al inicio del schedule
  const cursandoIds = new Set(
    materias.filter(m => m.estado === 'cursando').map(m => m.id)
  );

  // inscripto: anotado para el próximo período → ocupa slots en ese período
  // sus dependientes solo se desbloquean al finalizar ese período
  const inscriptoIds = new Set(
    materias.filter(m => m.estado === 'inscripto').map(m => m.id)
  );

  const inProgressIds = new Set([...cursandoIds, ...inscriptoIds]);

  // Separate idioma subjects from the rest
  const toSchedule = materias.filter(m =>
    (m.tipo === 'obligatoria' || m.tipo === 'examen') &&
    !doneIds.has(m.id) && !inProgressIds.has(m.id)
  );
  const idiomaSubjects = toSchedule.filter(m => IDIOMA_IDS.has(m.id));
  const hasIdioma      = idiomaSubjects.length > 0;

  const { current, scheduleFrom, scheduleYear } = detectPeriodContext(new Date());

  const schedule = [];

  // cursando → mostrar en período actual (ya están finalizando)
  const cursandoSubjects = materias.filter(
    m => cursandoIds.has(m.id) && (m.tipo === 'obligatoria' || m.tipo === 'examen')
  );
  if (current && cursandoSubjects.length > 0) {
    schedule.push({ year: new Date().getFullYear(), period: current, status: 'current', items: cursandoSubjects });
  }

  // inscripto → se mostrarán en el primer período planificado (scheduleFrom)
  // Excluimos idioma del grupo inscripto (se maneja aparte si correspondiera)
  const inscriptoSubjects = materias.filter(
    m => inscriptoIds.has(m.id) &&
    (m.tipo === 'obligatoria' || m.tipo === 'examen') &&
    !IDIOMA_IDS.has(m.id)
  );

  // effectiveDone: aprobadas + regulares + cursando
  // Los inscripto NO están aquí aún — se agregan al terminar el período en que están anotados
  const effectiveDone = new Set([...doneIds, ...cursandoIds]);

  // ── Electivas ────────────────────────────────────────────────────
  // Créditos ya cubiertos (aprobada o cursando — no requieren slot en el schedule)
  const creditosCubiertos = electivas
    .filter(e => e.estado === 'aprobada' || e.estado === 'cursando')
    .reduce((s, e) => s + (e.creditos ?? CREDITOS_POR_ELECTIVA), 0);

  // Electivas reales a schedulear (pendiente e inscripto — van en el timeline)
  const electivasReales = electivas.filter(
    e => e.estado === 'pendiente' || e.estado === 'inscripto'
  );
  const creditosDeReales = electivasReales.reduce(
    (s, e) => s + (e.creditos ?? CREDITOS_POR_ELECTIVA), 0
  );

  // Gap que no cubre ninguna electiva real → rellenar con virtuales genéricas
  const creditosFaltantes   = Math.max(0, CREDITOS_REQUERIDOS - creditosCubiertos - creditosDeReales);
  const numVirtuales        = Math.ceil(creditosFaltantes / CREDITOS_POR_ELECTIVA);

  // Convertir electivas reales a objetos schedulables (con nombre real y período si está definido)
  const electivasRealesSchedule = electivasReales.map(e => ({
    id:              `__electiva_real_${e.id}__`,
    nombre:          e.nombre,
    tipo:            'electiva_virtual',
    cuatrimestre:    99,
    // Si tiene período específico, usarlo como restricción de tramo
    periodos_dictado: e.periodo_tramo ? e.periodo_tramo.slice(-1) : null, // '1A'→'A', '2B'→'B'
    _periodo_anio:   e.periodo_anio  ?? null,
    _periodo_tramo:  e.periodo_tramo ?? null,
    correlativas:    [],
    _esReal:         true,
  }));

  // Genéricas para el gap residual (numeradas a partir de las reales)
  const offset = electivasReales.length;
  const electivasGenericas = Array.from({ length: numVirtuales }, (_, i) => ({
    id:              `__electiva_${offset + i + 1}__`,
    nombre:          `Electiva ${offset + i + 1}`,
    tipo:            'electiva_virtual',
    cuatrimestre:    99,
    periodos_dictado: null,
    correlativas:    [],
  }));

  const electivasVirtuales = [...electivasRealesSchedule, ...electivasGenericas];

  // Build remaining map (WITHOUT idioma subjects — they're handled as a group)
  const remaining = new Map(
    toSchedule.filter(m => !IDIOMA_IDS.has(m.id)).map(m => [m.id, m])
  );

  // Agregar electivas virtuales al remaining
  for (const ev of electivasVirtuales) remaining.set(ev.id, ev);

  // Seminario Final + EFIP II se extraen del mapa y se programan juntos al final
  const lastGroup = [];
  for (const id of LAST_GROUP_IDS) {
    const m = remaining.get(id);
    if (m) { lastGroup.push(m); remaining.delete(id); }
  }
  let lastGroupScheduled = false;

  // Idioma state machine
  let idiomaScheduled   = false;
  let idiomaYear        = null;
  let idiomaPeriodsLeft = 0;

  // Inscripto state: se muestran solo una vez (en el primer período planificado)
  let inscriptoShown = false;

  let period = scheduleFrom;
  let year   = scheduleYear;
  let iter   = 0;

  const shouldContinue = () =>
    remaining.size > 0 ||
    (hasIdioma && !idiomaScheduled) ||
    idiomaPeriodsLeft > 0 ||
    (!inscriptoShown && inscriptoSubjects.length > 0) ||
    (lastGroup.length > 0 && !lastGroupScheduled);

  while (shouldContinue() && iter < MAX_ITER) {
    iter++;

    // ── Compute idioma status for this period ──────────────────────
    const idiomaStartsNow = hasIdioma && !idiomaScheduled && period === '1A';
    const idiomaOngoingNow = idiomaScheduled && idiomaYear === year &&
      period !== '1A' && idiomaPeriodsLeft > 0;

    if (idiomaStartsNow) {
      idiomaScheduled = true;
      idiomaYear      = year;
      idiomaPeriodsLeft = 3; // 1B, 2A, 2B still to come
      for (const m of idiomaSubjects) effectiveDone.add(m.id);
    }

    // ── Inscripto subjects for this period ─────────────────────────
    // Se muestran en el primer período del schedule (scheduleFrom)
    const inscriptoThisPeriod = (!inscriptoShown && inscriptoSubjects.length > 0)
      ? inscriptoSubjects
      : [];

    // Slots available for regular subjects this period (EFIPs no consumen cupo)
    // Idioma solo resta 1 slot el período que inicia (1A); el resto del año es adicional
    const usedByIdioma    = idiomaStartsNow ? 1 : 0;
    const usedByInscripto = inscriptoThisPeriod.filter(m => m.tipo !== 'examen').length;
    const effectiveMax    = Math.max(0, maxPerPeriod - usedByIdioma - usedByInscripto);

    // ── Find available subjects ────────────────────────────────────
    // Las inscripto aún NO están en effectiveDone, por eso sus dependientes
    // no aparecen disponibles en este mismo período
    const availableRegular = [];
    const availableEfip    = [];
    for (const [, m] of remaining) {
      if (!(m.correlativas ?? []).every(c => effectiveDone.has(c.correlativa_id))) continue;
      // Electivas con período específico: solo disponibles en ese año y tramo exacto
      if (m._periodo_anio && m._periodo_tramo) {
        if (m._periodo_anio !== year || m._periodo_tramo !== period) continue;
      } else if (!periodAllowed(m.periodos_dictado, period)) continue;
      if (m.tipo === 'examen') availableEfip.push(m);
      else availableRegular.push(m);
    }

    // Grupo final (Seminario Final + EFIP II): solo cuando no queda ninguna otra materia
    // Se tratan como grupo: se ignoran las correlativas internas entre ellos
    if (lastGroup.length > 0 && !lastGroupScheduled && remaining.size === 0 && availableRegular.length === 0) {
      const groupReady = lastGroup.every(m =>
        (m.correlativas ?? [])
          .filter(c => !LAST_GROUP_IDS.has(c.correlativa_id))
          .every(c => effectiveDone.has(c.correlativa_id)) &&
        periodAllowed(m.periodos_dictado, period)
      );
      if (groupReady) {
        for (const m of lastGroup) availableEfip.push(m);
      }
    }

    const sortFn = (a, b) => {
      const diff = countDirectUnlocks(b.id, remaining) - countDirectUnlocks(a.id, remaining);
      if (diff !== 0) return diff;
      return (a.cuatrimestre ?? 99) - (b.cuatrimestre ?? 99);
    };
    availableRegular.sort(sortFn);

    // EFIPs se toman todos los disponibles (sin límite de cupo)
    const taken = [...availableEfip, ...availableRegular.slice(0, effectiveMax)];

    // ── Build items list for this period ──────────────────────────
    const items = [];
    if (idiomaStartsNow)  items.push(IDIOMA_START);
    if (idiomaOngoingNow) items.push(IDIOMA_ONGOING);
    // Inscripto subjects marcados para distinguirlos visualmente
    for (const m of inscriptoThisPeriod) items.push({ ...m, _inscripto: true });
    items.push(...taken);

    if (items.length > 0) {
      schedule.push({ year, period, status: 'planned', items });
      for (const m of taken) {
        remaining.delete(m.id);
        effectiveDone.add(m.id);
        if (LAST_GROUP_IDS.has(m.id)) lastGroupScheduled = true;
      }
    }

    // Al terminar este período, las inscripto se consideran aprobadas
    // → sus dependientes quedan disponibles a partir del período siguiente
    if (inscriptoThisPeriod.length > 0) {
      for (const id of inscriptoIds) effectiveDone.add(id);
      inscriptoShown = true;
    }

    // Decrement idioma counter AFTER building the period entry
    if (idiomaOngoingNow) idiomaPeriodsLeft--;

    ({ period, year } = advancePeriod(period, year));
  }

  const plannedEntries  = schedule.filter(s => s.status === 'planned');
  const totalToSchedule = toSchedule.length + inscriptoSubjects.length + electivasVirtuales.length;
  const totalScheduled  = plannedEntries.reduce(
    (acc, s) => acc + s.items.filter(i =>
      i.id !== '__idioma_ongoing__' && !i._inscripto
    ).length,
    0
  );

  const stuckItems = [...remaining.values()];
  if (lastGroup.length > 0 && !lastGroupScheduled) stuckItems.push(...lastGroup);

  return {
    schedule:   schedule.filter(s => s.items.length > 0),
    stuck:      stuckItems.length > 0,
    stuckItems,
    stats: {
      totalToSchedule,
      periodsCount: plannedEntries.length,
      avgPerPeriod: plannedEntries.length
        ? (totalScheduled / plannedEntries.length).toFixed(1)
        : '—',
    },
  };
}
