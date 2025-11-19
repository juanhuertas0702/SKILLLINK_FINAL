import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PublicarServicio from './pages/PublicarServicio';
import Mensajes from './pages/Mensajes';
import Perfil from './pages/Perfil';
import MisServicios from './pages/MisServicios';
import Disponibilidad from './pages/Disponibilidad';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/publicar-servicio" element={<PublicarServicio />} />
            <Route path="/mensajes" element={<Mensajes />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/mis-servicios" element={<MisServicios />} />
            <Route path="/disponibilidad" element={<Disponibilidad />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;