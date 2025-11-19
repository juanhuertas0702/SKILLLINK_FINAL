import React from 'react';
import '../styles/FilterModal.css';

export default function FilterModal({ isOpen, onClose, filters, onFilterChange, onApplyFilters, onClearFilters }) {
  if (!isOpen) return null;

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <div className="filter-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="filter-modal-header">
          <h3 className="filter-modal-title">Filtros de búsqueda</h3>
          <button onClick={onClose} className="filter-modal-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="filter-section">
          <h4 className="filter-section-title">Disponibilidad</h4>
          <div className="filter-options">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.showAvailable}
                onChange={(e) => onFilterChange('showAvailable', e.target.checked)}
              />
              <span className="filter-label">
                <span className="status-badge status-available-badge">Disponible</span>
              </span>
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.showOccupied}
                onChange={(e) => onFilterChange('showOccupied', e.target.checked)}
              />
              <span className="filter-label">
                <span className="status-badge status-occupied-badge">Ocupado</span>
              </span>
            </label>
          </div>
        </div>

        <div className="filter-section">
          <h4 className="filter-section-title">Calificación mínima</h4>
          <div className="rating-slider-container">
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filters.minRating}
              onChange={(e) => onFilterChange('minRating', parseFloat(e.target.value))}
              className="rating-slider"
            />
            <div className="rating-display">
              <span className="rating-value">{filters.minRating.toFixed(1)}</span>
              <div className="rating-stars-display">
                {[...Array(5)].map((_, index) => (
                  <svg
                    key={index}
                    className={`star-icon ${index < Math.floor(filters.minRating) ? 'star-filled' : 'star-empty'}`}
                    viewBox="0 0 24 24"
                    fill={index < Math.floor(filters.minRating) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="filter-modal-actions">
          <button onClick={onClearFilters} className="filter-button-clear">
            Limpiar filtros
          </button>
          <button onClick={onApplyFilters} className="filter-button-apply">
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}