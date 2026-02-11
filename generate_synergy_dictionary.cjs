/**
 * Synergy Audit Dictionary Generator v2
 * 
 * Generates a conciliation Excel with unique, high-confidence course pairings.
 * Uses stricter matching: requires specific keyword overlap (not generic ones).
 * Each title maps to at most ONE best match (1:1 pairing).
 * 
 * Output: Título ASPY | Título MÁS | Palabras Clave Sinergia
 */

const XLSX = require('xlsx');
const path = require('path');

// ── Keyword extraction (strict, specific categories) ─────────────────

const KEYWORD_RULES = [
    // Order matters: more specific first
    { pattern: /carretilla|retracil|apilador/i, label: 'Carretillas', weight: 3 },
    { pattern: /plataforma.*elevador|pemp/i,    label: 'PEMP', weight: 3 },
    { pattern: /plataforma/i,                   label: 'Plataformas', weight: 2 },
    { pattern: /puente.*gr[uú]a/i,              label: 'Puente Grúa', weight: 3 },
    { pattern: /gr[uú]a.*torre/i,               label: 'Grúa Torre', weight: 3 },
    { pattern: /gr[uú]a.*m[oó]vil|autogrua/i,   label: 'Grúa Móvil', weight: 3 },
    { pattern: /gr[uú]a/i,                      label: 'Grúa', weight: 2 },
    { pattern: /espacio.*confinado/i,            label: 'Espacios Confinados', weight: 3 },
    { pattern: /primeros.*auxilio/i,             label: 'Primeros Auxilios', weight: 3 },
    { pattern: /extinci[oó]n.*incendio|incendio.*extinci/i, label: 'Extinción Incendios', weight: 3 },
    { pattern: /incendio|fuego/i,               label: 'Incendios', weight: 2 },
    { pattern: /emergencia|evacuaci[oó]n/i,     label: 'Emergencias', weight: 2 },
    { pattern: /altura|vertical/i,              label: 'Trabajos en Altura', weight: 3 },
    { pattern: /recurso.*preventivo/i,          label: 'Recurso Preventivo', weight: 3 },
    { pattern: /el[eé]ctric|tensi[oó]n/i,       label: 'Riesgo Eléctrico', weight: 3 },
    { pattern: /pantalla.*visualizaci|pvd/i,    label: 'PVD (Pantallas)', weight: 3 },
    { pattern: /oficina/i,                      label: 'Trabajo en Oficina', weight: 2 },
    { pattern: /soldadura|soldar/i,             label: 'Soldadura', weight: 3 },
    { pattern: /manipula.*carga|manual.*carga/i, label: 'Manipulación Cargas', weight: 3 },
    { pattern: /ergonomia|ergon[oó]mic/i,       label: 'Ergonomía', weight: 2 },
    { pattern: /se[nñ]alizaci[oó]n/i,           label: 'Señalización', weight: 2 },
    { pattern: /ruido/i,                        label: 'Ruido', weight: 3 },
    { pattern: /qu[ií]mico/i,                   label: 'Riesgo Químico', weight: 3 },
    { pattern: /atex|atmosfera.*explosiva/i,    label: 'ATEX', weight: 3 },
    { pattern: /amianto/i,                      label: 'Amianto', weight: 3 },
    { pattern: /metal.*construcci[oó]n|sector.*metal/i, label: 'Sector Metal', weight: 3 },
    { pattern: /construcci[oó]n/i,              label: 'Construcción', weight: 2 },
    { pattern: /metal/i,                        label: 'Metal', weight: 2 },
    { pattern: /alimenta|higiene.*alimenta/i,   label: 'Alimentación', weight: 3 },
    { pattern: /dea|desfibrilador/i,            label: 'DEA', weight: 3 },
    { pattern: /camion|vehiculo.*pesado/i,      label: 'Conducción Vehículos', weight: 2 },
    { pattern: /conducci[oó]n/i,                label: 'Conducción', weight: 1 },
    { pattern: /liderazgo|equipo.*trabajo/i,    label: 'Liderazgo/Equipos', weight: 2 },
    // Generic (low weight, won't drive matches alone)
    { pattern: /prl|prevenci[oó]n.*riesgo/i,    label: 'PRL', weight: 1 },
    { pattern: /b[aá]sic/i,                     label: 'Nivel Básico', weight: 1 },
    { pattern: /seguridad/i,                    label: 'Seguridad', weight: 1 },
];

function getKeywords(title) {
    if (!title) return [];
    const results = [];
    for (const rule of KEYWORD_RULES) {
        if (rule.pattern.test(title)) {
            results.push({ label: rule.label, weight: rule.weight });
        }
    }
    return results;
}

function matchScore(t1, t2) {
    const k1 = getKeywords(t1);
    const k2 = getKeywords(t2);
    
    let totalWeight = 0;
    const commonLabels = [];
    
    for (const kw1 of k1) {
        if (k2.some(kw2 => kw2.label === kw1.label)) {
            totalWeight += kw1.weight;
            commonLabels.push(kw1.label);
        }
    }
    
    // Require at least one specific match (weight >= 2) 
    const hasSpecific = commonLabels.some(label => {
        const rule = KEYWORD_RULES.find(r => r.label === label);
        return rule && rule.weight >= 2;
    });
    
    if (!hasSpecific) return { score: 0, labels: [] };
    
    return { score: totalWeight, labels: [...new Set(commonLabels)] };
}

// ── Data loading ─────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, 'public', 'data');

function loadASPY() {
    const wb = XLSX.readFile(path.join(DATA_DIR, 'aspy_blue_2026.xlsx'));
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1);
    
    const titles = new Set();
    for (const row of rows) {
        let title = row[4];
        if (!title || typeof title !== 'string') continue;
        title = title.replace(/\[.*?\]/g, '').trim();
        title = title.replace(/\s*\(.*?\)\s*$/, '').trim();
        if (title) titles.add(title);
    }
    return Array.from(titles).sort();
}

function loadMAS() {
    const wb = XLSX.readFile(path.join(DATA_DIR, 'mas_2026.xls'));
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1);

    const titles = new Set();
    for (const row of rows) {
        let title = row[1];
        if (!title || typeof title !== 'string') continue;
        title = title.trim();
        if (title) titles.add(title);
    }
    return Array.from(titles).sort();
}

// ── Best-match pairing (1:1) ─────────────────────────────────────────

function buildDictionary() {
    console.log('📖 Loading ASPY courses...');
    const aspyTitles = loadASPY();
    console.log(`   ✓ ${aspyTitles.length} unique ASPY titles`);

    console.log('📖 Loading MÁS courses...');
    const masTitles = loadMAS();
    console.log(`   ✓ ${masTitles.length} unique MÁS titles`);

    // Build all potential matches with scores
    const allMatches = [];
    for (const mas of masTitles) {
        for (const aspy of aspyTitles) {
            const result = matchScore(aspy, mas);
            if (result.score > 0) {
                allMatches.push({ aspy, mas, score: result.score, keywords: result.labels.join(', ') });
            }
        }
    }

    // Sort by score descending → greedy 1:1 assignment
    allMatches.sort((a, b) => b.score - a.score);

    const usedASPY = new Set();
    const usedMAS = new Set();
    const pairs = [];

    for (const m of allMatches) {
        if (usedASPY.has(m.aspy) || usedMAS.has(m.mas)) continue;
        pairs.push(m);
        usedASPY.add(m.aspy);
        usedMAS.add(m.mas);
    }

    console.log(`🔗 ${pairs.length} unique 1:1 pairings found`);

    // Orphaned ASPY
    let orphanASPY = 0;
    for (const aspy of aspyTitles) {
        if (!usedASPY.has(aspy)) {
            const kws = getKeywords(aspy).map(k => k.label).join(', ') || '—';
            pairs.push({ aspy, mas: '', keywords: kws });
            orphanASPY++;
        }
    }

    // Orphaned MAS
    let orphanMAS = 0;
    for (const mas of masTitles) {
        if (!usedMAS.has(mas)) {
            const kws = getKeywords(mas).map(k => k.label).join(', ') || '—';
            pairs.push({ aspy: '', mas, keywords: kws });
            orphanMAS++;
        }
    }

    console.log(`📭 ${orphanASPY} ASPY orphans, ${orphanMAS} MÁS orphans`);

    // Sort: paired first (by score desc), then orphans alphabetically
    pairs.sort((a, b) => {
        const aIsPair = a.aspy && a.mas ? 1 : 0;
        const bIsPair = b.aspy && b.mas ? 1 : 0;
        if (aIsPair !== bIsPair) return bIsPair - aIsPair; // pairs first
        if (aIsPair && bIsPair) return (b.score || 0) - (a.score || 0);
        return (a.aspy || a.mas).localeCompare(b.aspy || b.mas);
    });

    return pairs;
}

// ── Excel export ─────────────────────────────────────────────────────

function exportExcel(pairs) {
    const header = ['Título ASPY', 'Título MÁS', 'Palabras Clave Sinergia'];
    const data = [header, ...pairs.map(p => [p.aspy, p.mas, p.keywords])];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    ws['!cols'] = [
        { wch: 70 },
        { wch: 70 },
        { wch: 45 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Diccionario Sinergias');

    const outPath = path.join(__dirname, 'diccionario_sinergias_audit.xlsx');
    XLSX.writeFile(wb, outPath);
    console.log(`\n✅ Archivo generado: ${outPath}`);
    return outPath;
}

// ── Main ─────────────────────────────────────────────────────────────

const pairs = buildDictionary();
const outFile = exportExcel(pairs);
const paired = pairs.filter(p => p.aspy && p.mas).length;
const oASPY = pairs.filter(p => !p.mas).length;
const oMAS = pairs.filter(p => !p.aspy).length;

console.log(`\n📊 Resumen Final:`);
console.log(`   • Total filas en Excel: ${pairs.length}`);
console.log(`   • Parejas con sinergia: ${paired}`);
console.log(`   • Huérfanos ASPY (sin pareja MÁS): ${oASPY}`);
console.log(`   • Huérfanos MÁS (sin pareja ASPY): ${oMAS}`);
