export const CUATRIMESTRES = [
  { value: 1, label: '1Q', longLabel: '1Q — 1° Año' },
  { value: 2, label: '2Q', longLabel: '2Q — 1° Año' },
  { value: 3, label: '3Q', longLabel: '3Q — 2° Año' },
  { value: 4, label: '4Q', longLabel: '4Q — 2° Año' },
  { value: 5, label: '5Q', longLabel: '5Q — 3° Año' },
  { value: 6, label: '6Q', longLabel: '6Q — 3° Año' },
  { value: 7, label: '7Q', longLabel: '7Q — 4° Año' },
  { value: 8, label: '8Q', longLabel: '8Q — 4° Año' },
];

export const CUATRIMESTRE_LABELS = Object.fromEntries(
  CUATRIMESTRES.map(({ value, label }) => [value, label])
);

export function cuatrimestreLabel(value, fallback = '—') {
  if (value === 0) return 'Ingreso';
  return CUATRIMESTRE_LABELS[Number(value)] ?? fallback;
}

export function cuatrimestreLongLabel(value, fallback = '—') {
  const item = CUATRIMESTRES.find(c => c.value === Number(value));
  return item?.longLabel ?? fallback;
}
