// Configuración de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Función helper para hacer peticiones
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Agregar token si existe
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Manejar diferentes formatos de error
      let errorMessage = `Error ${response.status}`;
      
      if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData) && errorData.length > 0) {
        // Si es un array de errores (puede venir de ValidationError)
        if (typeof errorData[0] === 'string') {
          errorMessage = errorData[0];
        } else if (errorData[0].detail) {
          errorMessage = errorData[0].detail;
        }
      } else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
        // Si es un objeto con errores por campo
        const firstKey = Object.keys(errorData)[0];
        const firstError = errorData[firstKey];
        if (Array.isArray(firstError)) {
          errorMessage = firstError[0];
        } else {
          errorMessage = firstError;
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// API de Autenticación
export const authAPI = {
  register: (data) =>
    apiRequest('/usuarios/registro/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (email, password) =>
    apiRequest('/usuarios/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () =>
    apiRequest('/usuarios/me/', {
      method: 'GET',
    }),

  esTrabajador: () =>
    apiRequest('/usuarios/es-trabajador/', {
      method: 'GET',
    }),
};

// API de Servicios
export const serviciosAPI = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/servicios/${queryString ? '?' + queryString : ''}`, {
      method: 'GET',
    });
  },

  // Obtener servicios públicos (sin autenticación)
  listarPublicos: (filtros = {}) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    return fetch(`${API_BASE_URL}/servicios/publicos/${queryString ? '?' + queryString : ''}`)
      .then(res => res.json())
      .catch(err => {
        console.error('Error en servicios públicos:', err);
        return [];
      });
  },

  crear: (data) =>
    apiRequest('/servicios/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  obtener: (id) =>
    apiRequest(`/servicios/${id}/`, {
      method: 'GET',
    }),

  actualizar: (id, data) =>
    apiRequest(`/servicios/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  eliminar: (id) =>
    apiRequest(`/servicios/${id}/`, {
      method: 'DELETE',
    }),
};

// API de Perfiles
export const perfilesAPI = {
  listar: () =>
    apiRequest('/perfiles/', {
      method: 'GET',
    }),

  obtener: (id) =>
    apiRequest(`/perfiles/${id}/`, {
      method: 'GET',
    }),

  obtenerPerfil: () =>
    apiRequest('/perfiles/me/', {
      method: 'GET',
    }),

  actualizar: (data) =>
    apiRequest('/perfiles/me/', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// API de Solicitudes
export const solicitudesAPI = {
  // Mis solicitudes como cliente
  listar: () =>
    apiRequest('/solicitudes/', {
      method: 'GET',
    }),

  // Solicitudes recibidas como trabajador
  recibidas: () =>
    apiRequest('/solicitudes/recibidas/', {
      method: 'GET',
    }),

  // Crear solicitud
  crear: (data) =>
    apiRequest('/solicitudes/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Obtener solicitud específica
  obtener: (id) =>
    apiRequest(`/solicitudes/${id}/`, {
      method: 'GET',
    }),

  // Aceptar solicitud
  aceptar: (id) =>
    apiRequest(`/solicitudes/${id}/aceptar/`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    }),

  // Rechazar solicitud
  rechazar: (id) =>
    apiRequest(`/solicitudes/${id}/rechazar/`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    }),

  // Eliminar solicitud/chat
  eliminar: (id) =>
    apiRequest(`/solicitudes/${id}/`, {
      method: 'DELETE',
    }),
};

// API de Chat
export const chatAPI = {
  // Obtener mensajes de una solicitud específica
  obtenerMensajes: (solicitudId) =>
    apiRequest(`/chat/${solicitudId}/`, {
      method: 'GET',
    }),

  // Enviar nuevo mensaje
  enviarMensaje: (solicitudId, texto, archivo = null) =>
    apiRequest('/chat/enviar/', {
      method: 'POST',
      body: JSON.stringify({
        solicitud: solicitudId,
        texto: texto,
        archivo: archivo
      }),
    }),

  // Marcar mensajes como leídos
  marcarComoLeidos: (solicitudId) =>
    apiRequest(`/chat/${solicitudId}/leer/`, {
      method: 'PUT',
    }),
};

// API de Disponibilidad
export const disponibilidadAPI = {
  listar: async () => {
    try {
      const data = await apiRequest('/disponibilidad/', {
        method: 'GET',
      });
      // Asegurar que siempre retorna un array
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object' && data.results) {
        // Si viene paginado, retorna solo los resultados
        return Array.isArray(data.results) ? data.results : [];
      }
      return [];
    } catch (err) {
      console.error('Error al listar disponibilidades:', err);
      return [];
    }
  },

  crear: (data) =>
    apiRequest('/disponibilidad/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  actualizar: (id, data) =>
    apiRequest(`/disponibilidad/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  eliminar: (id) =>
    apiRequest(`/disponibilidad/${id}/`, {
      method: 'DELETE',
    }),
};

export default {
  authAPI,
  serviciosAPI,
  perfilesAPI,
  solicitudesAPI,
  chatAPI,
  disponibilidadAPI,
};
