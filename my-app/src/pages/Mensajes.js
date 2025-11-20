import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Importamos Auth
import Header from '../components/Header';
import '../styles/Mensajes.css';

export default function Mensajes() {
  const { token, user } = useAuth(); // Necesitamos el token para peticiones
  
  // Estados principales
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' o 'solicitudes'
  const [conversations, setConversations] = useState([]); // Chats activos (Aceptados)
  const [requests, setRequests] = useState([]); // Solicitudes pendientes
  const [selectedItem, setSelectedItem] = useState(null); // El chat o solicitud seleccionado
  
  // Estados de carga y mensajes
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  // Cargar datos al iniciar
  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Consultamos TODAS las solicitudes (tu backend ya filtra las tuyas)
      const response = await fetch('http://localhost:8000/api/solicitudes/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Error cargando datos');
      
      const data = await response.json();
      const lista = data.results || data;

      // CLASIFICACIÓN INTELIGENTE:
      // 1. Pendientes -> Pestaña Solicitudes
      const pendientes = lista.filter(item => item.estado === 'pendiente');
      
      // 2. Aceptadas -> Pestaña Chats
      const aceptadas = lista.filter(item => item.estado === 'aceptada');

      setRequests(pendientes);
      setConversations(aceptadas);

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
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

  // Renderizar el contenido principal (Derecha)
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
        </div>

        <div className="messages-list">
          {/* Aquí irían los mensajes reales del chat backend */}
          <div className="system-message">
            <p>Has aceptado la solicitud. ¡Empieza la conversación!</p>
            <small>{new Date(selectedItem.fecha_solicitud).toLocaleDateString()}</small>
          </div>
          
          <div className="message received">
            <p>{selectedItem.mensaje}</p>
            <span className="time">Mensaje inicial</span>
          </div>
        </div>

        <div className="message-input-area">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="message-input"
          />
          <button className="send-button">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
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
              <button 
                className={`tab-btn ${activeTab === 'solicitudes' ? 'active' : ''}`}
                onClick={() => { setActiveTab('solicitudes'); setSelectedItem(null); }}
              >
                Solicitudes 
                {requests.length > 0 && <span className="badge-count">{requests.length}</span>}
              </button>
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
                      className={`chat-item ${selectedItem?.id === chat.id ? 'selected' : ''}`}
                      onClick={() => setSelectedItem(chat)}
                    >
                      <div className="chat-item-avatar">
                        {chat.nombre_cliente?.charAt(0).toUpperCase()}
                      </div>
                      <div className="chat-item-info">
                        <h4>{chat.nombre_cliente}</h4>
                        <p>{chat.titulo_servicio}</p>
                      </div>
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
    </div>
  );
}