import pkg from 'xlsx';
const { readFile, utils } = pkg;
import fs from 'fs';
import path from 'path';

const ASPY_FILE = 'src/data/Programación de cursos Presenciales y Semipresenciales ASPY 2026 .xls';
const MAS_FILE = 'src/data/MAS PROGRAMACION_2026.xls';

function readExcel(filePath) {
  try {
    const workbook = readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Get headers (first row)
    const json = utils.sheet_to_json(sheet, { header: 1 });
    const headers = json[0];
    // Get first 2 rows of data
    const data = json.slice(1, 4);
    
    console.log(`\n--- Analysis for ${path.basename(filePath)} ---`);
    console.log('Headers:', headers);
    console.log('Sample Data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
}

console.log('Analyzing Excel Files...');
readExcel(ASPY_FILE);
readExcel(MAS_FILE);
