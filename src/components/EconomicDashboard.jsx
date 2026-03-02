import React from 'react';
import { TrendingUp, ArrowRightLeft } from 'lucide-react';

/**
 * Dashboard Económico de Unificaciones.
 * Muestra un resumen financiero de las decisiones de unificación en una sola línea compacta.
 * 
 * @param {{ masToAspy: Object, aspyToMas: Object, totalImporte: number, totalGrupos: number }} metrics
 */
const EconomicDashboard = ({ metrics }) => {
  const { masToAspy, aspyToMas, totalImporte, totalGrupos } = metrics;

  if (totalGrupos === 0) {
    return (
      <div className="economic-dashboard-compact economic-empty-compact">
        <ArrowRightLeft size={16} />
        <span>Pulse "Imparte MAS" o "Imparte ASPY" en las sinergias para calcular el impacto.</span>
      </div>
    );
  }

  return (
    <div className="economic-dashboard-compact">
      {/* Sección Izquierda: Título y Total */}
      <div className="ec-compact-main">
        <div className="ec-compact-icon">
          <TrendingUp size={16} />
        </div>
        <span className="ec-compact-title">Ahorro Generado por Sinergias</span>
        <div className="ec-compact-total">
          {totalImporte.toLocaleString('es-ES')} €
        </div>
      </div>

      <div className="ec-compact-divider"></div>

      {/* Sección Centro: MAS -> ASPY */}
      <div className="ec-compact-column">
        <div className="ec-compact-col-title text-aspy">
          <span className="ec-arrow">→</span> CURSOS DE MAS IMPARTIDOS POR ASPY
        </div>
        <div className="ec-compact-stats">
          <div className="ec-stat">
            <span className="ec-stat-val">{masToAspy.grupos}</span>
            <span className="ec-stat-lbl">GRUPOS</span>
          </div>
          <div className="ec-stat">
            <span className="ec-stat-val">{masToAspy.alumnos}</span>
            <span className="ec-stat-lbl">ALUMNOS</span>
          </div>
          <div className="ec-stat">
            <span className="ec-stat-val text-aspy">{masToAspy.importe.toLocaleString('es-ES')} €</span>
            <span className="ec-stat-lbl">IMPORTE</span>
          </div>
        </div>
      </div>

      <div className="ec-compact-divider"></div>

      {/* Sección Derecha: ASPY -> MAS */}
      <div className="ec-compact-column">
        <div className="ec-compact-col-title text-mas">
          <span className="ec-arrow">→</span> CURSOS DE ASPY IMPARTIDOS POR MAS
        </div>
        <div className="ec-compact-stats">
          <div className="ec-stat">
            <span className="ec-stat-val">{aspyToMas.grupos}</span>
            <span className="ec-stat-lbl">GRUPOS</span>
          </div>
          <div className="ec-stat">
            <span className="ec-stat-val">{aspyToMas.alumnos}</span>
            <span className="ec-stat-lbl">ALUMNOS</span>
          </div>
          <div className="ec-stat">
            <span className="ec-stat-val text-mas">{aspyToMas.importe.toLocaleString('es-ES')} €</span>
            <span className="ec-stat-lbl">IMPORTE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EconomicDashboard;
