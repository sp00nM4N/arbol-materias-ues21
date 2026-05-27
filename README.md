# UES21 Tracker

Aplicación local para seguir el avance de la Licenciatura en Ciencia de Datos de UES21.

Permite administrar materias, estados de cursada, correlativas, EFIP, electivas y notas desde una interfaz visual.

## Qué Hace

- Muestra el plan de estudios por año y cuatrimestre.
- Marca estados de materias: pendiente, inscripto, cursando, regular y aprobada.
- Calcula disponibilidad según correlativas.
- Visualiza el árbol de correlatividades.
- Permite editar correlativas desde el plan y desde el árbol.
- Gestiona EFIP I y EFIP II como exámenes integradores con correlativas propias.
- Administra electivas, créditos, cuatrimestre, nota, período y proveedor.
- Muestra alertas de inscripción y materias críticas para el próximo cuatrimestre.
- Incluye dashboard de notas y métricas de avance.

## Infraestructura

La app está pensada para ejecutarse localmente.

- Frontend: React + Vite.
- Backend: Node.js + Express.
- Base de datos: SQLite con `better-sqlite3`.
- Persistencia: archivo local `datos.db` en la raíz del proyecto.
- API local: `http://localhost:3001`.
- Frontend local: `http://localhost:5173`.

El archivo `datos.db` no se versiona. Si no existe, el backend crea la base, tablas, materias iniciales, EFIP, correlativas y migraciones al iniciar.

## Estructura

```text
.
├─ client/              # React + Vite
│  └─ src/
│     ├─ components/    # Vistas y componentes principales
│     ├─ App.jsx
│     └─ api.js
├─ server/
│  ├─ index.js          # API Express + schema/seed/migraciones SQLite
│  └─ init-db.js        # Inicialización manual de la base
├─ package.json         # Scripts raíz
└─ datos.db             # Base local, ignorada por Git
```

## Instalación

Desde la raíz del proyecto:

```bash
npm run install:all
```

Ese comando instala dependencias del backend y del frontend.

## Inicializar la Base

La base se inicializa automáticamente al arrancar el servidor. También se puede crear o verificar manualmente:

```bash
npm run init-db
```

Salida esperada:

```text
Base de datos lista: .../datos.db
Materias: 53
Correlativas: ...
Electivas cargadas: 0
```

Para usar otra ruta de base, se puede definir `DB_PATH`:

```bash
DB_PATH=./data/datos.db npm run init-db
```

En Windows PowerShell:

```powershell
$env:DB_PATH = ".\data\datos.db"
npm run init-db
Remove-Item Env:\DB_PATH
```

## Iniciar en Desarrollo

```bash
npm run dev
```

Esto levanta ambos servicios:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`

También se pueden iniciar por separado:

```bash
npm run server
npm run client
```

## Scripts

- `npm run install:all`: instala dependencias raíz y del cliente.
- `npm run init-db`: crea/verifica la base SQLite.
- `npm run dev`: inicia backend y frontend juntos.
- `npm run server`: inicia solo la API.
- `npm run client`: inicia solo Vite.

## Notas

- `datos.db` está en `.gitignore` para evitar subir datos personales o avances propios.
- Las correlativas base y las correlativas de EFIP se cargan de forma idempotente.
- Las migraciones simples viven en `server/index.js` y se ejecutan al iniciar el backend.
