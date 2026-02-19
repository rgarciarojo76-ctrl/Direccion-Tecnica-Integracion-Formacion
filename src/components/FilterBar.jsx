import React from 'react';
import { Search, MapPin, Calendar, Sparkles, Building2 } from 'lucide-react';

const FilterBar = ({ filters, onFilterChange, uniqueTitles = [], uniqueLocations = [] }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="filter-bar-container">
      
      {/* Row 1: Quick Filters */}
      <div className="filter-row filter-row-primary">
        
        {/* Company Tabs */}
        <div className="filter-group">
          <label className="filter-label">
            <Building2 size={14} />
            Empresa
          </label>
          <div className="tabs-container-pro">
            {['ALL', 'ASPY', 'MAS'].map((val) => (
               <button
                 key={val}
                 className={`tab-btn-pro ${filters.company === val ? 'active' : ''} ${val === 'ASPY' ? 'aspy' : val === 'MAS' ? 'mas' : ''}`}
                 onClick={() => onFilterChange('company', val)}
               >
                 {val === 'ALL' ? 'Todos' : val}
               </button>
            ))}
          </div>
        </div>

        {/* Synergies Toggle */}
        <div className="filter-group">
          <label className="filter-label">
            <Sparkles size={14} />
            Vista
          </label>
          <label className={`toggle-wrapper-pro ${filters.showSynergiesOnly ? 'active' : ''}`}>
            <input 
              type="checkbox" 
              checked={filters.showSynergiesOnly}
              onChange={(e) => onFilterChange('showSynergiesOnly', e.target.checked)}
              className="toggle-input-pro"
            />
            <span className="toggle-slider-pro"></span>
            <span className="toggle-text-pro">Solo sinergias</span>
          </label>
        </div>

      </div>

      {/* Row 2: Search Filters */}
      <div className="filter-row filter-row-secondary">
        
        {/* Course Search */}
        <div className="filter-group filter-group-grow">
          <label className="filter-label">
            <Search size={14} />
            Buscar curso
          </label>
          <div className="input-wrapper-pro">
            <input
              type="text"
              name="course"
              list="course-options"
              placeholder="Nombre del curso..."
              value={filters.course}
              onChange={handleChange}
              className="input-pro"
              autoComplete="off"
            />
            <datalist id="course-options">
              {uniqueTitles.map((title, idx) => (
                <option key={idx} value={title} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Date Range */}
        <div className="filter-group">
          <label className="filter-label">
            <Calendar size={14} />
            Rango de fechas
          </label>
          <div className="date-range-pro">
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="input-pro input-date"
            />
            <span className="date-separator">→</span>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="input-pro input-date"
            />
          </div>
        </div>

        {/* Location */}
        <div className="filter-group">
          <label className="filter-label">
            <MapPin size={14} />
            Ubicación
          </label>
          <div className="input-wrapper-pro">
            <input
              type="text"
              name="location"
              list="location-options"
              placeholder="Ciudad / Provincia"
              value={filters.location}
              onChange={handleChange}
              className="input-pro"
              autoComplete="off"
            />
            <datalist id="location-options">
              {uniqueLocations.map((loc, idx) => (
                <option key={idx} value={loc} />
              ))}
            </datalist>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FilterBar;
