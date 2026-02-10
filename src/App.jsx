import React, { useState, useEffect, useMemo } from 'react';
import { Download, Layout } from 'lucide-react';

import FilterBar from './components/FilterBar';
import CoursesTable from './components/CoursesTable';
import { loadData } from './utils/dataProcessor';
import { processCourseListWithGroups } from './utils/synergyEngine';
import { exportToExcel, exportToPDF } from './utils/exportUtils';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    location: '',
    company: 'ALL',
    showSynergiesOnly: false
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

  // Filter Logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const checkCourse = (c) => {
         const matchesSearch = c.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                               c.code.toLowerCase().includes(filters.search.toLowerCase());
         
         let matchesStart = true;
         if (filters.startDate) {
           matchesStart = new Date(c.startDateRaw) >= new Date(filters.startDate);
         }

         let matchesEnd = true;
         if (filters.endDate) {
            matchesEnd = new Date(c.startDateRaw) <= new Date(filters.endDate);
         }
         
         const matchesLoc = filters.location === '' || c.ubicacion === filters.location;
         const matchesCompany = filters.company === 'ALL' || c.source === filters.company;

         return matchesSearch && matchesStart && matchesEnd && matchesLoc && matchesCompany;
      };

      if (filters.showSynergiesOnly) {
          return item.type === 'group';
      }

      if (item.type === 'group') {
        return item.courses.some(checkCourse);
      }
      
      return checkCourse(item);
    });
  }, [data, filters]);

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const rawData = await loadData();
      const processed = processCourseListWithGroups(rawData);
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

  return (
    <div className="app-container">
      {/* TOP BAR */}
      <header className="main-header">
        <div className="header-content max-w-7xl mx-auto px-6">
          <div className="header-left flex items-center gap-6">
            <div className="logo-container flex flex-col justify-center">
               <img 
                 src="/logos/ia_lab_logo.png" 
                 alt="IA LAB" 
                 className="object-contain"
                 style={{ height: '48px', width: 'auto' }}
               />
            </div>
            
            <div className="header-separator"></div>

            <div className="flex flex-col justify-center">
              <h1 className="header-brand-title">
                DIRECCIÓN TÉCNICA IA LAB
              </h1>
              <p className="header-brand-subtitle">
                App: Prueba concepto programación de cursos conjuntos
              </p>
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
          </div>
          <button onClick={handleExport} className="btn-export">
            <Download size={16} />
            <span>Exportar Informe</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* FILTERS & TOOLBAR */}
        <div className="card p-6 mb-6 bg-white rounded-2xl shadow-sm border border-slate-100">
           <h3 className="text-lg font-semibold text-slate-700 mb-4">Filtros de Búsqueda</h3>
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
             <CoursesTable data={filteredData} />
          )}
        </div>

      </main>
    </div>
  );
}

export default App;
