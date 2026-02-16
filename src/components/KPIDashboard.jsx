import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, XOctagon, Users, TrendingUp } from 'lucide-react';

const CATEGORIES = [
  {
    key: 'recommended',
    label: 'RECOMENDADA',
    scenarios: ['optimal', 'permuted'],
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    borderColor: '#10b981',
    icon: CheckCircle2,
    iconBg: '#d1fae5',
    description: 'Capacidad de absorción confirmada',
  },
  {
    key: 'possible',
    label: 'POSIBLE',
    scenarios: ['reference_potential'],
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    borderColor: '#f59e0b',
    icon: Clock,
    iconBg: '#fef3c7',
    description: 'Solo una compañía tiene inscritos',
  },
  {
    key: 'unlikely',
    label: 'IMPROBABLE',
    scenarios: ['reference_unlikely'],
    color: '#ef4444',
    bgGradient: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    borderColor: '#ef4444',
    icon: AlertTriangle,
    iconBg: '#fee2e2',
    description: '0 inscritos en ambas compañías',
  },
  {
    key: 'not_recommended',
    label: 'NO RECOMENDADA',
    scenarios: ['overflow'],
    color: '#1e293b',
    bgGradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderColor: '#334155',
    icon: XOctagon,
    iconBg: '#e2e8f0',
    description: 'Excede el aforo máximo',
  },
];

const KPIDashboard = ({ data }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const metrics = useMemo(() => {
    const groups = data.filter(item => item.type === 'group');

    return CATEGORIES.map(cat => {
      const matchingGroups = groups.filter(g => cat.scenarios.includes(g.scenarioType));
      
      let totalAlumnos = 0;
      let aspyAlumnos = 0;
      let masAlumnos = 0;

      matchingGroups.forEach(group => {
        group.courses.forEach(c => {
          const ins = Number(c.inscritos) || 0;
          totalAlumnos += ins;
          if (c.source === 'ASPY') aspyAlumnos += ins;
          if (c.source === 'MAS') masAlumnos += ins;
        });
      });

      return {
        ...cat,
        groupCount: matchingGroups.length,
        totalAlumnos,
        aspyAlumnos,
        masAlumnos,
      };
    });
  }, [data]);


  return (
    <div className="kpi-dashboard-grid">
      {metrics.map(m => {
        const Icon = m.icon;
        const isHovered = hoveredCard === m.key;
        
        return (
          <div
            key={m.key}
            className="kpi-card-pro"
            style={{
              borderLeft: `4px solid ${m.borderColor}`,
              background: m.bgGradient,
            }}
            onMouseEnter={() => setHoveredCard(m.key)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Header */}
            <div className="kpi-card-header">
              <div className="kpi-card-icon" style={{ backgroundColor: m.iconBg, color: m.color }}>
                <Icon size={18} />
              </div>
              <span className="kpi-card-label" style={{ color: m.color }}>
                {m.label}
              </span>
            </div>

            {/* Metrics */}
            <div className="kpi-card-metrics">
              <div className="kpi-metric-main">
                <span className="kpi-metric-value" style={{ color: m.color }}>
                  {m.groupCount}
                </span>
                <span className="kpi-metric-unit">
                  {m.groupCount === 1 ? 'grupo' : 'grupos'}
                </span>
              </div>
              <div className="kpi-metric-secondary">
                <Users size={14} className="kpi-metric-icon" />
                <span className="kpi-metric-alumnos">{m.totalAlumnos}</span>
                <span className="kpi-metric-unit-sm">alumnos</span>
              </div>
            </div>

            {/* Hover tooltip */}
            {isHovered && m.groupCount > 0 && (
              <div className="kpi-tooltip">
                <div className="kpi-tooltip-row">
                  <span className="kpi-tooltip-label">ASPY:</span>
                  <span className="kpi-tooltip-value">{m.aspyAlumnos} alumnos</span>
                </div>
                <div className="kpi-tooltip-row">
                  <span className="kpi-tooltip-label">MAS:</span>
                  <span className="kpi-tooltip-value">{m.masAlumnos} alumnos</span>
                </div>
                <div className="kpi-tooltip-divider"></div>
                <div className="kpi-tooltip-desc">{m.description}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default KPIDashboard;
