const { app } = require('electron');
const Database = require('better-sqlite3');

app.whenReady().then(() => {
  const dbPath = 'C:\\Users\\ilyas bozdemir\\AppData\\Roaming\\dt-desktop-app\\dtm_temp\\1781426634871\\database.sqlite';
  const db = new Database(dbPath);
  
  const initialData = [
    { tur: 'kurumsal', kod: '46.00.00.01', aciklama: 'Mali Hizmetler Müdürlüğü', aktif_mi: 1 },
    { tur: 'kurumsal', kod: '30.11.01.23', aciklama: 'Destek Hizmetleri Müdürlüğü', aktif_mi: 1 },
    { tur: 'fonksiyonel', kod: '01.1.2.00', aciklama: 'Finansal ve Mali İşler Hizmetleri', aktif_mi: 1 },
    { tur: 'fonksiyonel', kod: '01.3.1.00', aciklama: 'Genel Personel Hizmetleri', aktif_mi: 1 },
    { tur: 'fonksiyonel', kod: '01.3.2.00', aciklama: 'Genel Planlama ve İstatistik Hizmetleri', aktif_mi: 1 },
    { tur: 'fonksiyonel', kod: '01.3.9.00', aciklama: 'Diğer Genel Hizmetler', aktif_mi: 1 },
    { tur: 'muhasebe_birimi', kod: '10010', aciklama: 'Belediye Merkez Muhasebe Birimi', aktif_mi: 1 },
    { tur: 'harcama_birimi', kod: '01', aciklama: 'Başkanlık', aktif_mi: 1 },
    { tur: 'harcama_birimi', kod: '22', aciklama: 'Mali Hizmetler Müdürlüğü', aktif_mi: 1 },
    { tur: 'harcama_birimi', kod: '23', aciklama: 'Destek Hizmetleri Müdürlüğü', aktif_mi: 1 }
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO TANIM_KodSozlugu (tur, kod, aciklama, aktif_mi) VALUES (?, ?, ?, ?)');
  
  for (const row of initialData) {
     stmt.run(row.tur, row.kod, row.aciklama, row.aktif_mi);
  }
  
  console.log('Restored default missing rows if any.');
  
  // Now, user says "Mali ve Kurumsal Kod Yönetimi içinde tekrar eden verilieri silsen dbden hocam ya". 
  // What could they mean? 
  // Maybe they added their own custom records, and they got duplicated?
  // Let's actually find exact duplicates ignoring ID.
  const duplicates = db.prepare('SELECT tur, kod, aciklama, count(*) as c FROM TANIM_KodSozlugu GROUP BY tur, kod, aciklama HAVING c > 1').all();
  console.log('Real exact duplicates:', duplicates);
  
  if(duplicates.length > 0) {
      db.prepare(`
        DELETE FROM TANIM_KodSozlugu 
        WHERE id NOT IN (
          SELECT MIN(id) 
          FROM TANIM_KodSozlugu 
          GROUP BY tur, kod, aciklama
        )
      `).run();
      console.log('Deleted exact duplicates');
  }

  // Also verify if there's any tur, kod duplicates that differ by aciklama.
  const turKodDuplicates = db.prepare('SELECT tur, kod, count(*) as c FROM TANIM_KodSozlugu GROUP BY tur, kod HAVING c > 1').all();
  if (turKodDuplicates.length > 0) {
      db.prepare(`
        DELETE FROM TANIM_KodSozlugu 
        WHERE id NOT IN (
          SELECT MIN(id) 
          FROM TANIM_KodSozlugu 
          GROUP BY tur, kod
        )
      `).run();
      console.log('Deleted tur/kod duplicates');
  }

  db.close();
  app.quit();
});
