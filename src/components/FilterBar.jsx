import React from 'react';
import { Search } from 'lucide-react';

const FilterBar = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Course Filter */}
      <div className="col-span-1">
        <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Curso</label>
        <div className="relative">
          <input
            type="text"
            name="course"
            placeholder="Filtrar..."
            value={filters.course}
            onChange={handleChange}
            className="pl-8"
          />
          <Search className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      {/* Topic Filter */}
      <div className="col-span-1">
        <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Temática</label>
        <select
          name="topic"
          value={filters.topic}
          onChange={handleChange}
        >
          <option value="">Todas</option>
          <option value="Seguridad">Seguridad</option>
          <option value="PRL">PRL</option>
          <option value="Recursos Humanos">Recursos Humanos</option>
          <option value="Ingeniería">Ingeniería</option>
        </select>
      </div>

      {/* Modality Filter */}
      <div className="col-span-1">
        <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Modalidad</label>
        <select
          name="modality"
          value={filters.modality}
          onChange={handleChange}
        >
          <option value="">Todas</option>
          <option value="Presencial">Presencial</option>
          <option value="Online">Online</option>
          <option value="Mixta">Mixta</option>
        </select>
      </div>

      {/* Date Range Filter */}
      <div className="col-span-1">
          <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Fechas</label>
          <div className="flex flex-col gap-2">
              <input
                  type="text"
                  name="startDate"
                  placeholder="Desde..."
                  onFocus={(e) => e.target.type = 'date'}
                  onBlur={(e) => e.target.type = 'text'}
                  onChange={handleChange}
                  className="py-1.5 text-xs"
              />
               <input
                  type="text"
                  name="endDate"
                  placeholder="Hasta..."
                  onFocus={(e) => e.target.type = 'date'}
                  onBlur={(e) => e.target.type = 'text'}
                  onChange={handleChange}
                  className="py-1.5 text-xs"
              />
          </div>
      </div>

      {/* Location Filter */}
      <div className="col-span-1">
        <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Ubicación</label>
        <input
          type="text"
          name="location"
          placeholder="Ciudad..."
          value={filters.location}
          onChange={handleChange}
        />
      </div>

      {/* Delegation Filter */}
      <div className="col-span-1">
        <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Delegación</label>
        <input
          type="text"
          name="delegation"
          placeholder="Delegación"
          value={filters.delegation}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default FilterBar;
