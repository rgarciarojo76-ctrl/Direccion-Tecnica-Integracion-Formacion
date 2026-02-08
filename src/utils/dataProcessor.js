import { read, utils } from 'xlsx';

// FILE PATHS (In public folder)
const ASPY_FILE = '/data/aspy_2026.xls';
const MAS_FILE = '/data/mas_2026.xls';

// KEY MAPPINGS
const TOPIC_MAP = {
  "Security": "Seguridad",
  "Prevención": "PRL",
  "Management": "Recursos Humanos",
  // Map typical MÁS topics if known, otherwise identity
  "SEGURIDAD": "Seguridad",
  "PRL": "PRL",
  "METAL": "PRL" // Guessing based on "PRL DEL SECTOR DEL METAL"
};

// UTILS
// UTILS


const cleanTitle = (rawString) => {
  if (!rawString) return "Sin Título";
  return rawString.replace(/\s*\([^)]+\)/, '').trim();
};

const normalizeTopic = (text) => {
  if (!text) return "General";
  const upper = text.toUpperCase();
  for (const [key, value] of Object.entries(TOPIC_MAP)) {
    if (upper.includes(key)) return value;
  }
  // Heuristics
  if (upper.includes("SEGURIDAD") || upper.includes("PLATAFORMAS") || upper.includes("ALTURA")) return "Seguridad";
  if (upper.includes("PRL") || upper.includes("PREVENCION") || upper.includes("RIESGOS")) return "PRL";
  if (upper.includes("LIDERAZGO") || upper.includes("EQUIPOS")) return "Recursos Humanos";
  if (upper.includes("INGENIERIA") || upper.includes("INDUSTRIAL") || upper.includes("PROCESOS")) return "Ingeniería";
  
  return "General";
};

// DATE UTILS
const getJsDate = (value) => {
    if (!value) return null;
    // If number, it's serial (Excel)
    if (typeof value === 'number') {
        const date = new Date((value - 25569) * 86400 * 1000);
        // Correct timezone offset issues if needed, strictly for date part usually ok
        return date;
    }
    // If string in dd/mm/yyyy format
    if (typeof value === 'string' && value.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const [d, m, y] = value.split('/');
        return new Date(y, m - 1, d);
    }
    return null;
};

const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return "";
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// DATA LOADING
export const loadData = async () => {
  try {
    const [aspyData, masData] = await Promise.all([
      fetchAndParseASPY(),
      fetchAndParseMAS()
    ]);
    
    // Combine
    let combined = [...aspyData, ...masData];
    
    // Sort by Date (Ascending: Soonest first)
    combined.sort((a, b) => {
        const dateA = a.startDateRaw || new Date(2099, 11, 31);
        const dateB = b.startDateRaw || new Date(2099, 11, 31);
        return dateA - dateB;
    });

    // Detect Synergies
    combined = detectSynergies(combined);
    
    return combined;
  } catch (error) {
    console.error("Error loading data:", error);
    return [];
  }
};

// Common parser since both files seem to share structure now
const parseRow = (row, source) => {
    // ... (same indices)

    const rawTitle = row[1];
    if (!rawTitle) return null;

    const fechaInicioRaw = row[2];
    const fechaFinRaw = row[3];
    const modalidad = row[4];
    const duracion = row[5];
    const ubicacion = row[6];
    const plazasTotales = row[7];
    const plazasDisponibles = row[9];
    
    // Date Parsing
    const startDateObj = getJsDate(fechaInicioRaw);
    const endDateObj = getJsDate(fechaFinRaw);
    
    const fechaInicioStr = formatDate(startDateObj) || fechaInicioRaw; // Fallback to raw if logic fails
    const fechaFinStr = formatDate(endDateObj) || fechaFinRaw;

    // Title processing
    let code = "N/A";
    let title = rawTitle;
    let topic = normalizeTopic(rawTitle);

    if (source === 'ASPY') {
        // [CODE] Title | Info
        const prefixMatch = rawTitle.match(/^\[([^\]]+)\]/);
        const suffixMatch = rawTitle.match(/\s+([A-Z]{3,}\d+[A-Z]*)$/);

        if (prefixMatch) {
            code = prefixMatch[1];
            title = rawTitle.replace(/^\[[^\]]+\]/, '').split('|')[0].trim();
        } else if (suffixMatch) {
            code = suffixMatch[1];
            title = rawTitle.replace(suffixMatch[0], '').trim();
        } else {
            title = cleanTitle(rawTitle);
        }
    } else {
        title = cleanTitle(rawTitle);
        code = `MAS-${row[0]}`;
    }

    return {
        id: `${source}-${row[0] || Math.random()}`,
        source: source,
        code: code,
        title: title,
        tematica: topic,
        modalidad: modalidad || "Presencial",
        fechas: `${fechaInicioStr} - ${fechaFinStr}`,
        startDate: startDateObj, // Date Object
        startDatefmt: fechaInicioStr,
        endDate: endDateObj,   // Date Object
        endDatefmt: fechaFinStr,
        startDateRaw: startDateObj, // Keep for sorting compatibility
        ubicacion: ubicacion || "Desconocida",
        delegacion: ubicacion || "Central",
        plazas: plazasDisponibles !== undefined ? plazasDisponibles : 0,
        totalPlazas: plazasTotales || 0,
        estado: (plazasDisponibles > 0) ? "CONFIRMADO" : "CERRADO",
        duracion_presencial: duracion || 0
    };
};

const fetchAndParseASPY = async () => {
  const file = await fetch(ASPY_FILE);
  const buffer = await file.arrayBuffer();
  const wb = read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json = utils.sheet_to_json(ws, { header: 1 }).slice(1);

  return json.map(row => parseRow(row, 'ASPY')).filter(Boolean);
};

const fetchAndParseMAS = async () => {
    const file = await fetch(MAS_FILE);
    const buffer = await file.arrayBuffer();
    const wb = read(buffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = utils.sheet_to_json(ws, { header: 1 }).slice(1);

    return json.map(row => parseRow(row, 'MAS')).filter(Boolean);
};

// Synergy Detection (Same logic as before, updated matching)
const detectSynergies = (courses) => {
  const processed = [...courses];
  
  // Helper to get week number from Date object
  const getWeek = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date)) return -1;
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
  };

  for (let i = 0; i < processed.length; i++) {

    for (let j = i + 1; j < processed.length; j++) {
      const c1 = processed[i];
      const c2 = processed[j];

      // Optimization: Compare strings first
      if (c1.ubicacion !== c2.ubicacion) continue;
      
      const w1 = getWeek(c1.startDateRaw);
      const w2 = getWeek(c2.startDateRaw);
      
      if (w1 === -1 || w2 === -1) continue;

      if (
        // Same Location
        c1.ubicacion.toLowerCase() === c2.ubicacion.toLowerCase() &&
        // Same Topic
        c1.tematica === c2.tematica &&
        // Same Week tolerance (exact match)
        w1 === w2
      ) {
        // Synergy Found!
        c1.hasSynergy = true;
        c2.hasSynergy = true;
        c1.synergyWith = c2.id;
        c2.synergyWith = c1.id;
        c1.totalPlazas = (c1.plazas || 0) + (c2.plazas || 0);
        c2.totalPlazas = (c1.plazas || 0) + (c2.plazas || 0);
      }
    }
  }
  return processed;
};

// KPI helper (can be exported or computed in component)
export const calculateKPIs = (data) => ({
  confirmed: data.filter(d => d.estado === 'CONFIRMADO').length,
  closed: data.filter(d => d.estado === 'CERRADO').length,
  finalized: data.filter(d => d.estado === 'FINALIZADO').length
});

// Mock export for backward compatibility if needed, but we use loadData() now
export const getProcessedData = () => []; 
