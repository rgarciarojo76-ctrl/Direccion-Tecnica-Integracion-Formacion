import React, { useState, useEffect, useMemo } from 'react';
import { Download, Layout, Settings } from 'lucide-react';

import FilterBar from './components/FilterBar';
import CoursesTable from './components/CoursesTable';
import { loadData } from './utils/dataProcessor';
import { processCourseListWithGroups } from './utils/synergyEngine'; // Import engine
import { exportToExcel, exportToPDF } from './utils/exportUtils';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: ''
  });

  // Unique Values for "Tabulated" filters
  const uniqueTitles = useMemo(() => {
    // Flatten groups to get all titles
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
      // Helper to check a single course against filters
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
         
         return matchesSearch && matchesStart && matchesEnd && matchesLoc;
      };

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
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = () => {
    // Flatten data for export
    const flatData = filteredData.flatMap(item => item.type === 'group' ? item.courses : item);
    
    if (confirm("¿Desea exportar a Excel? (Cancelar para PDF)")) {
      exportToExcel(flatData);
    } else {
      exportToPDF(flatData);
    }
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="main-header">
        <div className="header-content max-w-7xl mx-auto px-6">
          <div className="header-left flex items-center gap-6">
            {/* IA LAB Logo (Full) */}
            <div className="logo-container flex flex-col justify-center">
               <img 
                 src="/logos/ia_lab_logo.png" 
                 alt="DIRECCIÓN TÉCNICA IA LAB" 
                 className="object-contain"
                 style={{ height: '65px', width: 'auto' }}
               />
            </div>
            
            {/* App Description (moved to right or kept subtle) */}
            <div className="flex flex-col justify-center border-l border-slate-200 pl-6 h-10">
              <p className="text-xs text-slate-400 font-medium leading-none">
                App: Prueba concepto<br/>programación de cursos conjunta
              </p>
            </div>
          </div>

          <div className="header-right flex items-center gap-4">
            <div className="status-pill flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold border border-blue-100">
              Estado: Piloto Interno
            </div>
            
            <div className="warning-pill flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1 rounded-full text-xs border border-orange-100">
              <span className="font-bold">AVISO:</span> Datos en validación.
            </div>

            <button className="icon-btn text-gray-400 hover:text-gray-600 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Title Section */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Panel de Control</h1>
            <p className="text-slate-500">Visión global del estado de los cursos formativos.</p>
          </div>
          <button 
            onClick={handleExport}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Download size={18} />
            <span>Exportar Informe</span>
          </button>
        </div>

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
