import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';
import logo from '../assets/images/logo.png';

export default function Header({ onAuthClick }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <img src={logo} alt="SkillLink Logo" className="logo-image" />
          <h1 className="logo-text">SkillLink</h1>
        </div>

        {!isAuthenticated ? (
          // Usuario no autenticado
          <div className="auth-buttons-container">
            <button onClick={() => navigate('/login')} className="auth-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Iniciar Sesión</span>
            </button>
            <button onClick={() => navigate('/register')} className="auth-button auth-button-secondary">
              <span>Registrarse</span>
            </button>
          </div>
        ) : (
          // Usuario autenticado
          <nav className="authenticated-nav">
            <button onClick={() => navigate('/')} className="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Inicio</span>
            </button>

            <button onClick={() => navigate('/publicar-servicio')} className="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Publicar Servicio</span>
            </button>

            <button onClick={() => navigate('/mis-servicios')} className="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
              </svg>
              <span>Mis Servicios</span>
            </button>

            <button onClick={() => navigate('/disponibilidad')} className="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Disponibilidad</span>
            </button>

            <button onClick={() => navigate('/mensajes')} className="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Mensajes</span>
            </button>

            <div className="profile-dropdown">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="profile-button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>{user?.nombre || 'Mi Perfil'}</span>
              </button>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => {
                    navigate('/perfil');
                    setIsDropdownOpen(false);
                  }} className="dropdown-item">
                    Ver Perfil
                  </button>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}