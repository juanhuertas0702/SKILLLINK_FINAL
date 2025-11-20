import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';
import logo from '../assets/images/logo.png';
import { authAPI } from '../config/api';

export default function Login() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      try {
        console.log('🔄 Intentando login con:', formData.email);

        const response = await fetch('http://localhost:8000/api/auth/token/', { // ✅ URL Correcta
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al iniciar sesión');
        }

        const data = await response.json();
        console.log('✅ Login exitoso:', data);
        
        // Guardar token y usuario en localStorage
        localStorage.setItem('token', data.access);
        localStorage.setItem('user', JSON.stringify(data.user || {}));
        
        // Actualizar el contexto de autenticación
        setToken(data.access);
        setUser(data.user || {});
        
        // Limpiar errores
        setErrors({});
        
        // Mostrar mensaje y redirigir
        alert('¡Inicio de sesión exitoso!');
        navigate('/');
      } catch (error) {
        console.error('❌ Error en login:', error);
        setErrors({
          submit: error.message || 'Error al iniciar sesión. Verifica tus credenciales.'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Inicializar Google OAuth
  const handleGoogleLogin = async (credentialResponse) => {
    if (credentialResponse?.credential) {
      try {
        setLoading(true);
        console.log('🔄 Intentando Google login...');
        
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
          throw new Error(errorData.error || 'Error en Google login');
        }

        const data = await result.json();
        console.log('✅ Google login exitoso:', data);
        
        // Guardar token en localStorage
        localStorage.setItem('token', data.access);
        localStorage.setItem('user', JSON.stringify(data.user || data));
        
        // Actualizar el contexto de autenticación
        setToken(data.access);
        setUser(data.user || data);
        
        // Limpiar errores
        setErrors({});
        
        // Mostrar mensaje y redirigir
        alert('¡Bienvenido con Google!');
        navigate('/');
      } catch (error) {
        console.error('❌ Error en Google login:', error);
        setErrors({
          submit: error.message || 'Error al iniciar sesión con Google'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoToRegister = () => {
    navigate('/register');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo-section">
          <img src={logo} alt="SkillLink Logo" className="login-logo" />
          <h1 className="login-title">SkillLink</h1>
          <p className="login-subtitle">Inicia sesión para continuar</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">
          {errors.submit && (
            <div className="error-banner">
              <span className="error-message">{errors.submit}</span>
            </div>
          )}
          
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

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
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

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
          </button>

          <div className="divider">O</div>

          <div className="google-signin-container">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.error('❌ Error en Google login - Verifica que el Google Client ID esté configurado correctamente en Google Cloud Console');
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

        {/* Link a registro */}
        <div className="login-footer">
          <p className="login-footer-text">
            ¿No tienes cuenta?{' '}
            <button onClick={handleGoToRegister} className="login-link">
              Crear una
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