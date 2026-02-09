
import { findOptimizations } from './src/utils/synergyEngine.js';

const mockCourses = [
    {
        id: 'MAS-TEST-1',
        source: 'MAS',
        title: "CONDUCCIÓN Y MANEJO SEGURO DE PLATAFORMAS ELEVADORAS. TEÓRICO-PRÁCTICO",
        startDateRaw: new Date('2026-06-01').getTime(),
        startDatefmt: '01/06/2026',
        ubicacion: 'Madrid',
        plazas: 5,
        hasSynergy: false
    },
    {
        id: 'ASPY-TEST-1',
        source: 'ASPY',
        title: "SEGURIDAD EN EL USO DE CARRETILLAS ELEVADORAS",
        startDateRaw: new Date('2026-06-02').getTime(), // 1 day diff
        startDatefmt: '02/06/2026',
        ubicacion: 'Madrid',
        plazas: 5, // has slots
        hasSynergy: false
    }
];

console.log("Running matching logic...");
const groups = findOptimizations(mockCourses);

if (groups.length > 0) {
    console.log("❌ MATCH FOUND (Unexpected)");
    console.log(JSON.stringify(groups, null, 2));
} else {
    console.log("✅ NO MATCH FOUND (Correct)");
}
