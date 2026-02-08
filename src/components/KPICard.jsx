import React from "react";
import { CheckCircle2, Lock, Flag } from "lucide-react";

const KPICard = ({ title, count, type }) => {
  let Icon = CheckCircle2;
  let statusClass = "";

  switch (type) {
    case "confirmed":
      Icon = CheckCircle2;
      statusClass = "status-confirmed";
      break;
    case "closed":
      Icon = Lock;
      statusClass = "status-closed";
      break;
    case "finalized":
      Icon = Flag;
      statusClass = "status-finalized";
      break;
    default:
      Icon = CheckCircle2;
  }

  return (
    <div className={`kpi-card scheme-${type}`}>
      <div className="flex justify-between items-start w-full mb-2">
        <h3 className="kpi-label uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-full ${statusClass} bg-opacity-20`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="kpi-value text-slate-800">{count}</span>
        <span className="text-sm text-slate-500 font-medium">cursos</span>
      </div>
    </div>
  );
};

export default KPICard;
