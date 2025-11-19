import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { chatAPI } from '../config/api';
import '../styles/Mensajes.css';

export default function Mensajes() {
  const location = useLocation();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar chats existentes del localStorage
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      try {
        setChats(JSON.parse(savedChats));
      } catch (error) {
        console.error('Error cargando chats:', error);
      }
    }
    setLoading(false);

    // Si viene de contactar a alguien, crear nuevo chat
    if (location.state?.service) {
      const newChat = {
        id: Date.now(),
        user: location.state.service.usuario?.nombre || 'Usuario',
        serviceId: location.state.service.id,
        serviceName: location.state.service.title,
        lastMessage: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      // Agregar chat si no existe
      setChats(prevChats => {
        const chatExists = prevChats.some(chat => chat.serviceId === newChat.serviceId);
        if (!chatExists) {
          const updatedChats = [...prevChats, newChat];
          localStorage.setItem('chats', JSON.stringify(updatedChats));
          return updatedChats;
        }
        return prevChats;
      });
      
      // Seleccionar el chat automáticamente
      setSelectedChat(newChat);
      setMessages([]);
    }
  }, [location.state]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    // Cargar mensajes del chat
    const demoMessages = [
      { id: 1, sender: 'Juan Pérez', text: 'Hola, necesito ayuda con plomería', timestamp: '10:30' },
      { id: 2, sender: 'Tú', text: 'Claro, ¿cuál es el problema?', timestamp: '10:32' },
      { id: 3, sender: 'Juan Pérez', text: '¿Disponible mañana?', timestamp: '10:35' }
    ];
    setMessages(demoMessages);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const message = {
        id: messages.length + 1,
        sender: 'Tú',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, message]);
      
      // Actualizar el chat con el último mensaje
      setChats(prevChats => {
        const updatedChats = prevChats.map(chat =>
          chat.id === selectedChat.id
            ? { ...chat, lastMessage: newMessage, timestamp: message.timestamp }
            : chat
        );
        localStorage.setItem('chats', JSON.stringify(updatedChats));
        return updatedChats;
      });
      
      // Actualizar el chat seleccionado
      setSelectedChat(prev => ({
        ...prev,
        lastMessage: newMessage,
        timestamp: message.timestamp
      }));
      
      setNewMessage('');
    }
  };

  const handleDeleteChat = (chatId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este chat?')) {
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      setChats(updatedChats);
      localStorage.setItem('chats', JSON.stringify(updatedChats));
      
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
    }
  };

  return (
    <div>
      <Header />
      <div className="mensajes-container">
        <div className="mensajes-layout">
          {/* Lista de chats */}
          <div className="chats-list">
            <h2 className="chats-title">Mensajes</h2>
            {loading ? (
              <div className="loading">Cargando chats...</div>
            ) : chats.length === 0 ? (
              <div className="no-chats">
                <p>No hay mensajes aún</p>
                <p className="subtitle">Los clientes podrán contactarte aquí</p>
              </div>
            ) : (
              chats.map(chat => (
                <div
                  key={chat.id}
                  className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                >
                  <div 
                    className="chat-content"
                    onClick={() => handleSelectChat(chat)}
                  >
                    <div className="chat-info">
                      <h3 className="chat-name">{chat.user}</h3>
                      <p className="chat-preview">{chat.lastMessage}</p>
                    </div>
                    <span className="chat-time">{chat.timestamp}</span>
                  </div>
                  <button 
                    className="delete-chat-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat.id);
                    }}
                    title="Eliminar chat"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Área de mensajes */}
          <div className="messages-area">
            {selectedChat ? (
              <>
                <div className="messages-header">
                  <h2>{selectedChat.user}</h2>
                </div>

                <div className="messages-list">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`message ${msg.sender === 'Tú' ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <p className="message-text">{msg.text}</p>
                        <span className="message-time">{msg.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="message-input-area">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe tu mensaje..."
                    className="message-input"
                  />
                  <button onClick={handleSendMessage} className="send-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <div className="no-chat-selected">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p>Selecciona un chat para comenzar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
