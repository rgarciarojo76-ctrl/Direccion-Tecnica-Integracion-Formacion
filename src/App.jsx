import React, { useState, useEffect, useMemo } from 'react';
import { Download, Layout, Settings } from 'lucide-react';

import FilterBar from './components/FilterBar';
import CoursesTable from './components/CoursesTable';
import { loadData } from './utils/dataProcessor';
import { exportToExcel, exportToPDF } from './utils/exportUtils';
import './App.css';

function App() {
  const [data, setData] = useState([]);

  // Filter State
  const [filters, setFilters] = useState({
    course: '',
    startDate: '',
    endDate: '',
    location: ''
  });

  // Unique Values for "Tabulated" filters
  const uniqueTitles = useMemo(() => {
    const titles = data.map(d => d.title);
    return [...new Set(titles)].sort();
  }, [data]);

  const uniqueLocations = useMemo(() => {
    const locs = data.map(d => d.ubicacion);
    return [...new Set(locs)].sort();
  }, [data]);

  // Filter Logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Course Name (Text Search or Exact Match from Datalist)
      if (filters.course && !item.title.toLowerCase().includes(filters.course.toLowerCase())) return false;
      
      // Location
      if (filters.location && !item.ubicacion.toLowerCase().includes(filters.location.toLowerCase())) return false;
      
      // Date Range
      if (filters.startDate) {
        const startFilter = new Date(filters.startDate);
        // Compare: item.startDateRaw must be >= startFilter
        if (item.startDateRaw && item.startDateRaw < startFilter) return false;
      }

      if (filters.endDate) {
        const endFilter = new Date(filters.endDate);
        // Compare: item.startDateRaw must be <= endFilter (or use end date? usually start date within range)
        // Let's assume user wants courses STARTING within range.
        if (item.startDateRaw && item.startDateRaw > endFilter) return false;
      }

      return true;
    });
  }, [data, filters]);

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      const processed = await loadData();
      setData(processed);
    };
    fetchData();
  }, []);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = () => {
    if (confirm("¿Desea exportar a Excel? (Cancelar para PDF)")) {
      exportToExcel(filteredData);
    } else {
      exportToPDF(filteredData);
    }
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="main-header">
        <div className="header-content max-w-7xl mx-auto px-6">
          <div className="header-left flex items-center gap-4">
            {/* IA LAB Logo */}
            <div className="logo-container">
               <img 
                 src="/logos/ia_lab_logo.png" 
                 alt="Dirección Técnica IA LAB - Gestión de Formación" 
                 className="object-contain"
                 style={{ height: '40px', width: 'auto' }}
               />
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
          <CoursesTable data={filteredData} />
        </div>

      </main>
    </div>
  );
}

export default App;
