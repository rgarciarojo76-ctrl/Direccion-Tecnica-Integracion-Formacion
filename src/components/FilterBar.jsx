import React from 'react';
import { Search, MapPin, Calendar } from 'lucide-react';

const InputWrapper = ({ icon: Icon, children }) => (
  <div className="relative group flex-1 min-w-[200px]">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon size={16} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
    </div>
    {children}
  </div>
);

const inputClass = "w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-white";

const FilterBar = ({ filters, onFilterChange, uniqueTitles = [], uniqueLocations = [] }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 w-full">
      
      {/* Company Tabs */}
      <div className="tabs-container">
          {['ALL', 'ASPY', 'MAS'].map((val) => (
             <button
               key={val}
               className={`tab-btn ${filters.company === val ? 'active' : ''}`}
               onClick={() => onFilterChange('company', val)}
             >
               {val === 'ALL' ? 'TODOS' : val}
             </button>
          ))}
      </div>

      {/* Synergies Toggle */}
      <label className={`toggle-wrapper ${filters.showSynergiesOnly ? 'active' : ''}`}>
        <input 
          type="checkbox" 
          checked={filters.showSynergiesOnly}
          onChange={(e) => onFilterChange('showSynergiesOnly', e.target.checked)}
          className="toggle-input"
        />
        <span className="toggle-label">Solo sinergias</span>
      </label>

      {/* Search Course (Tabulated/Normalized) */}
      <InputWrapper icon={Search}>
        <input
          type="text"
          name="course"
          list="course-options"
          placeholder="Seleccionar curso..."
          value={filters.course}
          onChange={handleChange}
          className={inputClass}
          autoComplete="off"
        />
        <datalist id="course-options">
            {uniqueTitles.map((title, idx) => (
                <option key={idx} value={title} />
            ))}
        </datalist>
      </InputWrapper>

      {/* Date Range (Calendar) */}
       <div className="flex items-center gap-2 flex-none">
          <InputWrapper icon={Calendar}>
             <input
                type="date"
                name="startDate"
                placeholder="Fecha Inicio"
                value={filters.startDate}
                onChange={handleChange}
                className={`${inputClass} pl-10`} 
            />
          </InputWrapper>
          <span className="text-slate-300">-</span>
          <InputWrapper icon={Calendar}>
             <input
                type="date"
                name="endDate"
                placeholder="Fecha Fin"
                value={filters.endDate}
                onChange={handleChange}
                 className={`${inputClass} pl-10`}
            />
          </InputWrapper>
       </div>

      {/* Location Filter (Tabulated/Normalized) */}
      <InputWrapper icon={MapPin}>
        <input
          type="text"
          name="location"
          list="location-options"
          placeholder="Ciudad / Provincia"
          value={filters.location}
          onChange={handleChange}
          className={inputClass}
          autoComplete="off"
        />
         <datalist id="location-options">
            {uniqueLocations.map((loc, idx) => (
                <option key={idx} value={loc} />
            ))}
        </datalist>
      </InputWrapper>

    </div>
  );
};

export default FilterBar;
