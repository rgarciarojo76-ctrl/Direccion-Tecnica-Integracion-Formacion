import React, { useState, useEffect, useMemo } from 'react';
import { Download, Layout, Settings } from 'lucide-react';

import FilterBar from './components/FilterBar';
import DataTable from './components/DataTable';
import { loadData } from './utils/dataProcessor';
import { exportToExcel, exportToPDF } from './utils/exportUtils';
import './App.css';

function App() {
  const [data, setData] = useState([]);

  const [filters, setFilters] = useState({
    course: '',
    topic: '',
    modality: '',
    startDate: '',
    endDate: '',
    location: '',
    delegation: ''
  });

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      const processed = await loadData();
      setData(processed);

    };
    fetchData();
  }, []);

  // Filter Logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Course Name Search
      if (filters.course && !item.title.toLowerCase().includes(filters.course.toLowerCase())) return false;
      
      // Topic
      if (filters.topic && item.tematica !== filters.topic) return false;
      
      // Modality
      if (filters.modality && item.modalidad !== filters.modality) return false;
      
      // Location
      if (filters.location && !item.ubicacion.toLowerCase().includes(filters.location.toLowerCase())) return false;
      
      // Delegation
      if (filters.delegation && !item.delegacion.toLowerCase().includes(filters.delegation.toLowerCase())) return false;

      // Date Range logic placeholder
      if (filters.startDate || filters.endDate) {
         // Logic to be implemented if needed
      }

      return true;
    });
  }, [data, filters]);

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
            {/* Logo Placeholder */}
            {/* If a real logo is available, use <img src={logo} /> */}
            <div className="flex items-center gap-3">
               <div className="logo-icon text-blue-500">
                  <Layout size={28} color="var(--primary-color)" />
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
           <FilterBar filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* DATA TABLE */}
        <div className="card bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <DataTable data={filteredData} />
        </div>

      </main>
    </div>
  );
}

export default App;
