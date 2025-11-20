import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importamos Auth
import Header from '../components/Header';
import CalificacionModal from '../components/CalificacionModal';
import { authAPI, chatAPI, calificacionesAPI } from '../config/api';
import '../styles/Mensajes.css';

export default function Mensajes() {
  const navigate = useNavigate();
  const { token, user } = useAuth(); // Necesitamos el token para peticiones
  
  // Estados principales
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' o 'solicitudes'
  const [conversations, setConversations] = useState([]); // Chats activos (Aceptados)
  const [requests, setRequests] = useState([]); // Solicitudes pendientes
  const [selectedItem, setSelectedItem] = useState(null); // El chat o solicitud seleccionado
  const [messages, setMessages] = useState([]); // Mensajes del chat seleccionado
  
  // Estados de carga y mensajes
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [esTrabajador, setEsTrabajador] = useState(false);
  const [showCalificacionModal, setShowCalificacionModal] = useState(false);
  const [existeCalificacion, setExisteCalificacion] = useState(false);

  // Cargar datos al iniciar
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    verificarTrabajador();
    fetchData();
  }, [token, navigate]);

  // Verificar si el usuario es trabajador
  const verificarTrabajador = async () => {
    try {
      const result = await authAPI.esTrabajador();
      setEsTrabajador(result.es_trabajador);
    } catch (error) {
      console.error('Error verificando perfil:', error);
      setEsTrabajador(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Consultamos TODAS las solicitudes
      const response = await fetch('http://localhost:8000/api/solicitudes/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Error cargando datos');
      
      const data = await response.json();
      const lista = data.results || data;

      // CLASIFICACIÓN INTELIGENTE:
      // 1. Pendientes -> Pestaña Solicitudes
      const pendientes = lista.filter(item => item.estado === 'pendiente');
      
      // 2. Aceptadas + Finalizadas -> Pestaña Chats (para poder ver y calificar)
      const aceptadas = lista.filter(item => item.estado === 'aceptada' || item.estado === 'finalizada');

      setRequests(pendientes);
      setConversations(aceptadas);

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar mensajes cuando se selecciona un chat
  useEffect(() => {
    if (selectedItem && activeTab === 'chats') {
      cargarMensajes(selectedItem.id);
      verificarCalificacion(selectedItem.id);
    }
  }, [selectedItem, activeTab]);

  const cargarMensajes = async (solicitudId) => {
    try {
      const data = await chatAPI.obtenerMensajes(solicitudId);
      const messagesList = Array.isArray(data) ? data : data.results || [];
      setMessages(messagesList);
      
      // Marcar como leídos
      await chatAPI.marcarComoLeidos(solicitudId);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      setMessages([]);
    }
  };

  // Verificar si el chat ya tiene calificación
  const verificarCalificacion = async (solicitudId) => {
    try {
      const calificaciones = await calificacionesAPI.listar();
      const calificacionesArray = Array.isArray(calificaciones) ? calificaciones : calificaciones.results || [];
      const existente = calificacionesArray.some(cal => cal.solicitud === solicitudId);
      setExisteCalificacion(existente);
    } catch (error) {
      console.error('Error verificando calificación:', error);
      setExisteCalificacion(false);
    }
  };

  // Función para Responder (Aceptar/Rechazar)
  const handleResponse = async (id, decision) => {
    try {
      const response = await fetch(`http://localhost:8000/api/solicitudes/${id}/responder/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: decision })
      });

      if (!response.ok) throw new Error('Error al procesar solicitud');

      // Si todo sale bien:
      alert(decision === 'aceptada' ? '✅ ¡Solicitud Aceptada! Ahora puedes chatear.' : 'Solicitud rechazada.');
      
      // Recargar datos para mover la solicitud a chats (o eliminarla)
      fetchData();
      setSelectedItem(null); // Limpiar selección

    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  // Función para enviar mensaje
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedItem) {
      return;
    }

    try {
      setIsSending(true);
      const response = await fetch('http://localhost:8000/api/chat/enviar/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          solicitud: selectedItem.id,
          texto: newMessage
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al enviar mensaje');
      }

      // Limpiar input y recargar mensajes
      setNewMessage('');
      await cargarMensajes(selectedItem.id);

    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  // Renderizar el contenido principal (Derecha)
  // Función para eliminar chat/solicitud
  const handleDeleteChat = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este chat? No se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/solicitudes/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al eliminar chat');
      }

      alert('Chat eliminado exitosamente');
      fetchData();
      setSelectedItem(null);

    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  // Manejar envío de calificación
  const handleCalificacionSubmit = async (datos) => {
    try {
      await calificacionesAPI.crear(datos);
      setExisteCalificacion(true);
      setShowCalificacionModal(false);
      alert('¡Gracias por tu calificación!');
    } catch (error) {
      throw error;
    }
  };

  // Finalizar trabajo (solo para trabajadores)
  const handleFinalizarTrabajo = async (id) => {
    if (!window.confirm('¿Marcar este trabajo como finalizado? El cliente podrá calificarte después.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/solicitudes/${id}/finalizar/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al finalizar trabajo');
      }

      alert('✅ Trabajo marcado como finalizado');
      fetchData();
      setSelectedItem(null);

    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const renderMainContent = () => {
    if (!selectedItem) {
      return (
        <div className="no-chat-selected">
          <div className="empty-state-icon">💬</div>
          <p>Selecciona una conversación o solicitud</p>
        </div>
      );
    }

    // VISTA DE SOLICITUD PENDIENTE
    if (activeTab === 'solicitudes') {
      return (
        <div className="request-detail-container">
          <div className="request-header">
            <h2>Nueva Solicitud de Servicio</h2>
            <span className="status-badge pending">Pendiente</span>
          </div>
          
          <div className="request-card-large">
            <div className="request-info-row">
              <img 
                src={selectedItem.foto_cliente || "https://via.placeholder.com/50"} 
                alt="Cliente" 
                className="client-avatar-large"
              />
              <div>
                <h3>{selectedItem.nombre_cliente}</h3>
                <p className="text-muted">{selectedItem.email_cliente}</p>
              </div>
            </div>

            <div className="service-highlight">
              <strong>Servicio Solicitado:</strong> {selectedItem.titulo_servicio}
            </div>

            <div className="message-box">
              <label>Mensaje del cliente:</label>
              <p>"{selectedItem.mensaje}"</p>
            </div>

            <div className="action-buttons-large">
              <button 
                className="btn-reject"
                onClick={() => handleResponse(selectedItem.id, 'rechazada')}
              >
                Rechazar
              </button>
              <button 
                className="btn-accept"
                onClick={() => handleResponse(selectedItem.id, 'aceptada')}
              >
                Aceptar y Chatear
              </button>
            </div>
          </div>
        </div>
      );
    }

    // VISTA DE CHAT (SOLICITUD ACEPTADA)
    return (
      <>
        <div className="chat-header">
          <div className="chat-user-info">
            <div className="user-avatar">
              {selectedItem.nombre_cliente?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3>{selectedItem.nombre_cliente}</h3>
              <p className="service-tag">{selectedItem.titulo_servicio}</p>
            </div>
          </div>
          <div className="chat-header-actions">
            {selectedItem.estado === 'aceptada' && esTrabajador && (
              <button
                className="btn-finish-work"
                onClick={() => handleFinalizarTrabajo(selectedItem.id)}
                title="Marcar trabajo como finalizado"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
                </svg>
              </button>
            )}
            {selectedItem.estado === 'finalizada' && !existeCalificacion && (
              <button
                className="btn-rate-service"
                onClick={() => setShowCalificacionModal(true)}
                title="Calificar servicio"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <polygon points="12 2 15.09 10.26 24 10.35 17.77 16.01 19.85 24.02 12 18.54 4.15 24.02 6.23 16.01 0 10.35 8.91 10.26 12 2"></polygon>
                </svg>
              </button>
            )}
            <button
              className="btn-delete-chat"
              onClick={() => handleDeleteChat(selectedItem.id)}
              title="Eliminar chat"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="system-message">
              <p>Has aceptado la solicitud. ¡Empieza la conversación!</p>
              <small>{new Date(selectedItem.fecha_solicitud).toLocaleDateString()}</small>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id_mensaje} 
                className={`message ${msg.remitente === user.id_usuario ? 'sent' : 'received'}`}
              >
                <p>{msg.texto}</p>
                <span className="time">
                  {new Date(msg.fecha_envio).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))
          )}
          
          {/* Mensaje inicial */}
          <div className="message received">
            <p>{selectedItem.mensaje}</p>
            <span className="time">Mensaje inicial</span>
          </div>
        </div>

        <div className="message-input-area">
          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="message-input"
              disabled={isSending}
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={isSending || !newMessage.trim()}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </>
    );
  };

  return (
    <div className="mensajes-page">
      <Header />
      <div className="mensajes-container">
        <div className="mensajes-layout">
          
          {/* SIDEBAR IZQUIERDA */}
          <div className="chats-sidebar">
            <div className="sidebar-tabs">
              <button 
                className={`tab-btn ${activeTab === 'chats' ? 'active' : ''}`}
                onClick={() => { setActiveTab('chats'); setSelectedItem(null); }}
              >
                Chats ({conversations.length})
              </button>
              {esTrabajador && (
                <button 
                  className={`tab-btn ${activeTab === 'solicitudes' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('solicitudes'); setSelectedItem(null); }}
                >
                  Solicitudes 
                  {requests.length > 0 && <span className="badge-count">{requests.length}</span>}
                </button>
              )}
            </div>

            <div className="chats-list">
              {loading && <p className="loading-text">Cargando...</p>}
              
              {activeTab === 'chats' ? (
                conversations.length === 0 ? (
                  <p className="empty-list">No tienes chats activos.</p>
                ) : (
                  conversations.map(chat => (
                    <div 
                      key={chat.id} 
                      className={`chat-item ${selectedItem?.id === chat.id ? 'selected' : ''} ${chat.estado === 'finalizada' ? 'chat-finalized' : ''}`}
                      onClick={() => setSelectedItem(chat)}
                    >
                      <div className="chat-item-avatar">
                        {chat.nombre_cliente?.charAt(0).toUpperCase()}
                      </div>
                      <div className="chat-item-info">
                        <h4>{chat.nombre_cliente}</h4>
                        <p>{chat.titulo_servicio}</p>
                      </div>
                      {chat.estado === 'finalizada' && (
                        <span className="estado-badge-finalizado">Finalizado</span>
                      )}
                    </div>
                  ))
                )
              ) : (
                /* LISTA DE SOLICITUDES */
                requests.length === 0 ? (
                  <p className="empty-list">No hay solicitudes pendientes.</p>
                ) : (
                  requests.map(req => (
                    <div 
                      key={req.id} 
                      className={`chat-item request-item ${selectedItem?.id === req.id ? 'selected' : ''}`}
                      onClick={() => setSelectedItem(req)}
                    >
                      <div className="status-dot"></div>
                      <div className="chat-item-info">
                        <h4>{req.nombre_cliente}</h4>
                        <p className="request-preview">Solicita: {req.titulo_servicio}</p>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          {/* ÁREA PRINCIPAL DERECHA */}
          <div className="chat-main-area">
            {renderMainContent()}
          </div>

        </div>
      </div>
      
      {/* Modal de Calificación */}
      {showCalificacionModal && selectedItem && (
        <CalificacionModal
          solicitud={selectedItem}
          onClose={() => setShowCalificacionModal(false)}
          onSubmit={handleCalificacionSubmit}
        />
      )}
    </div>
  );
}