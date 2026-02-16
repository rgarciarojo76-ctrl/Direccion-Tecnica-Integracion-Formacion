import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, XOctagon, Users } from 'lucide-react';

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

// All known scenario types - used for verification
const ALL_KNOWN_SCENARIOS = ['optimal', 'permuted', 'reference_potential', 'reference_unlikely', 'overflow'];

const KPIDashboard = ({ data }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const metrics = useMemo(() => {
    // Get ALL groups from the current data
    const allGroups = data.filter(item => item.type === 'group');
    const individualCourses = data.filter(item => item.type !== 'group');

    // DEBUG: Log all group scenarioTypes for verification
    const scenarioBreakdown = {};
    allGroups.forEach(g => {
      const st = g.scenarioType || 'UNDEFINED';
      if (!scenarioBreakdown[st]) scenarioBreakdown[st] = 0;
      scenarioBreakdown[st]++;
    });
    console.log(`[KPI Dashboard] Total items: ${data.length} | Groups: ${allGroups.length} | Individual: ${individualCourses.length}`);
    console.log('[KPI Dashboard] Scenario breakdown:', scenarioBreakdown);

    // Check for any unrecognized scenarios
    Object.keys(scenarioBreakdown).forEach(s => {
      if (!ALL_KNOWN_SCENARIOS.includes(s)) {
        console.warn(`[KPI Dashboard] ⚠️ UNRECOGNIZED scenarioType: "${s}" — ${scenarioBreakdown[s]} groups will NOT be counted!`);
      }
    });

    // Calculate metrics per category
    const computedMetrics = CATEGORIES.map(cat => {
      const matchingGroups = allGroups.filter(g => cat.scenarios.includes(g.scenarioType));
      
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

    // Compute totals for cross-check
    const totalGroupsCounted = computedMetrics.reduce((s, m) => s + m.groupCount, 0);
    
    // Cross-check: do counted groups = actual groups?
    if (totalGroupsCounted !== allGroups.length) {
      console.error(`[KPI Dashboard] ❌ MISMATCH! Counted ${totalGroupsCounted} groups across cards but found ${allGroups.length} groups in data.`);
    } else {
      console.log(`[KPI Dashboard] ✅ All ${allGroups.length} groups accounted for.`);
    }

    return computedMetrics;
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
            <div className="kpi-card-compact">
              <div className="kpi-card-icon" style={{ backgroundColor: m.iconBg, color: m.color }}>
                <Icon size={16} />
              </div>
              <div className="kpi-card-body">
                <span className="kpi-card-label" style={{ color: m.color }}>
                  {m.label}
                </span>
                <div className="kpi-card-numbers">
                  <span className="kpi-metric-value" style={{ color: m.color }}>
                    {m.groupCount}
                  </span>
                  <span className="kpi-metric-unit">grupos</span>
                  <span className="kpi-metric-sep">·</span>
                  <Users size={12} className="kpi-metric-icon" />
                  <span className="kpi-metric-alumnos">{m.totalAlumnos}</span>
                  <span className="kpi-metric-unit-sm">alumnos</span>
                </div>
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
