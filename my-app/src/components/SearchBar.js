import React from 'react';
import '../styles/SearchBar.css';

export default function SearchBar({ searchQuery, onSearchChange, onFilterClick }) {
  return (
    <div className="search-section">
      <div className="search-header">
        <h2 className="search-title">Busca los mejores servicios para ti</h2>
        <p className="search-subtitle">
          Conecta con profesionales independientes de confianza
        </p>
      </div>

      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="filter-button" onClick={onFilterClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span>FILTRAR</span>
        </button>
      </div>
    </div>
  );
}