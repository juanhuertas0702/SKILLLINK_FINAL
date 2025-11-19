import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { serviciosAPI } from '../config/api';
import '../styles/PublicarServicio.css';

export default function PublicarServicio() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    precio: '',
    disponibilidad: 'disponible'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Selecciona una categoría';
    }

    if (!formData.precio || isNaN(formData.precio)) {
      newErrors.precio = 'Ingresa un precio válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setLoading(true);
      try {
        console.log('🔄 Publicando servicio:', formData);

        // Preparar datos para enviar al backend (deben coincidir con el modelo Django)
        const servicioData = {
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          categoria: formData.categoria,
          precio: parseFloat(formData.precio)
        };

        const data = await serviciosAPI.crear(servicioData);
        console.log('✅ Servicio publicado:', data);

        alert('¡Servicio publicado exitosamente!');
        navigate('/');
      } catch (error) {
        console.error('❌ Error al publicar servicio:', error);
        
        // Mostrar el error del servidor si está disponible
        let errorMessage = 'Error al publicar el servicio';
        let showAlert = false;
        
        if (error.message) {
          errorMessage = error.message;
        }
        
        // Si es error de límite de servicios, mostrar alert
        if (errorMessage.includes('límite') || errorMessage.includes('SkillLink Pro')) {
          showAlert = true;
          alert(errorMessage);
        }
        
        setErrors({
          submit: errorMessage
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <Header />
      <div className="publicar-servicio-container">
        <div className="publicar-servicio-card">
          <h1 className="page-title">Publicar Servicio</h1>

          <form onSubmit={handleSubmit} className="servicio-form">
            {errors.submit && (
              <div className="error-banner">
                <span>{errors.submit}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="titulo" className="form-label">
                Título del Servicio
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className={`form-input ${errors.titulo ? 'form-input-error' : ''}`}
                placeholder="Ej: Reparación de plomería"
              />
              {errors.titulo && <span className="error-message">{errors.titulo}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="descripcion" className="form-label">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className={`form-textarea ${errors.descripcion ? 'form-input-error' : ''}`}
                placeholder="Describe el servicio que ofreces"
                rows="5"
              ></textarea>
              {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="categoria" className="form-label">
                  Categoría
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className={`form-select ${errors.categoria ? 'form-input-error' : ''}`}
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="plomeria">Plomería</option>
                  <option value="carpinteria">Carpintería</option>
                  <option value="electricidad">Electricidad</option>
                  <option value="limpieza">Limpieza</option>
                  <option value="tutoria">Tutoría</option>
                  <option value="cocina">Cocina</option>
                  <option value="otro">Otro</option>
                </select>
                {errors.categoria && <span className="error-message">{errors.categoria}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="precio" className="form-label">
                  Precio (por hora)
                </label>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  className={`form-input ${errors.precio ? 'form-input-error' : ''}`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.precio && <span className="error-message">{errors.precio}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="disponibilidad" className="form-label">
                Disponibilidad
              </label>
              <select
                id="disponibilidad"
                name="disponibilidad"
                value={formData.disponibilidad}
                onChange={handleChange}
                className="form-select"
              >
                <option value="disponible">Disponible</option>
                <option value="no_disponible">No disponible</option>
              </select>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Publicando...' : 'Publicar Servicio'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
