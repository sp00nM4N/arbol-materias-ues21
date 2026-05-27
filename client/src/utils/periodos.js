export function formatMateriaPeriodo(item) {
  if (item?.periodo_anio && item?.periodo_tramo) {
    return `${item.periodo_anio} ${item.periodo_tramo}`;
  }
  return item?.periodo ?? '';
}
