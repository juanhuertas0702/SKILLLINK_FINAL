import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { serviciosAPI } from '../config/api';
import '../styles/MisServicios.css';

// Importa las imágenes de servicios
import plomeroImg from '../assets/images/plomero.png';
import carpinteroImg from '../assets/images/carpintero.png';
import meseroImg from '../assets/images/mesero.png';

export default function MisServicios() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchMisServicios();
  }, [isAuthenticated, navigate]);

  const fetchMisServicios = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando mis servicios...');

      // Obtener servicios del usuario autenticado
      const data = await serviciosAPI.listar();
      console.log('✅ Servicios obtenidos:', data);

      // Los servicios vienen en array o como objeto con resultados
      const serviciosList = Array.isArray(data) ? data : data.results || [];
      setServicios(serviciosList);
    } catch (err) {
      console.error('❌ Error cargando servicios:', err);
      setError(err.message || 'Error al cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  const getImagenServicio = (categoria) => {
    const categoriaLower = categoria?.toLowerCase() || '';
    if (categoriaLower.includes('plomeria') || categoriaLower.includes('plomero')) {
      return plomeroImg;
    }
    if (categoriaLower.includes('carpinteria') || categoriaLower.includes('carpintero')) {
      return carpinteroImg;
    }
    if (categoriaLower.includes('mesero') || categoriaLower.includes('camarero')) {
      return meseroImg;
    }
    return plomeroImg; // Default
  };

  const handleEliminarServicio = async (servicio) => {
    // Confirmar eliminación
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar el servicio "${servicio.titulo}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);
      console.log('🗑️ Eliminando servicio:', servicio.id_servicio);
      
      const result = await serviciosAPI.eliminar(servicio.id_servicio);
      
      console.log('✅ Servicio eliminado correctamente:', result);
      alert('✅ Servicio eliminado correctamente');
      
      // Actualizar lista de servicios
      await fetchMisServicios();
    } catch (err) {
      console.error('❌ Error al eliminar servicio:', err);
      alert(`❌ Error al eliminar servicio: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="star star-filled" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      );
    }
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="star star-filled" style={{ opacity: 0.5 }} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      );
    }
    while (stars.length < 5) {
      stars.push(
        <svg key={`empty-${stars.length}`} className="star star-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      );
    }
    return stars;
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'aprobado':
        return 'estado-aprobado';
      case 'pendiente':
        return 'estado-pendiente';
      case 'rechazado':
        return 'estado-rechazado';
      default:
        return 'estado-pendiente';
    }
  };

  return (
    <div>
      <Header />
      <div className="mis-servicios-container">
        <div className="mis-servicios-header">
          <h1>Mis Servicios</h1>
          <button onClick={() => navigate('/publicar-servicio')} className="btn-nuevo-servicio">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Publicar Nuevo Servicio
          </button>
        </div>

        {loading ? (
          <div className="loading">
            <p>Cargando servicios...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        ) : servicios.length === 0 ? (
          <div className="no-servicios">
            <p>Aún no has publicado ningún servicio</p>
            <p className="subtitle">¡Comienza a publicar tus servicios ahora!</p>
            <button onClick={() => navigate('/publicar-servicio')} className="btn-publicar">
              Publicar Servicio
            </button>
          </div>
        ) : (
          <div className="servicios-grid">
            {servicios.map((servicio) => (
              <div key={servicio.id_servicio} className="servicio-card">
                <div className="servicio-image">
                  <img 
                    src={getImagenServicio(servicio.categoria)} 
                    alt={servicio.titulo} 
                    className="servicio-image-img" 
                  />
                  <span className={`estado-badge ${getEstadoColor(servicio.estado_publicacion)}`}>
                    {servicio.estado_publicacion === 'aprobado' && '✓ Aprobado'}
                    {servicio.estado_publicacion === 'pendiente' && '⏳ Pendiente'}
                    {servicio.estado_publicacion === 'rechazado' && '✕ Rechazado'}
                  </span>
                </div>

                <div className="servicio-info">
                  <div className="servicio-header">
                    <div>
                      <h3 className="servicio-titulo">{servicio.titulo}</h3>
                      <p className="servicio-categoria">{servicio.categoria}</p>
                      <p className="servicio-descripcion">{servicio.descripcion.substring(0, 80)}...</p>
                    </div>
                  </div>

                  <div className="servicio-precio">
                    <span className="precio-label">Precio/Hora:</span>
                    <span className="precio-valor">${servicio.precio}</span>
                  </div>

                  <div className="servicio-rating">
                    <span className="rating-label">Tu Calificación:</span>
                    <div className="rating-stars">
                      {renderStars(servicio.trabajador_calificacion || 0)}
                    </div>
                    <span className="rating-value">
                      {servicio.trabajador_calificacion ? `${servicio.trabajador_calificacion.toFixed(1)}/5` : 'Sin calificaciones'}
                    </span>
                  </div>

                  <div className="servicio-footer">
                    <div className="servicio-actions">
                      <button 
                        onClick={() => handleEliminarServicio(servicio)} 
                        className="btn-eliminar"
                        title="Eliminar servicio"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
