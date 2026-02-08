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

// DATA LOADING
export const loadData = async () => {
  try {
    const [aspyData, masData] = await Promise.all([
      fetchAndParseASPY(),
      fetchAndParseMAS()
    ]);
    
    // Combine
    let combined = [...aspyData, ...masData];
    
    // Detect Synergies
    combined = detectSynergies(combined);
    
    return combined;
  } catch (error) {
    console.error("Error loading data:", error);
    return [];
  }
};

const parseMixedDate = (value) => {
    if (!value) return "";
    // If number, it's serial
    if (typeof value === 'number') {
        const date = new Date((value - 25569) * 86400 * 1000);
        return date.toLocaleDateString('es-ES');
    }
    // If string, assume dd/mm/yyyy or simple string
    return value;
};

// Common parser since both files seem to share structure now
const parseRow = (row, source) => {
    // 0: ID
    // 1: Title
    // 2: Start Date
    // 3: End Date
    // 4: Modality
    // 5: Duration
    // 6: Location (Provincia)
    // 7: Max Seats (Plazas totales)
    // 8: Enrolled (Inscritos)
    // 9: Available (Disponibles)

    const rawTitle = row[1];
    if (!rawTitle) return null;

    const fechaInicioRaw = row[2];
    const fechaFinRaw = row[3];
    const modalidad = row[4];
    const duracion = row[5];
    const ubicacion = row[6];
    const plazasTotales = row[7];
    const plazasDisponibles = row[9]; // Use available for display or logic? User asked for "Plazas". Usually implies available or total. Let's use Available for "Plazas" in table, but keep Total for calculation if needed.
    
    // For the table display "Plazas", let's show Available. 
    // Wait, the KPI says "Confirmed". 
    // Let's use Available (col 9) for the UI "Plazas".
    
    const fechaInicio = parseMixedDate(fechaInicioRaw);
    const fechaFin = parseMixedDate(fechaFinRaw);

    // Title processing
    let code = "N/A";
    let title = rawTitle;
    let topic = normalizeTopic(rawTitle);

    if (source === 'ASPY') {
        // [CODE] Title | Info
        const match = rawTitle.match(/^\[([^\]]+)\]/);
        if (match) {
            code = match[1];
            title = rawTitle.replace(/^\[[^\]]+\]/, '').split('|')[0].trim();
        } else {
             // Fallback cleanup if different format
            title = cleanTitle(rawTitle);
        }
    } else {
        // MAS usually comes clean, or use generic
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
        fechas: `${fechaInicio} - ${fechaFin}`,
        startDateRaw: fechaInicio, // Keep string for now, or convert to Date object for sorting? string dd/mm/yyyy is okay for display. Synergy needs Date object or parsed.
        ubicacion: ubicacion || "Desconocida",
        delegacion: ubicacion || "Central", // Delegation same as location if not specified
        plazas: plazasDisponibles !== undefined ? plazasDisponibles : 0,
        totalPlazas: plazasTotales || 0,
        estado: (plazasDisponibles > 0) ? "CONFIRMADO" : "CERRADO", // Logic: If seats available -> Confirmed/Open. If 0 -> Closed? Or just default Confirmed.
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
  
  // Helper to get week number
  const getWeek = (dateStr) => {
    if(!dateStr) return -1;
    const [d, m, y] = dateStr.split('/');
    if (!d || !m || !y) return -1;
    const date = new Date(y, m - 1, d);
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
