import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import '../styles/Register.css';
import logo from '../assets/images/logo.png';
import { authAPI } from '../config/api';

export default function Register() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    department: '',
    city: '',
    phone: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePhoto: null
  });
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profilePhoto: 'Por favor selecciona un archivo de imagen válido'
        }));
        return;
      }
      
      // Validar tamaño máximo (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profilePhoto: 'La imagen no debe superar 5MB'
        }));
        return;
      }

      // Leer el archivo y crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profilePhoto: file
        }));
        setProfilePhotoPreview(reader.result);
        // Limpiar error si existía
        if (errors.profilePhoto) {
          setErrors(prev => ({
            ...prev,
            profilePhoto: ''
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      profilePhoto: null
    }));
    setProfilePhotoPreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre completo
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validar departamento
    if (!formData.department.trim()) {
      newErrors.department = 'El departamento es requerido';
    }

    // Validar ciudad
    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    // Validar teléfono
    if (!formData.phone) {
      newErrors.phone = 'El número telefónico es requerido';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'El teléfono debe tener 10 dígitos';
    }

    // Validar edad
    if (!formData.age) {
      newErrors.age = 'La edad es requerida';
    } else if (formData.age < 18 || formData.age > 100) {
      newErrors.age = 'Debes tener entre 18 y 100 años';
    }

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      try {
        // Enviar datos básicos de registro
        const registroData = {
          nombre: formData.fullName,
          email: formData.email,
          password: formData.password,
          ciudad: formData.city
        };

        const response = await fetch('http://localhost:8000/api/usuarios/registro/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registroData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.email?.[0] || errorData.detail || errorData.password?.[0] || 'Error en el registro');
        }

        const data = await response.json();
        
        // Guardar token automáticamente después del registro
        if (data.access) {
          localStorage.setItem('token', data.access);
          localStorage.setItem('user', JSON.stringify(data.user || {}));
          
          // Actualizar el contexto de autenticación
          setToken(data.access);
          setUser(data.user || {});
        }

        alert('¡Registro exitoso! Bienvenido a SkillLink');
        navigate('/');
      } catch (error) {
        setErrors({
          submit: error.message || 'Error al registrarse. Intenta de nuevo.'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Registrase con Google
  const handleGoogleRegister = async (credentialResponse) => {
    if (credentialResponse?.credential) {
      try {
        setLoading(true);
        console.log('🔄 Intentando registro con Google...');
        
        // Enviar el token de Google al backend
        const result = await fetch('http://localhost:8000/api/usuarios/google-login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_token: credentialResponse.credential
          }),
        });

        if (!result.ok) {
          const errorData = await result.json();
          throw new Error(errorData.error || 'Error en registro con Google');
        }

        const data = await result.json();
        console.log('✅ Registro con Google exitoso:', data);
        
        // Guardar token en localStorage
        localStorage.setItem('token', data.access);
        localStorage.setItem('user', JSON.stringify(data.user || data));
        
        // Actualizar el contexto de autenticación
        setToken(data.access);
        setUser(data.user || data);
        
        // Limpiar errores
        setErrors({});
        
        // Mostrar mensaje y redirigir
        alert('¡Registro exitoso con Google!');
        navigate('/');
      } catch (error) {
        console.error('❌ Error en registro con Google:', error);
        setErrors({
          submit: error.message || 'Error al registrarse con Google'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Logo */}
        <div className="register-logo-section">
          <img src={logo} alt="SkillLink Logo" className="register-logo" />
          <h1 className="register-title">SkillLink</h1>
          <p className="register-subtitle">Crea tu cuenta</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="register-form">
          {errors.submit && (
            <div className="error-banner">
              <span className="error-message">{errors.submit}</span>
            </div>
          )}
          
          {/* Foto de Perfil */}
          <div className="profile-photo-section">
            <div className="profile-photo-container">
              {profilePhotoPreview ? (
                <img src={profilePhotoPreview} alt="Preview" className="profile-photo-preview" />
              ) : (
                <div className="profile-photo-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <p>Foto de Perfil</p>
                </div>
              )}
            </div>
            <div className="profile-photo-buttons">
              <label className="profile-photo-input-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="profile-photo-input"
                />
                <span className="profile-photo-button">
                  {profilePhotoPreview ? 'Cambiar foto' : 'Seleccionar foto'}
                </span>
              </label>
              {profilePhotoPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="profile-photo-remove-button"
                >
                  Eliminar
                </button>
              )}
            </div>
            {errors.profilePhoto && (
              <span className="error-message">{errors.profilePhoto}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Nombre completo
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`form-input ${errors.fullName ? 'form-input-error' : ''}`}
                placeholder="Juan Pérez"
              />
              {errors.fullName && (
                <span className="error-message">{errors.fullName}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department" className="form-label">
                Departamento
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`form-input ${errors.department ? 'form-input-error' : ''}`}
                placeholder="Santander"
              />
              {errors.department && (
                <span className="error-message">{errors.department}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="city" className="form-label">
                Ciudad
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`form-input ${errors.city ? 'form-input-error' : ''}`}
                placeholder="Bucaramanga"
              />
              {errors.city && (
                <span className="error-message">{errors.city}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Número telefónico
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
                placeholder="3001234567"
              />
              {errors.phone && (
                <span className="error-message">{errors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="age" className="form-label">
                Edad
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className={`form-input ${errors.age ? 'form-input-error' : ''}`}
                placeholder="25"
              />
              {errors.age && (
                <span className="error-message">{errors.age}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                placeholder="ejemplo@correo.com"
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Crear contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Registrando...' : 'ACEPTAR'}
          </button>

          <div className="divider">O</div>

          <div className="google-signin-container">
            <GoogleLogin
              onSuccess={handleGoogleRegister}
              onError={() => {
                console.error('❌ Error en Google registro - Verifica que el Google Client ID esté configurado correctamente en Google Cloud Console');
                setErrors({
                  submit: 'Error con Google OAuth. Por favor, intenta con email y contraseña.'
                });
              }}
              theme="outline"
              size="large"
              width="100%"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="register-footer">
          <p className="register-footer-text">
            ¿Ya tienes cuenta?{' '}
            <button onClick={handleGoToLogin} className="register-link">
              Iniciar sesión
            </button>
          </p>
          <button onClick={handleGoToHome} className="back-home-button">
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}