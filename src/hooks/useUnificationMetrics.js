import { useMemo } from 'react';

/**
 * PRECIO_HORA_ALUMNO: 13€ por hora y alumno.
 * Se usa para calcular el importe económico de la unificación.
 */
const PRECIO_HORA_ALUMNO = 13;

/**
 * Hook que calcula las métricas económicas de las unificaciones.
 *
 * @param {Array} synergyGroups - Los grupos de sinergia (type === 'group').
 * @param {Object} unifications - Mapa { [groupId]: 'MAS' | 'ASPY' }.
 * @returns {{ masToAspy: Object, aspyToMas: Object, totalImporte: number }}
 */
export const useUnificationMetrics = (synergyGroups, unifications) => {
  return useMemo(() => {
    const init = { grupos: 0, alumnos: 0, horas: 0, importe: 0 };

    const masToAspy = { ...init }; // MAS students go to ASPY course
    const aspyToMas = { ...init }; // ASPY students go to MAS course

    synergyGroups.forEach(group => {
      const entidad = unifications[group.id];
      if (!entidad) return; // Not unified yet

      // The "entidad impartidora" is the company that TEACHES (hosts).
      // Students from the OTHER company move to this one.
      const anfitriona = group.anfitriona;
      const emisora = group.emisora;
      
      if (!anfitriona || !emisora) return;

      const alumnosMovidos = Number(emisora.inscritos) || 0;
      const horasCurso = Number(anfitriona.duracion_presencial) || 0;
      const importe = alumnosMovidos * horasCurso * PRECIO_HORA_ALUMNO;

      if (entidad === 'ASPY') {
        // ASPY teaches → MAS students move to ASPY
        masToAspy.grupos += 1;
        masToAspy.alumnos += alumnosMovidos;
        masToAspy.horas += horasCurso;
        masToAspy.importe += importe;
      } else {
        // MAS teaches → ASPY students move to MAS
        aspyToMas.grupos += 1;
        aspyToMas.alumnos += alumnosMovidos;
        aspyToMas.horas += horasCurso;
        aspyToMas.importe += importe;
      }
    });

    return {
      masToAspy,
      aspyToMas,
      totalImporte: masToAspy.importe + aspyToMas.importe,
      totalGrupos: masToAspy.grupos + aspyToMas.grupos,
    };
  }, [synergyGroups, unifications]);
};
