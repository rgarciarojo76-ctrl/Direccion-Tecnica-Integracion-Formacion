import React, { useState, useEffect, useMemo } from 'react';
import { Download, Layout, Settings } from 'lucide-react';

import FilterBar from './components/FilterBar';
import DataTable from './components/DataTable';
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
            <div className="flex items-center gap-3">
               <div className="logo-icon">
                  {/* IA LAB Brain Logo SVG */}
                  <svg width="42" height="42" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Brain left side - circuits */}
                    <path d="M35 45 L35 35 L45 35 M45 45 L55 45 M35 55 L45 55 L45 65 M35 75 L45 75" 
                          stroke="#009ee3" strokeWidth="3" strokeLinecap="round"/>
                    
                    {/* Brain right side - network */}
                    <circle cx="75" cy="40" r="3" fill="#009ee3"/>
                    <circle cx="85" cy="50" r="3" fill="#009ee3"/>
                    <circle cx="75" cy="60" r="3" fill="#009ee3"/>
                    <circle cx="85" cy="70" r="3" fill="#009ee3"/>
                    <line x1="75" y1="40" x2="85" y2="50" stroke="#009ee3" strokeWidth="2"/>
                    <line x1="85" y1="50" x2="75" y2="60" stroke="#009ee3" strokeWidth="2"/>
                    <line x1="75" y1="60" x2="85" y2="70" stroke="#009ee3" strokeWidth="2"/>
                    
                    {/* Brain outline */}
                    <path d="M 45 25 Q 60 20 75 25 Q 90 30 90 50 Q 90 70 75 85 Q 60 90 45 85 Q 30 80 30 50 Q 30 30 45 25 Z" 
                          stroke="#009ee3" strokeWidth="4" fill="none"/>
                    
                    {/* Orbital ring */}
                    <path d="M 20 60 Q 30 20 60 15 Q 90 20 100 60" 
                          stroke="#009ee3" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
                    <circle cx="20" cy="60" r="4" fill="#009ee3"/>
                    <circle cx="100" cy="60" r="4" fill="#009ee3"/>
                  </svg>
               </div>
               <div className="flex flex-col">
                  <span className="text-secondary font-bold text-lg leading-tight" style={{ color: 'var(--primary-color)' }}>DIRECCIÓN TÉCNICA IA LAB</span>
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Gestión de Formación</span>
               </div>
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
          <DataTable data={filteredData} />
        </div>

      </main>
    </div>
  );
}

export default App;
