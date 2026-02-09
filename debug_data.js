
import { Utils } from './src/utils/dataProcessor.js'; // Can't easily import internal functions if not exported.
// Better to just test the file renaming first.
// Let's modify dataProcessor to be node-compatible for debugging if possible, or just trust the rename fix.
// Detailed debug of parseRow is safer.

import { readFile, utils } from 'xlsx';
import path from 'path';

const ASPY_PATH = path.join(process.cwd(), 'public/data/aspy_blue_2026.xlsx');

const run = async () => {
    try {
        const wb = readFile(ASPY_PATH);
        console.log("File read successfully.");
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = utils.sheet_to_json(sheet, { header: 1 });
        console.log(`Rows found: ${json.length}`);
    } catch (e) {
        console.error("Error reading file:", e);
    }
}
run();


const run = async () => {
  console.log("Loading data...");
  const data = await loadData();
  console.log(`Total records: ${data.length}`);
  
  const aspy = data.filter(d => d.source === 'ASPY');
  const mas = data.filter(d => d.source === 'MAS');
  
  console.log(`ASPY records: ${aspy.length}`);
  console.log(`MAS records: ${mas.length}`);
  
  if (aspy.length > 0) {
      console.log("Sample ASPY:", aspy[0]);
  } else {
      console.log("No ASPY records found. Checking raw file reading...");
  }
};

run();
