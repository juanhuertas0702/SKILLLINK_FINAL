import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { authAPI, calificacionesAPI } from '../config/api';
import '../styles/Perfil.css';

export default function Perfil() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    departamento: '',
    ciudad: '',
    telefono: '',
    edad: '',
    descripcion: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [calificaciones, setCalificaciones] = useState([]);
  const [promedioCalificacion, setPromedioCalificacion] = useState(0);
  const [cargandoCalificaciones, setCargandoCalificaciones] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        departamento: user.departamento || '',
        ciudad: user.ciudad || '',
        telefono: user.telefono || '',
        edad: user.edad || '',
        descripcion: user.descripcion || ''
      });
    }

    // Cargar calificaciones si es trabajador
    cargarCalificaciones();
  }, [user, isAuthenticated, navigate]);

  const cargarCalificaciones = async () => {
    try {
      setCargandoCalificaciones(true);
      const data = await calificacionesAPI.listar();
      const calificacionesList = Array.isArray(data) ? data : data.results || [];
      setCalificaciones(calificacionesList);
      
      if (calificacionesList.length > 0) {
        const promedio = calificacionesList.reduce((sum, cal) => sum + cal.puntaje, 0) / calificacionesList.length;
        setPromedioCalificacion(promedio);
      }
    } catch (error) {
      console.error('Error al cargar calificaciones:', error);
    } finally {
      setCargandoCalificaciones(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="star-icon star-filled" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      );
    }
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="star-icon star-filled" style={{ opacity: 0.5 }} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      );
    }
    while (stars.length < 5) {
      stars.push(
        <svg key={`empty-${stars.length}`} className="star-icon star-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      );
    }
    return stars;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔄 Actualizando perfil...');

      const data = await authAPI.getCurrentUser(); // Primero obtener datos actuales
      
      // Actualizar con los datos del formulario
      const updatedData = {
        ...data,
        nombre: formData.nombre,
        departamento: formData.departamento,
        ciudad: formData.ciudad,
        telefono: formData.telefono,
        edad: formData.edad,
        descripcion: formData.descripcion
      };

      // Usar fetch para PUT ya que authAPI no tiene método actualizar
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/usuarios/me/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar perfil');
      }

      const responseData = await response.json();
      console.log('✅ Perfil actualizado:', responseData);

      // Actualizar localStorage
      localStorage.setItem('user', JSON.stringify(responseData));

      alert('¡Perfil actualizado exitosamente!');
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      setErrors({
        submit: error.message || 'Error al actualizar el perfil'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="perfil-container">
        <div className="perfil-card">
          <div className="perfil-header">
            <div className="profile-avatar">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="perfil-title-section">
              <h1 className="perfil-title">{formData.nombre || 'Mi Perfil'}</h1>
              <p className="perfil-email">{formData.email}</p>
            </div>
          </div>

          {errors.submit && (
            <div className="error-banner">
              <span>{errors.submit}</span>
            </div>
          )}

          {!isEditing ? (
            <div className="perfil-view">
              <div className="info-group">
                <label>Nombre</label>
                <p>{formData.nombre || '-'}</p>
              </div>
              <div className="info-group">
                <label>Email</label>
                <p>{formData.email || '-'}</p>
              </div>
              <div className="info-group">
                <label>Departamento</label>
                <p>{formData.departamento || '-'}</p>
              </div>
              <div className="info-group">
                <label>Ciudad</label>
                <p>{formData.ciudad || '-'}</p>
              </div>
              <div className="info-group">
                <label>Teléfono</label>
                <p>{formData.telefono || '-'}</p>
              </div>
              <div className="info-group">
                <label>Edad</label>
                <p>{formData.edad || '-'}</p>
              </div>
              <div className="info-group">
                <label>Descripción</label>
                <p>{formData.descripcion || '-'}</p>
              </div>

              {/* Sección de Calificaciones */}
              <div className="calificaciones-section">
                <h2>Mis Calificaciones</h2>
                {cargandoCalificaciones ? (
                  <p>Cargando calificaciones...</p>
                ) : calificaciones.length > 0 ? (
                  <div className="calificaciones-content">
                    <div className="promedio-calificacion">
                      <div className="promedio-numero">{promedioCalificacion.toFixed(1)}</div>
                      <div className="promedio-info">
                        <div className="promedio-stars">
                          {renderStars(promedioCalificacion)}
                        </div>
                        <p className="promedio-texto">{calificaciones.length} {calificaciones.length === 1 ? 'calificación' : 'calificaciones'}</p>
                      </div>
                    </div>
                    <div className="calificaciones-list">
                      {calificaciones.map((cal) => (
                        <div key={cal.id_calificacion} className="calificacion-item">
                          <div className="calificacion-header">
                            <div className="calificacion-user">
                              <p className="user-name">{cal.cliente_nombre}</p>
                              <div className="stars-small">
                                {renderStars(cal.puntaje)}
                              </div>
                            </div>
                            <span className="calificacion-puntuacion">{cal.puntaje}/5</span>
                          </div>
                          {cal.comentario && (
                            <p className="calificacion-comentario">"{cal.comentario}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="sin-calificaciones">Aún no tienes calificaciones</p>
                )}
              </div>

              <button onClick={() => setIsEditing(true)} className="edit-button">
                Editar Perfil
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="perfil-form">
              <div className="form-group">
                <label htmlFor="nombre" className="form-label">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  disabled
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="departamento" className="form-label">Departamento</label>
                  <input
                    type="text"
                    id="departamento"
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ciudad" className="form-label">Ciudad</label>
                  <input
                    type="text"
                    id="ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="telefono" className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edad" className="form-label">Edad</label>
                  <input
                    type="number"
                    id="edad"
                    name="edad"
                    value={formData.edad}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="descripcion" className="form-label">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="4"
                  placeholder="Cuéntame sobre ti..."
                ></textarea>
              </div>

              <div className="button-group">
                <button type="submit" className="save-button" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="cancel-button"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
