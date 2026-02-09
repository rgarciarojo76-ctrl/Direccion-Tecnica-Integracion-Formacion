
import { readFile, writeFile } from 'fs/promises';
import { utils, writeFile as writeXlsx } from 'xlsx';
import path from 'path';

// MOCK DATA LOADING (Since we can't easily import the browser-based dataProcessor in Node without adjustments)
// We will try to read the JSON if available, or just describe the logic.
// Actually, better to just create an Excel that DESCRIBES the logic and lists the KEYWORDS.

const KEYWORD_MAP = {
    'carretilla': 'carretilla',
    'elevad': 'elevadora',
    'altura': 'altura',
    'recurso': 'preventivo',
    'prl': 'prl',
    'primeros': 'auxilios',
    'espacio': 'confinado',
    'fuego': 'extincion',
    'incendio': 'incendio',
    'puente': 'grua',
    'grua': 'grua',
    'electric': 'electric',
    'riesgo': 'riesgo',
    'oficina': 'pantalla',
    'emergencia': 'emergencia'
};

const LOGIC_DESCRIPTION = [
    { Rule: "1. Ubicación Exacta", Description: "El curso de MAS y el de ASPY deben ser en la misma provincia/ciudad." },
    { Rule: "2. Fecha Cercana", Description: "La diferencia de inicio entre ambos cursos no puede superar los 15 días." },
    { Rule: "3. Plazas Disponibles", Description: "El curso de ASPY debe tener al menos 1 plaza libre." },
    { Rule: "4. Temática (Palabras Clave)", Description: "El título de ambos cursos debe contener alguna de las palabras clave mapeadas (ver hoja Keywords)." }
];

async function generateReport() {
    const wb = utils.book_new();

    // SHEET 1: LOGIC
    const wsLogic = utils.json_to_sheet(LOGIC_DESCRIPTION);
    utils.book_append_sheet(wb, wsLogic, "Reglas de Agrupación");

    // SHEET 2: KEYWORDS
    const keywordData = Object.entries(KEYWORD_MAP).map(([key, value]) => ({
        'Si el título contiene...': key,
        'Se considera tema...': value
    }));
    const wsKeywords = utils.json_to_sheet(keywordData);
    utils.book_append_sheet(wb, wsKeywords, "Palabras Clave (Keywords)");

    // Write File
    const outputPath = path.resolve('Reglas_Agrupacion_Actuales.xlsx');
    writeXlsx(wb, outputPath);
    console.log(`Report generated at: ${outputPath}`);
}

generateReport().catch(console.error);
