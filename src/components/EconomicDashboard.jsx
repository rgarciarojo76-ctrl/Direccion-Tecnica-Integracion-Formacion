import React from 'react';
import { TrendingUp, ArrowRightLeft } from 'lucide-react';

/**
 * Dashboard Económico de Unificaciones.
 * Muestra un resumen financiero de las decisiones de unificación.
 * 
 * @param {{ masToAspy: Object, aspyToMas: Object, totalImporte: number, totalGrupos: number }} metrics
 */
const EconomicDashboard = ({ metrics }) => {
  const { masToAspy, aspyToMas, totalImporte, totalGrupos } = metrics;

  if (totalGrupos === 0) {
    return (
      <div className="economic-dashboard economic-dashboard-empty">
        <div className="economic-empty-content">
          <ArrowRightLeft size={20} />
          <span>Pulse "Imparte MAS" o "Imparte ASPY" en las tarjetas de sinergia para calcular el impacto económico.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="economic-dashboard">
      {/* Header */}
      <div className="economic-header">
        <div className="economic-header-icon">
          <TrendingUp size={18} />
        </div>
        <h3 className="economic-header-title">Resumen Económico de Unificaciones</h3>
        <div className="economic-total-badge">
          {totalImporte.toLocaleString('es-ES')} €
        </div>
      </div>

      {/* Columns */}
      <div className="economic-columns">
        {/* MAS → ASPY */}
        <div className="economic-column economic-column-aspy">
          <h4 className="economic-column-title">
            <span className="economic-arrow">→</span>
            Cursos de MAS impartidos por ASPY
          </h4>
          <div className="economic-metrics-row">
            <div className="economic-metric">
              <span className="economic-metric-value">{masToAspy.grupos}</span>
              <span className="economic-metric-label">Grupos</span>
            </div>
            <div className="economic-metric">
              <span className="economic-metric-value">{masToAspy.alumnos}</span>
              <span className="economic-metric-label">Alumnos</span>
            </div>
            <div className="economic-metric economic-metric-highlight">
              <span className="economic-metric-value">{masToAspy.importe.toLocaleString('es-ES')} €</span>
              <span className="economic-metric-label">Importe</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="economic-divider"></div>

        {/* ASPY → MAS */}
        <div className="economic-column economic-column-mas">
          <h4 className="economic-column-title">
            <span className="economic-arrow">→</span>
            Cursos de ASPY impartidos por MAS
          </h4>
          <div className="economic-metrics-row">
            <div className="economic-metric">
              <span className="economic-metric-value">{aspyToMas.grupos}</span>
              <span className="economic-metric-label">Grupos</span>
            </div>
            <div className="economic-metric">
              <span className="economic-metric-value">{aspyToMas.alumnos}</span>
              <span className="economic-metric-label">Alumnos</span>
            </div>
            <div className="economic-metric economic-metric-highlight">
              <span className="economic-metric-value">{aspyToMas.importe.toLocaleString('es-ES')} €</span>
              <span className="economic-metric-label">Importe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EconomicDashboard;
