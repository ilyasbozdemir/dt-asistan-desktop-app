const Database = require('better-sqlite3');
const dbPath = 'C:\\Users\\ilyas bozdemir\\AppData\\Roaming\\dt-desktop-app\\dtm_temp\\1781426634871\\database.sqlite';
const db = new Database(dbPath);

console.log('--- DUPLICATE CHECK ---');
const duplicates = db.prepare('SELECT tur, kod, count(*) as c FROM TANIM_KodSozlugu GROUP BY tur, kod HAVING c > 1').all();
console.log('Duplicates:', duplicates);

console.log('--- ALL RECORDS ---');
const all = db.prepare('SELECT id, tur, kod, aciklama FROM TANIM_KodSozlugu ORDER BY tur, kod').all();
console.log('Total count:', all.length);

if (duplicates.length > 0) {
  console.log('Deleting duplicates...');
  // Keep the one with min id for each tur, kod
  const stmt = db.prepare(`
    DELETE FROM TANIM_KodSozlugu 
    WHERE id NOT IN (
      SELECT MIN(id) 
      FROM TANIM_KodSozlugu 
      GROUP BY tur, kod
    )
  `);
  const info = stmt.run();
  console.log('Deleted rows:', info.changes);
} else {
  // If user meant "duplicate aciklama" or "exact same row"?
  // Let's check if there are any exact duplicates ignoring ID?
  const duplicatesDesc = db.prepare('SELECT aciklama, count(*) as c FROM TANIM_KodSozlugu GROUP BY aciklama HAVING c > 1').all();
  console.log('Duplicates by aciklama:', duplicatesDesc);
  
  // Maybe user meant they want to delete everything that's repeated? 
  // Let's just delete rows with duplicated aciklama? No, tur and kod matters.
}
db.close();
