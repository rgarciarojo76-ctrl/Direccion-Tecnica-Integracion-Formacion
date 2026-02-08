import React from 'react';
import { Search, MapPin, Calendar, Layers, Monitor, Briefcase } from 'lucide-react';

const InputWrapper = ({ icon: Icon, children }) => (
  <div className="relative group flex-1 min-w-[200px]">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon size={16} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
    </div>
    {children}
  </div>
);

const inputClass = "w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-white";

const FilterBar = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 w-full">
      {/* Search Course */}
      <InputWrapper icon={Search}>
        <input
          type="text"
          name="course"
          placeholder="Buscar curso..."
          value={filters.course}
          onChange={handleChange}
          className={inputClass}
        />
      </InputWrapper>

      {/* Topic Filter */}
      <InputWrapper icon={Layers}>
        <select
          name="topic"
          value={filters.topic}
          onChange={handleChange}
          className={`${inputClass} appearance-none cursor-pointer`}
        >
          <option value="">Todas las temáticas</option>
          <option value="Seguridad">Seguridad</option>
          <option value="PRL">PRL</option>
          <option value="Recursos Humanos">Recursos Humanos</option>
          <option value="Ingeniería">Ingeniería</option>
        </select>
      </InputWrapper>
        
       {/* Modality Filter */}
       <InputWrapper icon={Monitor}>
        <select
          name="modality"
          value={filters.modality}
          onChange={handleChange}
          className={`${inputClass} appearance-none cursor-pointer`}
        >
          <option value="">Todas las modalidades</option>
          <option value="Presencial">Presencial</option>
          <option value="Online">Online</option>
          <option value="Mixta">Mixta</option>
        </select>
      </InputWrapper>

      {/* Date Range - Combined visual or simplified? 
          Space is tight. Let's do two small inputs or one range if possible.
          For now, keeping two but compact.
      */}
       <div className="flex items-center gap-2 flex-none">
          <div className="relative group w-32">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={14} className="text-slate-400" />
            </div>
            <input
                type="text"
                name="startDate"
                placeholder="Desde"
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => e.target.type = 'text'}
                onChange={handleChange}
                className={`${inputClass} pl-9 py-2 text-xs`}
            />
          </div>
          <span className="text-slate-300">-</span>
          <div className="relative group w-32">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={14} className="text-slate-400" />
            </div>
             <input
                type="text"
                name="endDate"
                placeholder="Hasta"
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => e.target.type = 'text'}
                onChange={handleChange}
                 className={`${inputClass} pl-9 py-2 text-xs`}
            />
          </div>
       </div>

      {/* Location Filter */}
      <InputWrapper icon={MapPin}>
        <input
          type="text"
          name="location"
          placeholder="Ciudad / Provincia"
          value={filters.location}
          onChange={handleChange}
          className={inputClass}
        />
      </InputWrapper>

      {/* Delegation Filter */}
       <InputWrapper icon={Briefcase}>
        <input
          type="text"
          name="delegation"
          placeholder="Delegación"
          value={filters.delegation}
          onChange={handleChange}
          className={inputClass}
        />
      </InputWrapper>

    </div>
  );
};

export default FilterBar;
