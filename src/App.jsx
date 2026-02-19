import React, { useState, useEffect, useMemo } from 'react';
import { Download, Layout } from 'lucide-react';

import FilterBar from './components/FilterBar';
import CoursesTable from './components/CoursesTable';
import KPIDashboard from './components/KPIDashboard';
import NotificationToast from './components/NotificationToast';
import UploadModal from './components/UploadModal';
import { loadData, loadSynergyDictionary, parseUploadedFile, mergeData } from './utils/dataProcessor';
import { processCourseListWithGroups } from './utils/synergyEngine';
import { exportToExcel, exportToPDF } from './utils/exportUtils';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [dictionary, setDictionary] = useState([]); // Store dictionary for re-processing
  const [loading, setLoading] = useState(true);

  // Upload & Notification State - HIDDEN (2026-02-19)
  /*
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [uploadHistory, setUploadHistory] = useState(() => {
      try {
          const saved = localStorage.getItem('upload_history');
          return saved ? JSON.parse(saved) : [];
      } catch { return []; }
  });
  */

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
          return item.type === 'group' && item.courses.some(checkCourse);
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
      const [rawData, dict] = await Promise.all([
        loadData(),
        loadSynergyDictionary()
      ]);
      setDictionary(dict);
      const processed = processCourseListWithGroups(rawData, dict);
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

  // Upload Logic
  /* UPLOAD LOGIC HIDDEN (2026-02-19)
  const handleUpload = async (file, type) => {
      try {
          const newRows = await parseUploadedFile(file, type);
          
          // Flatten current data to get raw list for merging
          const currentRaw = data.flatMap(item => item.type === 'group' ? item.courses : item);
          
          // Merge
          const updatedRaw = mergeData(currentRaw, newRows, type);
          
          // Re-process
          const processed = processCourseListWithGroups(updatedRaw, dictionary);
          setData(processed);

          // Success Notification
          setNotification({ type: 'success', message: `Programación ${type} cargada y procesada correctamente.` });
          setIsUploadModalOpen(false);

          // Update History
          const newEntry = {
              type,
              fileName: file.name,
              timestamp: new Date().toISOString(),
              status: 'success'
          };
          const newHistory = [newEntry, ...uploadHistory];
          setUploadHistory(newHistory);
          localStorage.setItem('upload_history', JSON.stringify(newHistory));

      } catch (err) {
          console.error("Upload Error:", err);
          setNotification({ type: 'error', message: err.message || "Error al procesar el archivo." });
          
          // Log failure
          const newEntry = {
              type,
              fileName: file.name,
              timestamp: new Date().toISOString(),
              status: 'error'
          };
          const newHistory = [newEntry, ...uploadHistory];
          setUploadHistory(newHistory);
          localStorage.setItem('upload_history', JSON.stringify(newHistory));
      }
  };
  */

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* HEADER */}
      <header className="main-header sticky top-0 z-30">
         <div className="header-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           {/* LOGO area */}
           <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
               <img src="/logos/ia_lab_logo_horizontal.png" alt="IA Lab Logo" className="header-logo" />
               <div className="header-separator"></div>
               <div className="flex flex-col">
                 <span className="header-brand-title">DIRECCIÓN TÉCNICA IA LAB</span>
                 <span className="header-brand-subtitle">Aplicación: Prueba concepto programación de cursos conjuntos</span>
               </div>
             </div>
           </div>

           {/* Status Pills */}
           <div className="hidden md:flex items-center gap-3">
              <div className="status-pill">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">Sistema Operativo</span>
              </div>
              <div className="status-pill">
                 <span className="text-xs font-medium text-gray-500">v0.9.2 (Beta)</span>
              </div>
              <div className="warning-pill ml-2">
                 <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                   ⚠️ ENTORNO DE PRUEBAS
                 </span>
              </div>
           </div>
         </div>
      </header>

      {/* HERO SECTION */}
      <div className="hero-section">
        <div className="hero-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
               <h1 className="hero-title">
                 Programación de Formación 2026
               </h1>
               <p className="hero-subtitle">
                 Visualización y detección de sinergias entre compañías
               </p>
             </div>
             
             <button onClick={handleExport} className="btn-export">
               <Download size={18} />
               Exportar Informe
             </button>
           </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filter Bar */}
        <FilterBar 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          uniqueTitles={uniqueTitles}
          uniqueLocations={uniqueLocations}
          // onOpenUpload={() => setIsUploadModalOpen(true)} // HIDDEN (2026-02-19)
        />

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="animate-fade-in">
             <div className="mb-4 text-sm text-gray-500 font-medium">
               Mostrando {filteredData.length} resultados 
               {filters.showSynergiesOnly && " (Filtrado por sinergías)"}
             </div>
             
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <CoursesTable data={filteredData} />
             </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          © 2026 IA Lab - Dirección Técnica. Todos los derechos reservados.
        </div>
      </footer>

      {/* Modals & Toasts - UPLOAD FEATURE HIDDEN (2026-02-19)
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUpload={handleUpload}
        history={uploadHistory}
      />
      */}
      {/* HIDDEN (2026-02-19)
      <NotificationToast 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />
      */}

    </div>
  );
}

export default App;
