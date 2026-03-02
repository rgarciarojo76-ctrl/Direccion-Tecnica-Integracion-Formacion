import React from 'react';
import { Users, Search, AlertTriangle, MapPin, CheckCircle2, RotateCcw } from 'lucide-react';

const CoursesTable = ({ data, unifications = {}, onUnify, onUndoUnify }) => {
  return (
    <div className="w-full">
      <table className="w-full text-left border-separate border-spacing-y-4">
        <thead>
          <tr className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            <th className="px-4 py-3 text-center w-20">Organizador</th>
            <th className="px-4 py-3">Curso</th>
            <th className="px-4 py-3 text-center">Modalidad</th>
            <th className="px-4 py-3 text-center">Duración</th>
            <th className="px-4 py-3 text-center">Inicio</th>
            <th className="px-4 py-3 text-center">Fin</th>
            <th className="px-4 py-3">Ubicación</th>
            <th className="px-2 py-3 text-center w-20">Máximo</th>
            <th className="px-2 py-3 text-center w-20">Inscritos</th>
            <th className="px-2 py-3 text-center w-24">Disponibles</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.map((item) => {
            if (item.type === 'group') {
              return (
                <SynergyGroup 
                  key={item.id} 
                  item={item} 
                  unifiedAs={unifications[item.id]} 
                  onUnify={onUnify} 
                  onUndoUnify={onUndoUnify} 
                />
              );
            }
            return <Row key={item.id} row={item} />;
          })}

          {data.length === 0 && (
            <tr>
              <td colSpan="10" className="p-16 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                    <Search className="text-slate-300" size={32} />
                </div>
                <h3 className="text-slate-600 font-semibold text-lg">No se encontraron cursos activos</h3>
                <p className="text-slate-400 text-sm mt-2">Prueba a ajustar los filtros de búsqueda para ver más resultados.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default CoursesTable;
