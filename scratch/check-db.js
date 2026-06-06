const Database = require('better-sqlite3');
const path = require('path');

const dbPath = 'C:\\Users\\ilyas bozdemir\\AppData\\Roaming\\dt-desktop-app\\dtm_temp\\1780755781766\\database.sqlite';

try {
  const db = new Database(dbPath, { fileMustExist: true });
  const rows = db.prepare('SELECT * FROM TANIM_KomisyonGorevi').all();
  console.log('TANIM_KomisyonGorevi ROWS:', rows);
} catch (e) {
  console.error(e);
}
