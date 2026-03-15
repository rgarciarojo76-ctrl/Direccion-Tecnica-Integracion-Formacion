import React, { useState, useEffect, useMemo } from 'react';
import { Download, Layout } from 'lucide-react';

import FilterBar from './components/FilterBar';
import CoursesTable from './components/CoursesTable';
import KPIDashboard from './components/KPIDashboard';
import EconomicDashboard from './components/EconomicDashboard';
import { useUnificationMetrics } from './hooks/useUnificationMetrics';
import { loadData, loadSynergyDictionary } from './utils/dataProcessor';
import { processCourseListWithGroups } from './utils/synergyEngine';
import { exportToExcel, exportToPDF } from './utils/exportUtils';
import pkg from '../package.json';
import './App.css';

function App() {
  const formatDateSpanish = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const months = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  };

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Unification State (persisted in localStorage)
  const [unifications, setUnifications] = useState(() => {
    try {
      const saved = localStorage.getItem('unifications');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // Filter State
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    location: '',
    company: 'ALL',
    showSynergiesOnly: false,
    showUnifiedOnly: false,
    viabilities: []
  });

  // Unique Values for "Tabulated" filters
  const uniqueTitles = useMemo(() => {
    const flat = data.flatMap(item => item.type === 'group' ? item.courses : item);
    const titles = flat.map(d => d.title);
    return [...new Set(titles)].sort();
  }, [data]);

  const uniqueLocations = useMemo(() => {
    const flat = data.flatMap(item => item.type === 'group' ? item.courses : item);
    const locs = flat.map(d => d.ubicacion);
    return [...new Set(locs)].sort();
  }, [data]);

  // Pre-calculate timestamps for ultra-fast filtering
  const filterTimestamps = useMemo(() => {
    return {
      start: filters.startDate ? new Date(filters.startDate).getTime() : null,
      end: filters.endDate ? new Date(filters.endDate).getTime() : null
    };
  }, [filters.startDate, filters.endDate]);

  // Filter Logic
  const filteredData = useMemo(() => {
    const { start, end } = filterTimestamps;
    const searchLower = filters.search.toLowerCase();

    // Mapping viabilities array to allowed scenarioTypes
    let allowedScenarios = null;
    if (filters.viabilities && filters.viabilities.length > 0) {
      allowedScenarios = [];
      if (filters.viabilities.includes('Recomendada')) allowedScenarios.push('optimal', 'permuted');
      if (filters.viabilities.includes('Posible')) allowedScenarios.push('reference_potential');
      if (filters.viabilities.includes('Improbable')) allowedScenarios.push('reference_unlikely');
      if (filters.viabilities.includes('No recomendada')) allowedScenarios.push('overflow');
    }

    return data.filter(item => {
      // If viabilities filter is active, only show matching groups
      if (allowedScenarios) {
        if (item.type !== 'group' || !allowedScenarios.includes(item.scenarioType)) {
          return false;
        }
      }

      // Si el usuario quiere ver "Cursos Unificados", solo permitimos los grupos que tengan unificacion
      // e ignoramos el filtro de fechas para ellos.
      const isUnifiedGroup = item.type === 'group' && unifications[item.id];
      if (filters.showUnifiedOnly && !isUnifiedGroup) {
        return false;
      }

      const checkCourse = (c) => {
         const matchesSearch = c.title.toLowerCase().includes(searchLower) || 
                               c.code.toLowerCase().includes(searchLower);
         
         const courseTime = c.startDateRaw ? (c.startDateRaw instanceof Date ? c.startDateRaw.getTime() : new Date(c.startDateRaw).getTime()) : null;

         let matchesStart = true;
         // Bypass date checking if we are specifically showing unified courses
         if (start && !filters.showUnifiedOnly) {
           matchesStart = courseTime && courseTime >= start;
         }

         let matchesEnd = true;
         if (end && !filters.showUnifiedOnly) {
            matchesEnd = courseTime && courseTime <= end;
         }
         
         const matchesLoc = filters.location === '' || c.ubicacion === filters.location;
         const matchesCompany = filters.company === 'ALL' || c.source === filters.company;

         return matchesSearch && matchesStart && matchesEnd && matchesLoc && matchesCompany;
      };

      if (filters.showSynergiesOnly && !filters.showUnifiedOnly) {
          return item.type === 'group' && item.courses.some(checkCourse);
      }

      if (item.type === 'group') {
        return item.courses.some(checkCourse);
      }
      
      return checkCourse(item);
    });
  }, [data, filters, unifications, filterTimestamps]);

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [rawData, dictionary] = await Promise.all([
        loadData(),
        loadSynergyDictionary()
      ]);
      const processed = processCourseListWithGroups(rawData, dictionary);
      setData(processed);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleFilterChange = (name, value) => {
    setFilters(prev => {
        const next = { ...prev, [name]: value };
        if (name === 'location' && value && value.trim() !== '') {
            next.showSynergiesOnly = true;
        }
        return next;
    });
  };

  const handleExport = () => {
    const flatData = filteredData.flatMap(item => item.type === 'group' ? item.courses : item);
    if (confirm("¿Desea exportar a Excel? (Cancelar para PDF)")) {
      exportToExcel(flatData);
    } else {
      exportToPDF(flatData);
    }
  };

  // Persist unifications to localStorage (Background)
  useEffect(() => {
    localStorage.setItem('unifications', JSON.stringify(unifications));
  }, [unifications]);

  // Unification handlers
  const handleUnify = (groupId, entidad) => {
    setUnifications(prev => ({ ...prev, [groupId]: entidad }));
  };

  const handleUndoUnify = (groupId) => {
    setUnifications(prev => {
      const next = { ...prev };
      delete next[groupId];
      return next;
    });
  };

  // Economic metrics (Calculated over ALL data, independent of filters)
  const allSynergyGroups = useMemo(() => 
    data.filter(item => item.type === 'group'), 
    [data]
  );
  const economicMetrics = useUnificationMetrics(allSynergyGroups, unifications);

  return (
    <div className="app-container">
      {/* TOP BAR */}
      <header className="main-header">
        <div className="header-content max-w-7xl mx-auto px-6">
          <div className="header-left flex items-center">
            {/* IA LAB Horizontal Logo (includes brand text) */}
            <div className="logo-container flex items-center">
               <img 
                 src="/logos/ia_lab_logo_horizontal.png" 
                 alt="Dirección Técnica IA LAB" 
                 className="object-contain"
                 style={{ height: '42px', width: 'auto' }}
               />
            </div>
            
            {/* App descriptor - separated by subtle divider */}
            <div className="header-separator" style={{ marginLeft: '1.25rem', marginRight: '1.25rem' }}></div>
            <div className="flex flex-col justify-center">
              <span style={{ color: '#009ee3', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}>
                DIRECCIÓN TÉCNICA IA LAB
              </span>
              <span style={{ color: '#009ee3', fontWeight: 500, fontSize: '0.8rem', lineHeight: 1.3 }}>
                Aplicación: Prueba concepto programación de cursos conjuntos
              </span>
            </div>
          </div>

          <div className="header-right flex items-center gap-3">
            <div className="status-pill">
              Estado: Piloto Interno
            </div>
            <div className="warning-pill">
              <span className="font-bold">AVISO:</span> Datos en validación.
            </div>
          </div>
        </div>
      </header>

      {/* HERO TITLE BAR */}
      <div className="hero-section">
        <div className="max-w-7xl mx-auto px-6 hero-inner">
          <div>
            <h2 className="hero-title">
              Programación Oferta Formativa Conjunta ASPY - MAS 2026
            </h2>
            <p className="hero-subtitle">
              Visualización unificada de cursos y detección de oportunidades de sinergia
            </p>
            <p className="hero-subtitle" style={{ marginTop: '0.2rem' }}>
              Última actualización de datos: {formatDateSpanish(pkg.buildTimestamp)}
            </p>
          </div>
          <button onClick={handleExport} className="btn-export">
            <Download size={16} />
            <span>Exportar Informe</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* KPI DASHBOARD */}
        {!loading && <KPIDashboard data={filteredData} />}

        {/* ECONOMIC DASHBOARD */}
        {!loading && <EconomicDashboard metrics={economicMetrics} />}

        {/* FILTERS */}
        <div className="card p-4 mb-4 bg-white rounded-xl shadow-sm border border-slate-100">
           <FilterBar 
             filters={filters} 
             onFilterChange={handleFilterChange} 
             uniqueTitles={uniqueTitles}
             uniqueLocations={uniqueLocations}
           />
        </div>

        {/* DATA TABLE */}
        <div className="mt-6">
          {loading ? (
             <div className="p-12 text-center text-slate-500">
                <span className="animate-pulse">Cargando datos...</span>
             </div>
          ) : (
             <CoursesTable 
               data={filteredData} 
               unifications={unifications}
               onUnify={handleUnify}
               onUndoUnify={handleUndoUnify}
             />
          )}
        </div>

      </main>
    </div>
  );
}

export default App;
