
import { readFile } from 'fs/promises';
import { read, utils } from 'xlsx';
import { join } from 'path';

const PUBLIC_DIR = '/Users/rubengarciarojo/.gemini/antigravity/workspaces/ASPY-MAS-Programacion-Formacion/public/data';
const ASPY_FILE = join(PUBLIC_DIR, 'aspy_2026.xls');
const MAS_FILE = join(PUBLIC_DIR, 'mas_2026.xls');

async function checkFile(filePath, name) {
  try {
    const buffer = await readFile(filePath);
    const wb = read(buffer, { type: 'buffer' });
    const wsName = wb.SheetNames[0];
    const ws = wb.Sheets[wsName];
    // Get first row (headers)
    const headers = utils.sheet_to_json(ws, { header: 1 })[0];
    console.log(`--- ${name} Headers ---`);
    console.log(headers);
    console.log('\n');
    
    // Get first data row
    const firstRow = utils.sheet_to_json(ws, { header: 1 })[1];
    console.log(`--- ${name} First Row ---`);
    console.log(firstRow);
    console.log('\n');
  } catch (error) {
    console.error(`Error reading ${name}:`, error.message);
  }
}

async function main() {
    await checkFile(ASPY_FILE, 'ASPY');
    await checkFile(MAS_FILE, 'MAS');
}

main();
