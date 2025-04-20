import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';


const fname = fileURLToPath(import.meta.url);
const dir = path.dirname(fname);


const csvP = path.join(dir, 'Electric_Vehicle_Population_Data.csv');
const jsonP = path.join(dir, 'Electric_Vehicle_Population_Data.json');


const csvFile = fs.readFileSync(csvP, 'utf8');


Papa.parse(csvFile, {
  header: true,
  complete: (results) => {
    fs.writeFileSync(jsonP, JSON.stringify(results.data, null, 2));
    console.log(`saved at: ${jsonP}`);
  },
  error: (error) => {
    console.error('error:', error.message);
  }
});
