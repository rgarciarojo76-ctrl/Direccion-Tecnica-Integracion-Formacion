
/**
 * Synergy Engine v1.0.0
 * Finds optimization opportunities between MAS and ASPY courses.
 * 
 * Rules:
 * 1. Priority: The company with more "Inscritos" is the "Anfitriona" (Host).
 * 2. Capacity Validation:
 *    A) If Anfitriona has enough slots → recommend transfer.
 *    B) If swapping roles makes it fit → recommend permuted transfer.
 *    C) If neither fits → "Agrupación no recomendada".
 * 3. Zero-enrolled filter: If either company has 0 inscritos, 
 *    no transfer arrow is shown. Mark as "Grupo de Referencia en la zona".
 */

console.log("Synergy Engine v1.0.0 Loaded - Capacity Validation Active");

const KEYWORD_MAP = {
    // Carretillas (Forklifts)
    'carretilla': 'carretilla',
    'frontal': 'carretilla',
    'retracil': 'carretilla',
    'apilador': 'carretilla',

    // Plataformas (PEMP / Mobile Elevating Work Platforms)
    'plataforma': 'pemp',
    'pemp': 'pemp',

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
    'tensión': 'electric',

    // Office/Ergonomics
    'oficina': 'pantalla',
    'pantalla': 'pantalla',
    
    // Others
    'riesgo': 'riesgo'
};

const getKeywords = (title) => {
    if (!title) return [];
    const normalized = title.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents

    const found = new Set();
    
    // 1. Explicit Checks
    if (normalized.includes('carretilla') || normalized.includes('frontal') || normalized.includes('retracil') || normalized.includes('apilador')) {
        found.add('carretilla');
    }
    
    if (normalized.includes('plataforma') || normalized.includes('pemp')) {
        found.add('pemp');
    }

    // 2. Loop through Map
    for (const [key, value] of Object.entries(KEYWORD_MAP)) {
        if (normalized.includes(key)) {
            if (key === 'elevadora') {
                 if (!found.has('carretilla')) {
                     found.add('pemp'); 
                 }
            } else {
                 found.add(value);
            }
        }
    }
    
    return Array.from(found);
};

const areSimilar = (t1, t2) => {
    const k1 = getKeywords(t1);
    const k2 = getKeywords(t2);
    return k1.some(k => k2.includes(k));
};


/**
 * Core synergy detection with capacity validation.
 * 
 * @param {Array} allCourses - All parsed courses (MAS + ASPY).
 * @returns {Array} Array of group objects with scenarioType.
 */
export const findOptimizations = (allCourses) => {
    const validCourses = allCourses.filter(c => c.ubicacion && c.startDateRaw);
    const processedIds = new Set();
    const optimizedGroups = [];

    // Sort by date to process soonest first
    validCourses.sort((a, b) => a.startDateRaw - b.startDateRaw);

    for (let i = 0; i < validCourses.length; i++) {
        const courseA = validCourses[i];
        if (processedIds.has(courseA.id)) continue;

        let bestMatch = null;
        let bestScore = -1;

        for (let j = i + 1; j < validCourses.length; j++) {
            const courseB = validCourses[j];
            if (processedIds.has(courseB.id)) continue;

            // Must be different companies (MAS ↔ ASPY)
            if (courseA.source === courseB.source) continue;

            // 1. Location Match (same province)
            if (courseA.ubicacion !== courseB.ubicacion) continue;

            // 2. Same week match (±7 days as fallback)
            const daysDiff = Math.abs((courseA.startDateRaw - courseB.startDateRaw) / (1000 * 60 * 60 * 24));
            if (daysDiff > 15) continue;

            // 3. Topic/Title Match
            if (!areSimilar(courseA.title, courseB.title)) continue;

            // Calculate Score (closer date = better)
            const score = 100 - daysDiff;

            if (score > bestScore) {
                bestScore = score;
                bestMatch = courseB;
            }
        }

        if (bestMatch) {
            processedIds.add(courseA.id);
            processedIds.add(bestMatch.id);

            const group = buildSynergyGroup(courseA, bestMatch);
            optimizedGroups.push(group);
        }
    }

    return optimizedGroups;
};

/**
 * Builds a synergy group object applying all three rules:
 * 1. Priority (higher inscritos = Anfitriona)
 * 2. Capacity validation (Scenarios A, B, C)
 * 3. Zero-enrolled filter
 */
function buildSynergyGroup(c1, c2) {
    const inscritosA = Number(c1.inscritos) || 0;
    const inscritosB = Number(c2.inscritos) || 0;

    // === RULE 3: Zero-enrolled filter ===
    if (inscritosA === 0 || inscritosB === 0) {
        const bothZero = inscritosA === 0 && inscritosB === 0;
        const reference = inscritosA > 0 ? c1 : (inscritosB > 0 ? c2 : c1);
        const other = reference === c1 ? c2 : c1;

        if (bothZero) {
            // Neither company has students → unlikely future grouping
            return {
                type: 'group',
                id: `group-${c1.id}-${c2.id}`,
                courses: [c1, c2],
                scenarioType: 'reference_unlikely',
                suggestion: `Improbable agrupación futura: ninguna compañía tiene alumnos inscritos`,
                anfitriona: c1,
                emisora: c2,
                alumnosToMove: 0
            };
        }

        // One company has students, the other doesn't → potential future grouping
        return {
            type: 'group',
            id: `group-${c1.id}-${c2.id}`,
            courses: [reference, other],
            scenarioType: 'reference_potential',
            suggestion: `Posible agrupación futura: ${reference.source} tiene ${reference.inscritos} alumnos inscritos y ${reference.plazas} plazas disponibles`,
            anfitriona: reference,
            emisora: other,
            alumnosToMove: 0
        };
    }

    // === RULE 1: Priority — higher inscritos = Anfitriona ===
    let anfitriona, emisora;
    if (inscritosA >= inscritosB) {
        anfitriona = c1;
        emisora = c2;
    } else {
        anfitriona = c2;
        emisora = c1;
    }

    const anfitDisponibles = Number(anfitriona.plazas) || 0;
    const emisoraInscritos = Number(emisora.inscritos) || 0;
    const emisoraDisponibles = Number(emisora.plazas) || 0;
    const anfitInscritos = Number(anfitriona.inscritos) || 0;

    // === RULE 2: Capacity validation ===

    // Escenario A: Anfitriona has enough room for all Emisora students
    if (anfitDisponibles >= emisoraInscritos) {
        return {
            type: 'group',
            id: `group-${c1.id}-${c2.id}`,
            courses: [anfitriona, emisora],
            scenarioType: 'optimal',
            suggestion: `Oportunidad de optimización detectada: ${emisoraInscritos} alumno(s) de ${emisora.source} ➔ Curso ${anfitriona.source}`,
            anfitriona,
            emisora,
            alumnosToMove: emisoraInscritos
        };
    }

    // Escenario B: Swap roles — check if Emisora has more room than Anfitriona
    if (emisoraDisponibles > anfitDisponibles && emisoraDisponibles >= anfitInscritos) {
        // Swap: the one with more room becomes the new Anfitriona
        return {
            type: 'group',
            id: `group-${c1.id}-${c2.id}`,
            courses: [emisora, anfitriona], // Swapped order
            scenarioType: 'permuted',
            suggestion: `Oportunidad de optimización detectada: ${anfitInscritos} alumno(s) de ${anfitriona.source} ➔ Curso ${emisora.source}`,
            anfitriona: emisora,   // Swapped
            emisora: anfitriona,   // Swapped
            alumnosToMove: anfitInscritos
        };
    }

    // Escenario C: Neither direction works — overflow
    return {
        type: 'group',
        id: `group-${c1.id}-${c2.id}`,
        courses: [anfitriona, emisora],
        scenarioType: 'overflow',
        suggestion: `Agrupación no recomendada por superar el número máximo de alumnos de las dos compañías`,
        anfitriona,
        emisora,
        alumnosToMove: 0
    };
}

// Helper to inject grouping info into the flat list
export const processCourseListWithGroups = (rawCourses) => {
    // 1. Reset synergy flags
    const courses = rawCourses.map(c => ({...c, isGrouped: false, groupData: null }));
    
    // 2. Find groups
    const optimizations = findOptimizations(courses);
    
    if (optimizations.length === 0) return courses;

    const finalStructure = [];
    const groupedIds = new Set();

    optimizations.forEach(group => {
        group.courses.forEach(c => groupedIds.add(c.id));
        finalStructure.push(group);
    });

    // Add remaining courses
    courses.forEach(c => {
        if (!groupedIds.has(c.id)) {
            finalStructure.push(c);
        }
    });

    // Sort everything by date again
    finalStructure.sort((a, b) => {
        const dateA = a.type === 'group' ? a.courses[0].startDateRaw : a.startDateRaw;
        const dateB = b.type === 'group' ? b.courses[0].startDateRaw : b.startDateRaw;
        return dateA - dateB;
    });

    return finalStructure;
};
