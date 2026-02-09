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
    
    // If it's already a Date object (thanks to cellDates: true)
    if (value instanceof Date) {
        return value;
    }

    // If string in dd/mm/yyyy format
    if (typeof value === 'string') {
        const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match) {
            const [_, d, m, y] = match;
            return new Date(y, m - 1, d);
        }
        // Fallback checks
        const d = new Date(value);
        if (!isNaN(d)) return d;
    }

    // If number (fallback for serial if cellDates missed it for some reason)
    if (typeof value === 'number') {
        const date = new Date((value - 25569) * 86400 * 1000);
        return date;
    }
    return null;
};

const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return "";
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// DATA LOADING
// DATA LOADING
export const loadData = async () => {
  try {
    const [aspyData, masData] = await Promise.all([
      fetchAndParseASPY(),
      fetchAndParseMAS()
    ]);
    
    // Combine
    let combined = [...aspyData, ...masData];
    
    // Filter past courses (keep today and future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    combined = combined.filter(c => {
        if (!c.startDateRaw) return false;
        const cDate = new Date(c.startDateRaw);
        cDate.setHours(0, 0, 0, 0);
        return cDate >= today;
    });

    // Detect Synergies (Before sort logic or irrelevant, but keeping data processing together)
    combined = detectSynergies(combined);

    // Sort by Date (Ascending: Soonest first) - FINAL STEP
    combined.sort((a, b) => {
        const dateA = a.startDateRaw || new Date(2099, 11, 31);
        const dateB = b.startDateRaw || new Date(2099, 11, 31);
        return dateA - dateB;
    });
    
    return combined;
  } catch (error) {
    console.error("Error loading data:", error);
    return [];
  }
};

// Normalization Map for Provinces
const provinceMap = {
    "alacant": "Alicante",
    "alicante": "Alicante",
    "alacant/alicante": "Alicante",
    "alacant (alicante)": "Alicante",
    "alava": "Álava",
    "araba": "Álava",
    "araba/alava": "Álava",
    "asturias": "Asturias",
    "avila": "Ávila",
    "badajoz": "Badajoz",
    "barcelona": "Barcelona",
    "bizkaia": "Vizcaya",
    "vizcaya": "Vizcaya",
    "bizkaia (vizcaya)": "Vizcaya",
    "burgos": "Burgos",
    "caceres": "Cáceres",
    "cadiz": "Cádiz",
    "cantabria": "Cantabria",
    "castello": "Castellón",
    "castellon": "Castellón",
    "castello/castellon": "Castellón",
    "castello (castellon)": "Castellón",
    "ceuta": "Ceuta",
    "ciudad real": "Ciudad Real",
    "cordoba": "Córdoba",
    "coruna": "A Coruña",
    "a coruna": "A Coruña",
    "la coruna": "A Coruña",
    "a coruna (la coruna)": "A Coruña",
    "cuenca": "Cuenca",
    "girona": "Girona",
    "gerona": "Girona",
    "gerona (girona)": "Girona",
    "granada": "Granada",
    "guadalajara": "Guadalajara",
    "gipuzkoa": "Guipúzcoa",
    "guipuzcoa": "Guipúzcoa",
    "gipuzkoa (guipuzcoa)": "Guipúzcoa",
    "huelva": "Huelva",
    "huesca": "Huesca",
    "illes balears": "Baleares",
    "baleares": "Baleares",
    "islas baleares": "Baleares",
    "jaen": "Jaén",
    "rioja": "La Rioja",
    "la rioja": "La Rioja",
    "las palmas": "Las Palmas",
    "leon": "León",
    "lleida": "Lleida",
    "lerida": "Lleida",
    "lugo": "Lugo",
    "madrid": "Madrid",
    "malaga": "Málaga",
    "melilla": "Melilla",
    "murcia": "Murcia",
    "navarra": "Navarra",
    "nafarroa": "Navarra",
    "ourense": "Ourense",
    "orense": "Ourense",
    "palencia": "Palencia",
    "pontevedra": "Pontevedra",
    "salamanca": "Salamanca",
    "santa cruz de tenerife": "Santa Cruz de Tenerife",
    "segovia": "Segovia",
    "sevilla": "Sevilla",
    "soria": "Soria",
    "tarragona": "Tarragona",
    "teruel": "Teruel",
    "toledo": "Toledo",
    "valencia": "Valencia",
    "valencia/valencia": "Valencia",
    "valencia (valencia)": "Valencia",
    "valladolid": "Valladolid",
    "zamora": "Zamora",
    "zaragoza": "Zaragoza",
    "albacete": "Albacete",
    "almeria": "Almería",
    "desconocida": "Desconocida"
};

// Helper: Remove accents for normalization
const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const normalizeLocation = (rawLoc) => {
    if (!rawLoc) return "Desconocida";
    
    // Cleanup: remove extra spaces, lowercase for matching
    let clean = rawLoc.trim().toLowerCase();
    
    // Normalize accents (e.g., "AlmerÍA" -> "almeria")
    clean = removeAccents(clean);
    
    // Direct map lookup
    if (provinceMap[clean]) {
        return provinceMap[clean];
    }

    // Attempt to match if simplified (remove parenthesis content)
    const noParens = clean.replace(/\s*\(.*?\)\s*/g, '').trim();
    if (provinceMap[noParens]) {
        return provinceMap[noParens];
    }

    // Default: Return "Desconocida" for truly unknown values
    // We could also capitalize the first letter, but safer to use a known default
    return "Desconocida";
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
    const ubicacionRaw = row[6]; // Raw location
    const plazasTotales = row[7];
    const plazasDisponibles = row[9];
    
    // Date Parsing
    const startDateObj = getJsDate(fechaInicioRaw);
    const endDateObj = getJsDate(fechaFinRaw);
    
    const fechaInicioStr = formatDate(startDateObj) || fechaInicioRaw;
    const fechaFinStr = formatDate(endDateObj) || fechaFinRaw;

    // Location Normalization
    const ubicacion = normalizeLocation(ubicacionRaw);

    // Title processing
    let code = "N/A";
    let title = rawTitle;
    let topic = normalizeTopic(rawTitle);
    let extractedDuration = duracion; // Default to column value

    if (source === 'ASPY') {
        // Extract duration from title (e.g., "TITLE - 20h", "TITLE (20h)", "TITLE 8 horas")
        // NEW REGEX: Matches (\d+) followed by 'h' or 'horas', optionally inside parentheses or after a dash
        const durationRegex = /(?:[-–(]|\b)(\d+)\s*h(?:oras)?(?:\)|$)/i;
        const durationMatch = rawTitle.match(durationRegex);
        
        if (durationMatch) {
            extractedDuration = parseInt(durationMatch[1], 10);
            // Remove duration from title (globally to catch it anywhere)
            title = rawTitle.replace(new RegExp(durationRegex.source, 'gi'), '').trim();
            // console.log(`ASPY DURATION FOUND: "${rawTitle}" -> ${extractedDuration}h`);
        } else {
            // console.log(`ASPY NO DURATION: "${rawTitle}"`);
        }
        
        // [CODE] Title | Info
        const prefixMatch = title.match(/^\[([^\]]+)\]/);
        const suffixMatch = title.match(/\s+([A-Z]{3,}\d+[A-Z]*)$/);

        if (prefixMatch) {
            code = prefixMatch[1];
            title = title.replace(/^\[[^\]]+\]/, '').split('|')[0].trim();
        } else if (suffixMatch) {
            code = suffixMatch[1];
            title = title.replace(suffixMatch[0], '').trim();
        } else {
            title = cleanTitle(title);
        }
        
        // Clean up remaining artifacts like (TEÓRICO-PRÁCTICO) from title
        title = title.replace(/\s*\([^)]*TEÓRICO[^)]*\)\s*/gi, ' ').trim();
        title = title.replace(/\s+/g, ' '); // Normalize spaces
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
        startDate: startDateObj,
        startDatefmt: fechaInicioStr,
        endDate: endDateObj,
        endDatefmt: fechaFinStr,
        startDateRaw: startDateObj,
        ubicacion: ubicacion,
        delegacion: ubicacion, // Use normalized location for delegation too
        plazas: plazasDisponibles !== undefined ? plazasDisponibles : 0,
        totalPlazas: plazasTotales || 0,
        estado: (plazasDisponibles > 0) ? "CONFIRMADO" : "CERRADO",
        duracion_presencial: extractedDuration || 0
    };
};

const fetchAndParseASPY = async () => {
  const file = await fetch(ASPY_FILE);
  const buffer = await file.arrayBuffer();
  const wb = read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  // Enable cellDates to allow library to parse dates
  const json = utils.sheet_to_json(ws, { header: 1, cellDates: true }).slice(1);

  return json.map(row => parseRow(row, 'ASPY')).filter(Boolean);
};

const fetchAndParseMAS = async () => {
    const file = await fetch(MAS_FILE);
    const buffer = await file.arrayBuffer();
    const wb = read(buffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = utils.sheet_to_json(ws, { header: 1, cellDates: true }).slice(1);

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
