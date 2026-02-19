import { read, utils } from 'xlsx';

// FILE PATHS (In public folder)
const ASPY_FILE = '/data/aspy_formacion.xlsx';
const MAS_FILE = '/data/mas_formacion.xls';
const DICT_FILE = '/data/diccionario_sinergias_final.xlsx';

// KEY MAPPINGS
const TOPIC_MAP = {
  "Security": "Seguridad",
  "Prevención": "PRL",
  "Management": "Recursos Humanos",
  // Map typical MÁS topics if known, otherwise identity
  "SEGURIDAD": "Seguridad",
  "PRL": "PRL",
  "METAL": "PRL" 
};

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
    if (value === undefined || value === null) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'number') {
        if (value > 10000) {
           const date = new Date((value - 25569) * 86400 * 1000);
           return date; 
        }
        return null;
    }
    if (typeof value === 'string') {
        const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match) {
            const [_, d, m, y] = match;
            return new Date(y, m - 1, d);
        }
        const d = new Date(value);
        if (!isNaN(d)) return d;
    }
    return null;
};

const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return "";
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// PROVINCE MAP
const provinceMap = {
    "alacant": "Alicante",
    "alicante": "Alicante",
    "barcelona": "Barcelona",
    "madrid": "Madrid",
    "valencia": "Valencia",
    "sevilla": "Sevilla",
    "zaragoza": "Zaragoza",
    "malaga": "Málaga",
    "murcia": "Murcia",
    "palma": "Baleares",
    "baleares": "Baleares",
    "vizcaya": "Vizcaya",
    "bizkaia": "Vizcaya",
    "coruña": "A Coruña",
    "coruna": "A Coruña",
    "pontevedra": "Pontevedra",
    "asturias": "Asturias",
    "granada": "Granada",
    "cordoba": "Córdoba",
    "girona": "Girona",
    "gerona": "Girona",
    "tarragona": "Tarragona",
    "lleida": "Lleida",
    "lerida": "Lleida",
    "almeria": "Almería",
    "cadiz": "Cádiz",
    "huelva": "Huelva",
    "jaen": "Jaén",
    "caceres": "Cáceres",
    "badajoz": "Badajoz",
    "toledo": "Toledo",
    "ciudad real": "Ciudad Real",
    "albacete": "Albacete",
    "cuenca": "Cuenca",
    "guadalajara": "Guadalajara",
    "leon": "León",
    "zamora": "Zamora",
    "salamanca": "Salamanca",
    "valladolid": "Valladolid",
    "palencia": "Palencia",
    "burgos": "Burgos",
    "soria": "Soria",
    "segovia": "Segovia",
    "avila": "Ávila",
    "navarra": "Navarra",
    "la rioja": "La Rioja",
    "cantabria": "Cantabria",
    "huesca": "Huesca",
    "teruel": "Teruel",
    "castellon": "Castellón",
    "castello": "Castellón",
    "las palmas": "Las Palmas",
    "santa cruz": "Santa Cruz de Tenerife",
    "tenerife": "Santa Cruz de Tenerife"
};

const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const normalizeLocation = (rawLoc) => {
    if (!rawLoc) return "Desconocida";
    let clean = rawLoc.trim().toLowerCase();
    clean = removeAccents(clean);
    for (const [key, value] of Object.entries(provinceMap)) {
        if (clean.includes(key)) return value;
    }
    return clean.charAt(0).toUpperCase() + clean.slice(1);
};

// PARSER
const parseRow = (row, source) => {
    let rawTitle, fechaInicioRaw, fechaFinRaw, modalidad, duracion, ubicacionRaw, plazasTotales, plazasDisponibles, id, code, inscritosRaw;

    if (source === 'ASPY') {
        id = `ASPY-${row[0]}`;
        code = `ASPY-${row[0]}`;
        fechaInicioRaw = row[1];
        fechaFinRaw = row[2];
        rawTitle = row[4];
        modalidad = row[5];
        duracion = row[6];
        plazasTotales = row[11];
        plazasDisponibles = row[12];
        inscritosRaw = row[10];
        ubicacionRaw = row[22] || row[13]; 
    } else {
        id = `MAS-${row[0]}`;
        code = `MAS-${row[0]}`;
        rawTitle = row[1] || row[2];
        fechaInicioRaw = row[3];
        fechaFinRaw = row[4];
        modalidad = row[5];
        duracion = row[6];
        ubicacionRaw = row[16] || row[17];
        plazasTotales = row[18];
        plazasDisponibles = row[19];
        inscritosRaw = row[29];
    }
    
    if (!rawTitle) return null;

    const startDateObj = getJsDate(fechaInicioRaw);
    const endDateObj = getJsDate(fechaFinRaw);
    const fechaInicioStr = formatDate(startDateObj) || fechaInicioRaw;
    const fechaFinStr = formatDate(endDateObj) || fechaFinRaw;
    const ubicacion = normalizeLocation(ubicacionRaw);
    let title = cleanTitle(rawTitle);
    let topic = normalizeTopic(title);
    const finalDuration = parseInt(duracion, 10) || 0;
    const total = parseInt(plazasTotales, 10) || 0;
    const available = parseInt(plazasDisponibles, 10) || 0;
    const enrolled = inscritosRaw !== undefined ? (parseInt(inscritosRaw, 10) || 0) : Math.max(0, total - available);

    return {
        id: id,
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
        plazas: available,
        totalPlazas: total,
        inscritos: enrolled,
        estado: (available > 0) ? "CONFIRMADO" : "CERRADO",
        duracion_presencial: finalDuration
    };
};

// FETCHERS
const fetchAndParseASPY = async () => {
  const file = await fetch(ASPY_FILE);
  const buffer = await file.arrayBuffer();
  const wb = read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
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

export const loadSynergyDictionary = async () => {
    try {
        const file = await fetch(DICT_FILE);
        if (!file.ok) throw new Error("Dictionary file not found");
        const buffer = await file.arrayBuffer();
        const wb = read(buffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = utils.sheet_to_json(ws, { header: 1 }).slice(1);
        return json.map(row => ({
            aspyTitle: cleanTitle(row[0]),
            masTitle: cleanTitle(row[1])
        })).filter(pair => pair.aspyTitle && pair.masTitle);
    } catch (e) {
        console.warn("Could not load synergy dictionary:", e);
        return [];
    }
};

export const loadData = async () => {
  try {
    const [aspyData, masData] = await Promise.all([
      fetchAndParseASPY(),
      fetchAndParseMAS()
    ]);
    
    let combined = [...aspyData, ...masData];
    
    // Filter out past courses (Keep today onwards)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    combined = combined.filter(c => {
        if (!c.startDateRaw) return false;
        return c.startDateRaw >= today;
    });
    
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

export const calculateKPIs = (data) => ({
  confirmed: data.filter(d => d.estado === 'CONFIRMADO').length,
  closed: data.filter(d => d.estado === 'CERRADO').length,
  finalized: data.filter(d => d.estado === 'FINALIZADO').length
});

const validateHeaders = (headers, type) => {
    if (!headers || headers.length < 5) return false;
    if (type === 'ASPY') {
        return true; 
    } else {
        return true; 
    }
};

export const parseUploadedFile = async (file, type) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = utils.sheet_to_json(firstSheet, { header: 1, cellDates: true });

                if (!jsonData || jsonData.length < 2) {
                    reject(new Error("El archivo está vacío o no tiene formato válido."));
                    return;
                }

                const headers = jsonData[0];
                if (!validateHeaders(headers, type)) {
                    reject(new Error(`El formato de columnas no coincide con la plantilla de ${type}.`));
                    return;
                }

                const rows = jsonData.slice(1);
                const parsed = rows.map(row => parseRow(row, type)).filter(Boolean);
                
                if (parsed.length === 0) {
                     reject(new Error("No se encontraron cursos válidos en el archivo."));
                     return;
                }

                resolve(parsed);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

export const mergeData = (currentData, newData, type) => {
    // 1. Remove all existing records for this type
    const others = currentData.filter(d => d.source !== type);
    
    // 2. Add new records
    let combined = [...others, ...newData];

    // Filter out past courses (Keep today onwards)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    combined = combined.filter(c => {
        if (!c.startDateRaw) return false;
        return c.startDateRaw >= today;
    });

    // 3. Sort by date
    combined.sort((a, b) => {
        const dateA = a.startDateRaw || new Date(2099, 11, 31);
        const dateB = b.startDateRaw || new Date(2099, 11, 31);
        return dateA - dateB;
    });
    
    return combined;
};

export const getProcessedData = () => [];
