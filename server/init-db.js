const { db, DB_PATH } = require('./index');

const { materias } = db.prepare('SELECT COUNT(*) AS materias FROM materias').get();
const { correlativas } = db.prepare('SELECT COUNT(*) AS correlativas FROM correlativas').get();
const { electivas } = db.prepare('SELECT COUNT(*) AS electivas FROM electivas').get();

console.log(`Base de datos lista: ${DB_PATH}`);
console.log(`Materias: ${materias}`);
console.log(`Correlativas: ${correlativas}`);
console.log(`Electivas cargadas: ${electivas}`);

db.close();
