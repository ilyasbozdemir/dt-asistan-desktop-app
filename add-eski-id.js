const fs = require('fs');
const files = [
  'TANIM_Firma.ts',
  'TANIM_Personel.ts',
  'TANIM_Birim.ts',
  'TANIM_Kalem.ts',
  'TANIM_Ambar.ts'
];
files.forEach(file => {
  const path = 'src/main/database/tables/' + file;
  let content = fs.readFileSync(path, 'utf8');
  if (!content.includes('eski_id')) {
    content = content.replace(
      /{ name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },/,
      "{ name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },\n    { name: 'eski_id', type: 'TEXT' },"
    );
    fs.writeFileSync(path, content, 'utf8');
    console.log('Updated ' + file);
  } else {
    console.log('Already has eski_id: ' + file);
  }
});
