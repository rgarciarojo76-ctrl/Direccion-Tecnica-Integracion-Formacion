import React from 'react';
import { Users } from 'lucide-react';

const DataTable = ({ data }) => {


  const getLogo = (source) => {
    if (source === 'ASPY') return '/logos/aspy_logo.png';
    if (source === 'MAS') return '/logos/mas_logo.png';
    return null;
  };

  return (
    <div className="w-full">
      <table className="w-full text-left border-separate border-spacing-y-3">
        <thead>
          <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="px-4 py-2 text-center w-16">Organizador</th>
            <th className="px-4 py-2">Curso</th>
            <th className="px-4 py-2">Modalidad</th>
            <th className="px-4 py-2 text-center">Duración</th>
            <th className="px-4 py-2 text-center">Fechas</th>
            <th className="px-4 py-2">Ubicación</th>
            <th className="px-4 py-2 text-center">Estado</th>
          </tr>
        </thead>
        <tbody className="text-sm text-slate-600">
          {data.map((row) => (
            <tr 
              key={row.id} 
              className="bg-white hover:bg-slate-50 shadow-sm hover:shadow-md transition-all duration-200 group relative rounded-lg border border-transparent hover:border-blue-100"
            >
              {/* Organizadora - Strict Logo Sizing */}
              <td className="p-3 text-center rounded-l-lg border-l border-y border-slate-100 group-hover:border-blue-200">
                 <div className="h-8 w-24 flex items-center justify-center mx-auto bg-slate-50 rounded-md p-1">
                   <img 
                      src={getLogo(row.source)} 
                      alt={row.source} 
                      className="h-full w-full object-contain mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity" 
                   />
                 </div>
              </td>

              {/* Curso - Title + Code */}
              <td className="p-3 border-y border-slate-100 group-hover:border-blue-200 max-w-sm">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700 text-[13px] leading-snug group-hover:text-blue-700 transition-colors">
                    {row.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 bg-slate-50 inline-block px-1.5 py-0.5 rounded border border-slate-100 w-fit">
                    {row.code}
                  </span>
                </div>
              </td>

              {/* Modalidad */}
              <td className="p-3 border-y border-slate-100 group-hover:border-blue-200">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  {row.modalidad}
                </span>
              </td>

              {/* Duración */}
              <td className="p-3 text-center border-y border-slate-100 group-hover:border-blue-200">
                 <div className="text-xs font-mono text-slate-500">
                    {row.duracion_presencial}h
                 </div>
              </td>

              {/* Fechas */}
              <td className="p-3 text-center border-y border-slate-100 group-hover:border-blue-200">
                <div className="flex flex-col items-center justify-center text-xs">
                  <span className="font-semibold text-slate-700">{row.startDatefmt}</span>
                  <span className="text-[10px] text-slate-400">a</span>
                  <span className="text-slate-500">{row.endDatefmt}</span>
                </div>
              </td>

              {/* Ubicación */}
              <td className="p-3 border-y border-slate-100 group-hover:border-blue-200">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                   {/* Could simulate a pin icon if desired, or keep it clean */}
                   {row.ubicacion}
                </div>
              </td>

              {/* Estado / Plazas - Unified Column */}
              <td className="p-3 text-center rounded-r-lg border-r border-y border-slate-100 group-hover:border-blue-200">
                  <div className="flex flex-col items-center gap-1">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                          row.plazas > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                          {row.plazas > 0 ? `${row.plazas} Disp.` : 'Agotado'}
                      </div>
                      
                      <div className="text-[9px] text-slate-400">
                          Max: {row.totalPlazas}
                      </div>

                       {/* Synergy - Floating Badge */}
                       {row.hasSynergy && (
                         <div className="absolute -top-1 -right-1">
                            <span className="flex h-4 w-4 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500 items-center justify-center">
                                  <Users size={8} className="text-white" />
                              </span>
                            </span>
                         </div>
                       )}
                  </div>
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td colSpan="7" className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <img src="/logos/aspy_logo.png" className="h-6 opacity-20 filter grayscale" />
                </div>
                <h3 className="text-slate-500 font-medium">No se encontraron cursos activos</h3>
                <p className="text-slate-400 text-sm mt-1">Prueba a ajustar los filtos de búsqueda.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
