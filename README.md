# UES21 Tracker

Aplicación local para seguir el avance de la Licenciatura en Ciencia de Datos de UES21.

Permite administrar materias, estados de cursada, correlativas, EFIP, electivas y notas desde una interfaz visual.

## Funcionalidades

### Plan de Estudios
- Muestra todas las materias organizadas por año y cuatrimestre.
- Estados de cursada: **pendiente**, **inscripto**, **cursando**, **regular** y **aprobada**.
- Registra año y período de cursada/aprobación con el esquema normalizado: `1A` (Mar–May), `1B` (May–Jul), `2A` (Ago–Oct), `2B` (Oct–Dic).
- Indicadores visuales de correlativas: candado cerrado (prerequisitos pendientes), candado abierto (disponible), llave (desbloquea otras).
- Barra de progreso de nota en cada tarjeta.
- Panel lateral de edición con botones de estado, nota, año y período — igual para materias y electivas.
- Alertas de inscripción y materias críticas para el próximo cuatrimestre.

### Árbol de Correlatividades
- Visualización gráfica del árbol de dependencias entre materias.
- Permite editar correlativas desde el árbol.

### Camino Sugerido
- Propone un orden de cursada óptimo basado en el estado actual de la carrera.
- Respeta correlativas y restricciones de período de dictado.

### Predictivo
Proyección de finalización de la carrera basada en el estado actual:

- Máximo **3 materias obligatorias por período** (1A, 1B, 2A o 2B).
- Los **EFIPs** no cuentan dentro del límite de 3 — son adicionales.
- **Idioma Extranjero I–VI** se trata como un bloque anual: inicia solo en 1A, ocupa 1 slot ese período y continúa como adicional en 1B, 2A y 2B del mismo año; las 6 materias se aprueban simultáneamente al final.
- Las materias con estado **cursando** se muestran como "en curso" y sus dependientes quedan disponibles desde el siguiente período.
- Las materias con estado **inscripto** se muestran en el primer período planificado; sus dependientes no se desbloquean hasta el período siguiente.
- Las **electivas pendientes/inscriptas** aparecen con su nombre real en el timeline; si tienen período y año definidos, se programan exactamente en ese período.
- Si no se alcanzaron los **8 créditos de electivas**, se agregan electivas genéricas ("Electiva N") para cubrir el déficit.
- **Seminario Final en Ciencia de Datos** y **EFIP II** siempre se programan juntos en el último período, después de todo lo demás.

### Notas
- Dashboard de notas con métricas de avance (promedio, máxima, mínima, distribución).
- Botón de privacidad para ocultar notas en capturas de pantalla.

### Electivas
- Alta, edición y eliminación de electivas desde un panel lateral (mismo diseño que el panel de materias).
- Catálogo oficial de electivas MEC con búsqueda.
- Campos: nombre, estado, créditos, cuatrimestre de referencia, año y período real, nota.
- Si los créditos no se especifican, el sistema asume 4 créditos en el cálculo del Predictivo.
- Barra de progreso hacia los 8 créditos requeridos.

### EFIP I y EFIP II
- Vistas dedicadas con requisitos, correlativas y estado.
- EFIP II requiere EFIP I, Seminario Final, materias avanzadas y 8 créditos de electivas.

### Materias de Verano
- Vista informativa de las materias disponibles en período de verano.

### Ayuda
- Guía de uso: cómo cambiar estados, gestionar correlativas, agregar electivas, usar las distintas vistas y controles.

## Infraestructura

La app está pensada para ejecutarse localmente.

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Base de datos:** SQLite con `better-sqlite3`
- **Persistencia:** archivo local `datos.db` en la raíz del proyecto
- **API local:** `http://localhost:3001`
- **Frontend local:** `http://localhost:5173`

El archivo `datos.db` no se versiona. Si no existe, el backend lo crea con tablas, materias iniciales, EFIP, correlativas y migraciones al iniciar.

## Estructura

```text
.
├─ client/              # React + Vite
│  └─ src/
│     ├─ components/    # Vistas y componentes principales
│     ├─ utils/         # Lógica de scheduling, períodos, cuatrimestres
│     ├─ App.jsx
│     └─ api.js
├─ server/
│  └─ index.js          # API Express + schema/seed/migraciones SQLite
├─ package.json         # Scripts raíz
└─ datos.db             # Base local, ignorada por Git
```

## Instalación

Desde la raíz del proyecto:

```bash
npm run install:all
```

## Iniciar en Desarrollo

```bash
npm run dev
```

Levanta ambos servicios en paralelo:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`

También se pueden iniciar por separado:

```bash
npm run server
npm run client
```

## Scripts

| Script | Descripción |
|---|---|
| `npm run install:all` | Instala dependencias raíz y del cliente |
| `npm run dev` | Inicia backend y frontend juntos |
| `npm run server` | Inicia solo la API Express |
| `npm run client` | Inicia solo Vite |

## Notas técnicas

- `datos.db` está en `.gitignore` para evitar subir datos personales.
- Las correlativas base se inicializan desde el set validado en el seed; las correlativas de EFIP se cargan de forma idempotente al arrancar el servidor.
- Las migraciones de schema (columnas nuevas) viven en `server/index.js` y se ejecutan al iniciar, usando `try/catch` para ser idempotentes.
- El campo `periodos_dictado` en materias indica restricción de período: `'A'` solo en 1A y 2A, `'B'` solo en 1B y 2B, `null` sin restricción.
- Las electivas usan el mismo esquema de período que las materias (`periodo_anio` + `periodo_tramo`).
