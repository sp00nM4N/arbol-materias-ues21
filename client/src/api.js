const BASE = '/api';

async function req(path, options = {}) {
  const r = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return r.json();
}

export const getMaterias    = ()             => req('/materias');
export const updateMateria  = (id, data)     => req(`/materias/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const getCorrelativas   = ()                        => req('/correlativas');
export const addCorrelativa    = (materia_id, correlativa_id) =>
  req('/correlativas', { method: 'POST', body: JSON.stringify({ materia_id, correlativa_id }) });
export const deleteCorrelativa = (id)                      => req(`/correlativas/${id}`, { method: 'DELETE' });

export const getElectivas    = ()        => req('/electivas');
export const createElectiva  = (data)    => req('/electivas', { method: 'POST', body: JSON.stringify(data) });
export const updateElectiva  = (id, data)=> req(`/electivas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteElectiva  = (id)      => req(`/electivas/${id}`, { method: 'DELETE' });

export const getStats = () => req('/stats');
