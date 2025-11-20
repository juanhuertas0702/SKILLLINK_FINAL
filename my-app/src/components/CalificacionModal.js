import React, { useState } from 'react';
import '../styles/CalificacionModal.css';

export default function CalificacionModal({ solicitud, onClose, onSubmit }) {
  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStarClick = (star) => {
    setPuntuacion(star);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit({
        solicitud: solicitud.id,
        puntaje: puntuacion,
        comentario: comentario,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Error al enviar calificación');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content calificacion-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Calificar Servicio</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="calificacion-form">
          <div className="form-group">
            <label className="label-texto">Tu calificación:</label>
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= puntuacion ? 'filled' : ''}`}
                  onClick={() => handleStarClick(star)}
                  aria-label={`Dar ${star} estrella${star !== 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="puntuacion-label">{puntuacion}/5 estrellas</p>
          </div>

          <div className="form-group">
            <label className="label-texto">Comentario (opcional):</label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Comparte tu experiencia con el trabajador..."
              maxLength={500}
              rows={4}
              className="textarea-input"
            />
            <p className="char-count">{comentario.length}/500 caracteres</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Calificación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
