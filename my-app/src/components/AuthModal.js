import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthModal.css';

export default function AuthModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleRegister = () => {
    onClose();
    navigate('/register');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="modal-header">
          <div className="modal-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h3 className="modal-title">Autenticación requerida</h3>
          <p className="modal-text">
            Para contactar con un proveedor de servicios, primero debes iniciar sesión o crear una cuenta
          </p>
        </div>

        <div className="modal-buttons">
          <button onClick={handleLogin} className="modal-button-primary">Iniciar Sesión</button>
          <button onClick={handleRegister} className="modal-button-secondary">Crear Cuenta</button>
        </div>
      </div>
    </div>
  );
}