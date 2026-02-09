import React from 'react';
import { Users } from 'lucide-react';

const CoursesTable = ({ data }) => {


  const getLogo = (source) => {
    if (source === 'ASPY') return '/logos/aspy_logo.png';
    if (source === 'MAS') return '/logos/mas_logo.png';
    return null;
  };

  const Row = ({ row }) => {
     const borderColor = row.source === 'ASPY' ? '#009ee3' : '#7c3aed';
     const bgHover = row.source === 'ASPY' ? 'hover:bg-sky-50' : 'hover:bg-violet-50';

     return (
        <tr 
          className={`bg-white shadow-sm hover:shadow-md transition-all duration-300 group relative rounded-xl ${bgHover}`}
          style={{
            border: `1.5px solid ${borderColor}`,
            borderRadius: '12px' 
          }}
        >
          {/* Organizadora */}
          <td className="p-4 text-center align-middle first:rounded-l-xl last:rounded-r-xl border-none">
             <div className="h-8 w-20 flex items-center justify-center mx-auto bg-slate-50 rounded-lg p-1.5 border border-slate-100">
               <img 
                  src={getLogo(row.source)} 
                  alt={row.source} 
                  className={`w-full object-contain mix-blend-multiply ${
                    row.source === 'MAS' ? 'max-h-1' : 'h-full'
                  }`}
               />
             </div>
          </td>

          {/* Curso */}
          <td className="p-4 align-middle border-none max-w-sm">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-slate-800 text-[14px] leading-tight group-hover:text-current transition-colors">
                {row.title}
              </span>
              <span className="text-[11px] text-slate-500 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded w-fit">
                {row.code}
              </span>
            </div>
          </td>

          {/* Modalidad */}
          <td className="p-4 align-middle text-center border-none">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
               row.modalidad === 'Presencial' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
            }`}>
              {row.modalidad}
            </span>
          </td>

          {/* Duración */}
          <td className="p-4 text-center align-middle border-none">
             <div className="text-sm font-bold text-slate-600">
                {row.duracion_presencial}h
             </div>
          </td>

          {/* Inicio */}
          <td className="p-4 text-center align-middle border-none">
            <span className="text-xs font-bold text-slate-700">{row.startDatefmt}</span>
          </td>

          {/* Fin */}
          <td className="p-4 text-center align-middle border-none">
            <span className="text-xs font-bold text-slate-700">{row.endDatefmt}</span>
          </td>

          {/* Ubicación */}
          <td className="p-4 align-middle border-none">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
               <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
               {row.ubicacion}
            </div>
          </td>

          {/* Máximo */}
          <td className="p-4 text-center align-middle border-none text-sm font-mono text-slate-500">
            {row.totalPlazas}
          </td>

          {/* Inscritos */}
          <td className="p-4 text-center align-middle border-none text-sm font-mono text-slate-800 font-bold">
            {row.inscritos}
          </td>

          {/* Disponibles */}
          <td className="p-4 text-center align-middle border-none relative first:rounded-l-xl last:rounded-r-xl">
              <div className={`px-3 py-1.5 rounded-lg text-sm font-bold border inline-flex items-center justify-center min-w-[50px] ${
                  row.plazas > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                  {row.plazas}
              </div>
          </td>
        </tr>
     );
  };

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
                    <React.Fragment key={item.id}>
                        <tr className="bg-emerald-50/50">
                            <td colSpan="10" className="p-0 border-none">
                                <div className="relative border-l-4 border-emerald-500 bg-white shadow-sm rounded-r-xl my-2 mr-1">
                                    <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-br">
                                        AGRUPACIÓN RECOMENDADA
                                    </div>
                                    <div className="p-4 pt-6 pl-6 pr-2">
                                        <table className="w-full border-separate border-spacing-y-2">
                                            <tbody>
                                                {item.courses.map(course => <Row key={course.id} row={course} />)}
                                            </tbody>
                                        </table>
                                        <div className="mt-2 text-xs text-emerald-700 italic px-2">
                                            💡 {item.courses[1]?.inscritos || 1} alumno(s) de MAS podrían unirse al curso de ASPY.
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </React.Fragment>
                );
            }
            return <Row key={item.id} row={item} />;
          })}

          {data.length === 0 && (
            <tr>
              <td colSpan="10" className="p-16 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                    <img src="/logos/aspy_logo.png" className="h-8 opacity-20 filter grayscale" />
                </div>
                <h3 className="text-slate-600 font-semibold text-lg">No se encontraron cursos activos</h3>
                <p className="text-slate-400 text-sm mt-2">Prueba a ajustar los filtos de búsqueda para ver más resultados.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CoursesTable;
