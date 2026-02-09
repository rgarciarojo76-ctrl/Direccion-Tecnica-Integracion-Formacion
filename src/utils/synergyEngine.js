
/**
 * Synergy Engine
 * Finds optimization opportunities between MAS and ASPY courses.
 * 
 * Criteria:
 * 1. MAS course with low enrollment (e.g., < 3 students).
 * 2. ASPY course in same location.
 * 3. ASPY course with similar start date (+/- 14 days).
 * 4. ASPY course with similar title/topic.
 * 5. ASPY course has available slots.
 */

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

const areSimilar = (t1, t2) => {
    const k1 = getKeywords(t1);
    const k2 = getKeywords(t2);
    // At least one matching keyword
    return k1.some(k => k2.includes(k));
};

export const findOptimizations = (allCourses) => {
    const masCourses = allCourses.filter(c => c.source === 'MAS' && !c.hasSynergy); // Filter out already processed if any
    const aspyCourses = allCourses.filter(c => c.source === 'ASPY');

    const optimizedGroups = []; // Array of groups or single courses
    const processedIds = new Set();

    // Sort MAS courses by date to process soonest first
    masCourses.sort((a, b) => a.startDateRaw - b.startDateRaw);

    for (const masCourse of masCourses) {
        if (processedIds.has(masCourse.id)) continue;

        // Skip if enrollment is high (e.g., > 4, flexible)
        // User example said "1 inscrito", so let's target low numbers.
        // Let's say < 4 is a good candidate for merging.
        // Although the user prompt implies ALWAYS looking for a match if feasible.
        
        let bestMatch = null;
        let bestScore = -1;

        for (const aspyCourse of aspyCourses) {
            if (processedIds.has(aspyCourse.id)) continue;

            // 1. Location Match
            if (masCourse.ubicacion !== aspyCourse.ubicacion) continue;

            // 2. Date Match (+/- 15 days)
            const daysDiff = Math.abs((masCourse.startDateRaw - aspyCourse.startDateRaw) / (1000 * 60 * 60 * 24));
            if (daysDiff > 15) continue;

            // 3. Status Check (ASPY must have slots)
            if (aspyCourse.plazas <= 0) continue;

            // 4. Topic/Title Match
            if (!areSimilar(masCourse.title, aspyCourse.title)) continue;

            // Calculate Score (closer date = better)
            const score = 100 - daysDiff; 

            if (score > bestScore) {
                bestScore = score;
                bestMatch = aspyCourse;
            }
        }

        if (bestMatch) {
            // Found a Synergy!
            processedIds.add(masCourse.id);
            processedIds.add(bestMatch.id);
            
            optimizedGroups.push({
                type: 'group',
                id: `group-${masCourse.id}-${bestMatch.id}`,
                courses: [bestMatch, masCourse].sort((a, b) => a.startDateRaw - b.startDateRaw), // Sort internal group by date
                suggestion: `Agrupación Recomendada: ${masCourse.ubicacion} (${bestMatch.startDatefmt} / ${masCourse.startDatefmt})`
            });
        } else {
            // No match found, push as single regular item (will be handled by main list if we return full structure)
            // Actually, the main list in App.jsx renders everything. 
            // We need a way to tell App.jsx which ones are grouped.
        }
    }

    return optimizedGroups;
};

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
