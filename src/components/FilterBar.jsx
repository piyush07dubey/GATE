import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

const SearchSuggestions = ({ searchTerm, setSearchTerm, suggestions, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setFiltered([]);
      setIsOpen(false);
      return;
    }

    const term = searchTerm.toLowerCase();
    const matches = suggestions
      .filter(s => s.toLowerCase().includes(term))
      .slice(0, 8);
    setFiltered(matches);
    setIsOpen(matches.length > 0);
  }, [searchTerm, suggestions]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion) => {
    setSearchTerm(suggestion);
    setIsOpen(false);
    onSelect?.(suggestion);
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
      <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', zIndex: 1 }} />
      <input
        type="text"
        className="input search-input"
        placeholder="Search topics, keywords..."
        style={{ paddingLeft: '36px', paddingRight: searchTerm ? '36px' : '12px' }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => {
          if (filtered.length > 0) setIsOpen(true);
        }}
        autoComplete="off"
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-tertiary)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            zIndex: 1,
          }}
        >
          <FiX size={14} />
        </button>
      )}

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          zIndex: 50,
          maxHeight: '300px',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {filtered.map((suggestion, i) => (
            <div
              key={i}
              onClick={() => handleSelect(suggestion)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--color-bg-input)';
                e.target.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--color-text-secondary)';
              }}
            >
              <FiSearch size={12} style={{ marginRight: '8px', opacity: 0.5 }} />
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterBar = ({
  searchTerm,
  setSearchTerm,
  filters,
  onFilterChange,
  suggestions = []
}) => {
  const [selectedValues, setSelectedValues] = useState({});

  const handleSelectChange = (key, value) => {
    setSelectedValues(prev => ({ ...prev, [key]: value }));
    onFilterChange(key, value);
  };

  return (
    <div className="filter-bar">
      <SearchSuggestions
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        suggestions={suggestions}
        onSelect={(val) => onFilterChange?.('search', val)}
      />

      <div className="filter-selects">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          <FiFilter /> Filters:
        </div>

        {filters.map((filter) => (
          <select
            key={filter.key}
            className="select"
            value={selectedValues[filter.key] || ''}
            onChange={(e) => handleSelectChange(filter.key, e.target.value)}
          >
            <option value="">{filter.label}</option>
            {filter.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
