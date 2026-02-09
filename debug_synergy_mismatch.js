
const KEYWORD_MAP = {
    // Carretillas (Forklifts)
    'carretilla': 'carretilla',
    'frontal': 'carretilla',
    'retracil': 'carretilla',
    'apilador': 'carretilla',

    // Plataformas (PEMP / Mobile Elevating Work Platforms)
    'plataforma': 'pemp',
    'pemp': 'pemp',
    'elevadora': 'pemp', // Usually 'Plataforma Elevadora', check context if 'Carretilla Elevadora' exists

    // General Safety (Resources)
    'recurso': 'preventivo',
    'prl': 'prl',
    'basico': 'prl_basico',

    // Heights
    'altura': 'altura',
    'vertical': 'altura',

    // Emergencies
    'primeros': 'auxilios',
    'espacio': 'confinado',
    'fuego': 'extincion',
    'incendio': 'incendio',
    'emergencia': 'emergencia',

    // Machinery
    'puente': 'grua',
    'grua': 'grua',

    // Electrical
    'electric': 'electric',
    'tensión': 'electric', // Riesgo eléctrico / Alta tensión

    // Office/Ergonomics
    'oficina': 'pantalla',
    'pantalla': 'pantalla',
    
    // Others
    'riesgo': 'riesgo' // Generic, might need refinement
};

const getKeywords = (title) => {
    if (!title) return [];
    const normalized = title.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents

    const found = new Set();
    
    // Special handling for 'Carretilla Elevadora' vs 'Plataforma Elevadora'
    if (normalized.includes('carretilla')) {
        found.add('carretilla');
    } else if (normalized.includes('plataforma') || normalized.includes('pemp')) {
        found.add('pemp');
    } else {
        // Fallback to map for other terms
        for (const [key, value] of Object.entries(KEYWORD_MAP)) {
            if (normalized.includes(key)) {
                // Determine if we should add it based on specific exclusions
                if (key === 'elevadora' && found.has('carretilla')) continue; // Already handled
                found.add(value);
            }
        }
    }
    
    return Array.from(found);
};

const t1 = "CONDUCCIÓN Y MANEJO SEGURO DE PLATAFORMAS ELEVADORAS. TEÓRICO-PRÁCTICO";
const t2 = "SEGURIDAD EN EL USO DE CARRETILLAS ELEVADORAS";

const k1 = getKeywords(t1);
const k2 = getKeywords(t2);

const intersection = k1.filter(k => k2.includes(k));

console.log(`Title 1: "${t1}"`);
console.log(`Keywords 1:`, k1);
console.log(`Title 2: "${t2}"`);
console.log(`Keywords 2:`, k2);
console.log(`Match?`, intersection.length > 0);
console.log(`Common keywords:`, intersection);
