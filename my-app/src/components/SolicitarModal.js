import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/FilterModal.css'; // Reusamos los estilos del otro modal para que se vea igual

export default function SolicitarModal({ isOpen, onClose, servicio }) {
  const { token, user } = useAuth();
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !servicio) return null;

  const handleEnviar = async () => {
    if (!mensaje.trim()) {
      alert("Por favor escribe un mensaje para el trabajador.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/solicitudes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          servicio: servicio.id,
          mensaje: mensaje
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al enviar la solicitud");
      }

      alert("✅ ¡Solicitud enviada con éxito! El trabajador recibirá tu mensaje.");
      setMensaje(''); // Limpiar mensaje
      onClose(); // Cerrar modal
    } catch (error) {
      console.error("Error enviando solicitud:", error);
      alert("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <div className="filter-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="filter-modal-header">
          <h3 className="filter-modal-title">Contactar Profesional</h3>
          <button onClick={onClose} className="filter-modal-close">✖</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#666', marginBottom: '10px' }}>
            Estás contactando a: <strong>{servicio.workerName}</strong>
          </p>
          <div style={{ 
            background: '#f3f4f6', 
            padding: '10px', 
            borderRadius: '8px',
            borderLeft: '4px solid #3b82f6' 
          }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>{servicio.title}</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563' }}>
              Precio estimado: ${servicio.price}
            </p>
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Tu mensaje:
          </label>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Hola, me interesa tu servicio. ¿Podrías ayudarme con..."
            style={{
              width: '100%',
              height: '120px',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              resize: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div className="filter-modal-actions">
          <button 
            onClick={onClose} 
            className="filter-button-clear"
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            onClick={handleEnviar} 
            className="filter-button-apply"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </div>
      </div>
    </div>
  );
}