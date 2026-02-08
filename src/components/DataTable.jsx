import React from 'react';
import { Users } from 'lucide-react';

const DataTable = ({ data }) => {


  const getLogo = (source) => {
    if (source === 'ASPY') return '/logos/aspy_logo.png';
    if (source === 'MAS') return '/logos/mas_logo.png';
    return null;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left border-collapse bg-white">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <th className="p-3 text-center w-16">Org.</th>
            <th className="p-3">Curso</th>
            <th className="p-3">Modalidad</th>
            <th className="p-3 text-center">Duración</th>
            <th className="p-3 text-center">Inicio</th>
            <th className="p-3 text-center">Fin</th>
            <th className="p-3">Ubicación</th>
            <th className="p-3 text-center">Max.</th>
            <th className="p-3 text-center">Disp.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-[11px] text-slate-600">
          {data.map((row) => (
            <tr 
              key={row.id} 
              className={`hover:bg-blue-50/30 transition-colors ${row.hasSynergy ? 'bg-blue-50/10' : ''}`}
            >
              {/* Organizadora */}
              <td className="p-2 text-center">
                 <img 
                    src={getLogo(row.source)} 
                    alt={row.source} 
                    className="h-5 max-w-[50px] object-contain mx-auto opacity-80 hover:opacity-100 transition-opacity" 
                 />
              </td>

              {/* Curso */}
              <td className="p-2">
                <div className="font-bold text-slate-700 leading-tight max-w-[320px] truncate" title={row.title}>
                  {row.title}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  {row.code}
                </div>
              </td>

              {/* Modalidad */}
              <td className="p-2 font-medium">
                {row.modalidad}
              </td>

              {/* Duración */}
              <td className="p-2 text-center font-mono text-slate-500">
                 {row.duracion_presencial}h
              </td>

              {/* Fecha Inicio */}
              <td className="p-2 text-center whitespace-nowrap font-medium text-slate-700">
                {row.startDatefmt}
              </td>

              {/* Fecha Fin */}
              <td className="p-2 text-center whitespace-nowrap font-medium text-slate-700">
                 {row.endDatefmt}
              </td>

              {/* Ubicación */}
              <td className="p-2 truncate max-w-[120px]" title={row.ubicacion}>
                {row.ubicacion}
              </td>

              {/* Max Alumnos */}
              <td className="p-2 text-center font-mono text-slate-400">
                 {row.totalPlazas}
              </td>

              {/* Disponibles */}
              <td className="p-2 text-center">
                  <div className={`font-bold inline-flex items-center justify-center min-w-[24px] rounded px-1 ${
                      row.plazas < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                  }`}>
                     {row.plazas}
                  </div>
                   {/* Synergy Indicator (Compact) */}
                   {row.hasSynergy && (
                     <div className="inline-block ml-1" title={`Sinergia: Total plazas reales ${row.totalPlazas}`}>
                        <Users size={10} className="text-blue-500" />
                     </div>
                   )}
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td colSpan="9" className="p-8 text-center text-slate-400 text-xs">
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
