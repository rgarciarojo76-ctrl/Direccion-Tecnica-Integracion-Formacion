import React from 'react';
import { Info, AlertCircle, Users } from 'lucide-react';

const DataTable = ({ data }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMADO': return 'status-confirmed';
      case 'CERRADO': return 'status-closed';
      case 'FINALIZADO': return 'status-finalized';
      default: return '';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Curso</th>
            <th>Temática</th>
            <th>Modalidad</th>
            <th>Fechas</th>
            <th>Ubicación</th>
            <th>Delegación</th>
            <th>Plazas</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr 
              key={row.id} 
              className={`transition-colors ${row.hasSynergy ? 'synergy-row' : ''}`}
            >
              {/* Curso */}
              <td>
                <div className="font-semibold text-secondary max-w-[200px] leading-tight">
                  {row.title}
                </div>
                <div className="text-xs text-gray-400 mt-1 font-mono">
                  {row.code}
                </div>
              </td>

              {/* Temática */}
              <td className="text-sm">
                {row.tematica}
              </td>

              {/* Modalidad with Tooltip */}
              <td>
                <div className="flex items-center gap-2 relative group">
                  <span className="text-sm font-medium">{row.modalidad}</span>
                  <Info size={16} className="text-blue-400 cursor-help" />
                  
                  {/* Tooltip Content */}
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-lg z-10 transition-opacity">
                    <div className="font-semibold mb-1 border-b border-slate-600 pb-1">Desglose Horas</div>
                    <div className="flex justify-between">
                      <span>Presencial:</span>
                      <span className="font-mono">{row.duracion_presencial}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Online:</span>
                      <span className="font-mono">0.0h</span>
                    </div>
                    <div className="mt-2 text-slate-400 text-[10px]">{row.code}</div>
                    {/* Arrow */}
                    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                  </div>
                </div>
              </td>

              {/* Fechas */}
              <td className="text-sm whitespace-nowrap">
                {row.fechas}
              </td>

              {/* Ubicación */}
              <td>
                <div className="text-sm font-medium">{row.ubicacion}</div>
              </td>

              {/* Delegación */}
              <td className="text-sm">
                {row.delegation}
              </td>

              {/* Plazas & Synergy */}
              <td>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-lg ${row.plazas < 10 ? 'text-red-500' : 'text-primary'}`}>
                    {row.plazas}
                  </span>
                  
                  {/* SYNERGY LOGIC */}
                  {row.hasSynergy && (
                    <div className="group relative">
                      <AlertCircle size={18} className="text-blue-500 animate-pulse cursor-pointer" />
                      <div className="absolute right-0 top-full mt-1 hidden group-hover:block w-40 bg-blue-600 text-white text-xs rounded p-2 shadow-lg z-20">
                         <div className="font-bold flex items-center gap-1">
                           <Users size={12} />
                           <span>Sinergia Detectada!</span>
                         </div>
                         <div className="mt-1">
                           Suma Total: <b>{row.totalPlazas}</b> alumnos.
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </td>

              {/* Estado */}
              <td>
                <span className={`status-badge ${getStatusColor(row.estado)}`}>
                  {row.estado}
                </span>
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td colSpan="8" className="p-8 text-center text-gray-400">
                No se encontraron cursos que coincidan con los filtros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
