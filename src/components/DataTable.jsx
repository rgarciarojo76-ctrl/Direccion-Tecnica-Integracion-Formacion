import React from 'react';
import { Info, AlertCircle, Users } from 'lucide-react';

const DataTable = ({ data }) => {


  const getLogo = (source) => {
    if (source === 'ASPY') return '/logos/aspy_logo.png';
    if (source === 'MAS') return '/logos/mas_logo.png';
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-24">Empresa</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Curso</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Temática</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Modalidad</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fechas</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ubicación</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Delegación</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plazas</th>
            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr 
              key={row.id} 
              className={`hover:bg-slate-50 transition-colors ${row.hasSynergy ? 'synergy-row' : ''}`}
            >
              {/* Logo Column */}
              <td className="p-4 text-center">
                 <img 
                    src={getLogo(row.source)} 
                    alt={row.source} 
                    className="h-8 max-w-[80px] object-contain mx-auto opacity-90 hover:opacity-100 transition-opacity" 
                 />
              </td>

              {/* Curso */}
              <td className="p-4">
                <div className="font-semibold text-slate-700 max-w-[280px] leading-snug">
                  {row.title}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-wide">
                  {row.code}
                </div>
              </td>

              {/* Temática */}
              <td className="p-4 text-sm text-slate-600">
                <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium text-xs">
                    {row.tematica}
                </span>
              </td>

              {/* Modalidad with Tooltip */}
              <td className="p-4">
                <div className="flex items-center gap-2 relative group">
                  <span className="text-sm font-medium text-slate-600">{row.modalidad}</span>
                  <Info size={14} className="text-slate-400 hover:text-blue-500 cursor-help transition-colors" />
                  
                  {/* Tooltip Content */}
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl z-10 transition-all opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0">
                    <div className="font-semibold mb-2 border-b border-slate-600 pb-1 text-slate-300">Desglose Horas</div>
                    <div className="flex justify-between mb-1">
                      <span>Presencial:</span>
                      <span className="font-mono text-blue-300">{row.duracion_presencial}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Online:</span>
                      <span className="font-mono text-emerald-300">0.0h</span>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                  </div>
                </div>
              </td>

              {/* Fechas */}
              <td className="p-4 text-sm whitespace-nowrap text-slate-600 font-medium">
                {row.fechas}
              </td>

              {/* Ubicación */}
              <td className="p-4">
                <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="text-sm">{row.ubicacion}</span>
                </div>
              </td>

              {/* Delegación */}
              <td className="p-4 text-sm text-slate-500">
                 {row.delegation}
              </td>

              {/* Plazas & Synergy */}
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-lg ${row.plazas < 5 ? 'text-red-500' : 'text-slate-700'}`}>
                    {row.plazas}
                  </span>
                  
                  {/* SYNERGY LOGIC */}
                  {row.hasSynergy && (
                    <div className="group relative">
                      <div className="bg-blue-100 text-blue-600 p-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                          <Users size={14} />
                      </div>
                      <div className="absolute right-0 top-full mt-1 hidden group-hover:block w-48 bg-white border border-blue-100 text-slate-600 text-xs rounded-xl p-3 shadow-xl z-20">
                         <div className="font-bold flex items-center gap-1 text-blue-600 mb-1">
                           <Users size={12} />
                           <span>Sinergia Detectada</span>
                         </div>
                         <div className="mt-1 leading-relaxed">
                           Se han unificado plazas con otro curso similar en la misma ubicación.
                           <br/>
                           Total real: <b className="text-slate-800">{row.totalPlazas}</b>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </td>

              {/* Estado */}
              <td className="p-4">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    row.estado === 'CONFIRMADO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    row.estado === 'CERRADO' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {row.estado}
                </span>
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td colSpan="9" className="p-12 text-center text-slate-400">
                <div className="flex flex-col items-center gap-2">
                    <AlertCircle size={32} className="text-slate-200" />
                    <p>No se encontraron cursos que coincidan con los filtros.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
