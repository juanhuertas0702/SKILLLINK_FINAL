import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { disponibilidadAPI } from '../config/api';
import '../styles/Disponibilidad.css';

export default function Disponibilidad() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    dia: 'lunes',
    hora_inicio: '08:00',
    hora_fin: '17:00'
  });

  const dias = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
  ];

  // Cargar disponibilidades
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchDisponibilidades();
  }, [isAuthenticated, navigate]);

  const fetchDisponibilidades = async () => {
    try {
      setLoading(true);
      const data = await disponibilidadAPI.listar();
      console.log('Disponibilidades cargadas:', data);
      console.log('Es array?', Array.isArray(data));
      console.log('Longitud:', Array.isArray(data) ? data.length : 'no es array');
      
      // Asegurar que siempre es un array
      const disponibilidadesArray = Array.isArray(data) ? data : [];
      setDisponibilidades(disponibilidadesArray);
      setError('');
    } catch (err) {
      console.error('Error al cargar disponibilidades:', err);
      setError('Error al cargar tu disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que hora_fin sea mayor que hora_inicio
    if (formData.hora_fin <= formData.hora_inicio) {
      alert('La hora de fin debe ser mayor que la hora de inicio');
      return;
    }

    // Validar que no exista disponibilidad para ese día
    const diaExistente = disponibilidades.find(d => d.dia === formData.dia);
    if (diaExistente) {
      alert('Ya tienes registrada disponibilidad para este día');
      return;
    }

    try {
      await disponibilidadAPI.crear(formData);
      alert('Disponibilidad agregada exitosamente');
      setFormData({
        dia: 'lunes',
        hora_inicio: '08:00',
        hora_fin: '17:00'
      });
      fetchDisponibilidades();
    } catch (err) {
      console.error('Error al agregar disponibilidad:', err);
      // Mostrar el mensaje de error específico del backend
      const errorMessage = err.message || 'Error al agregar disponibilidad';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta disponibilidad?')) {
      try {
        await disponibilidadAPI.eliminar(id);
        alert('Disponibilidad eliminada exitosamente');
        fetchDisponibilidades();
      } catch (err) {
        console.error('Error al eliminar disponibilidad:', err);
        alert('Error al eliminar disponibilidad');
      }
    }
  };

  const getDiaLabel = (diaValue) => {
    return dias.find(d => d.value === diaValue)?.label || diaValue;
  };

  const formatHora = (hora) => {
    return hora.substring(0, 5);
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="disponibilidad-container">
          <div className="loading">Cargando disponibilidad...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="disponibilidad-container">
        <div className="disponibilidad-card">
          <h1 className="page-title">Gestiona tu Disponibilidad</h1>
          <p className="subtitle">Define los horarios en los que estás disponible para trabajar</p>

          {error && <div className="error-message">{error}</div>}

          {/* Formulario para agregar disponibilidad */}
          <div className="agregar-disponibilidad">
            <h2 className="section-title">Agregar Disponibilidad</h2>
            <form onSubmit={handleSubmit} className="disponibilidad-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dia">Día</label>
                  <select
                    id="dia"
                    name="dia"
                    value={formData.dia}
                    onChange={handleChange}
                    className="form-select"
                  >
                    {dias.map(d => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="hora_inicio">Hora de Inicio</label>
                  <input
                    type="time"
                    id="hora_inicio"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="hora_fin">Hora de Fin</label>
                  <input
                    type="time"
                    id="hora_fin"
                    name="hora_fin"
                    value={formData.hora_fin}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <button type="submit" className="btn-agregar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Agregar Disponibilidad
              </button>
            </form>
          </div>

          {/* Lista de disponibilidades */}
          <div className="lista-disponibilidad">
            <h2 className="section-title">Tu Disponibilidad</h2>

            {disponibilidades.length === 0 ? (
              <div className="no-disponibilidad">
                <p>Aún no has configurado tu disponibilidad</p>
                <p className="subtitle">Agrega horarios en los que estés disponible para recibir solicitudes</p>
              </div>
            ) : (
              <div className="disponibilidad-grid">
                {disponibilidades.map(disp => (
                  <div key={disp.id_disponibilidad} className="disponibilidad-item">
                    <div className="dia-badge">
                      {getDiaLabel(disp.dia)}
                    </div>
                    <div className="horario">
                      <span className="hora-inicio">{formatHora(disp.hora_inicio)}</span>
                      <span className="separador">-</span>
                      <span className="hora_fin">{formatHora(disp.hora_fin)}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(disp.id_disponibilidad)}
                      className="btn-eliminar"
                      title="Eliminar disponibilidad"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Información */}
          <div className="info-section">
            <h3>💡 Consejos</h3>
            <ul>
              <li>Define horarios realistas en los que puedas atender solicitudes</li>
              <li>Puedes agregar disponibilidad para múltiples días</li>
              <li>Tu disponibilidad será visible para los clientes</li>
              <li>Modifica tu disponibilidad cuando cambies tu horario</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
