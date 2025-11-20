import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import ServiceCard from '../components/ServiceCard';
import FilterModal from '../components/FilterModal';
// ✅ IMPORTAR EL NUEVO MODAL
import SolicitarModal from '../components/SolicitarModal'; 
import '../styles/global.css';

import plomeroImg from '../assets/images/plomero.png';
import carpinteroImg from '../assets/images/carpintero.png';
import meseroImg from '../assets/images/mesero.png';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // Estados
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // ✅ NUEVOS ESTADOS PARA EL MODAL DE SOLICITUD
  const [showSolicitarModal, setShowSolicitarModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    showAvailable: true,
    showOccupied: true,
    minRating: 0
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/servicios/publicos/');
        if (!response.ok) throw new Error('Error al cargar servicios');
        const data = await response.json();
        const listaServicios = data.results ? data.results : data;
        const imagenes = [plomeroImg, carpinteroImg, meseroImg];
        
        const formattedServices = listaServicios.map((item, index) => ({
          id: item.id_servicio,
          title: item.titulo,
          description: item.descripcion,
          price: item.precio,
          rating: item.trabajador_calificacion || 5.0, 
          image: item.foto_servicio || imagenes[index % 3], 
          available: true,
          category: item.categoria,
          workerName: item.trabajador_nombre,
          ownerId: item.owner_id 
        }));

        setServices(formattedServices);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const isAvailable = service.available === true;
    const matchesAvailability = 
      (filters.showAvailable && isAvailable) ||
      (filters.showOccupied && !isAvailable);
    const matchesRating = service.rating >= filters.minRating;
    return matchesSearch && matchesAvailability && matchesRating;
  });

  const handleFilterClick = () => setShowFilterModal(true);
  const handleCloseFilterModal = () => setShowFilterModal(false);
  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const handleApplyFilters = () => setShowFilterModal(false);

  // ✅ LÓGICA DEL BOTÓN CONTACTAR
  const handleContactClick = (service) => {
    if (!isAuthenticated) {
      alert("🔒 Para contactar a un profesional, por favor inicia sesión.");
      navigate('/login');
      return;
    }

    // Validación: No contactarse a sí mismo
    // Ajustamos para leer el ID correctamente según como venga del backend/token
    const myId = user?.user_id || user?.id_usuario || user?.id;
    
    if (myId && service.ownerId && String(myId) === String(service.ownerId)) {
      alert("⚠️ No puedes contactarte a ti mismo. ¡Es tu propio servicio!");
      return;
    }

    // ✅ ABRIR EL MODAL
    setSelectedService(service);
    setShowSolicitarModal(true);
  };

  return (
    <div className="App">
      <Header />
      
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={handleFilterClick}
      />

      <div className="services-grid">
        {loading ? (
          <div className="loading"><p>Cargando servicios disponibles...</p></div>
        ) : filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onContactClick={() => handleContactClick(service)}
            />
          ))
        ) : (
          <div className="no-results">
             {services.length === 0 && searchQuery === '' ? (
              <div className="empty-state">
                <p className="no-results-text">¡Aún no hay servicios publicados!</p>
              </div>
            ) : (
              <p className="no-results-text">No se encontraron servicios para "{searchQuery}"</p>
            )}
          </div>
        )}
      </div>

      <FilterModal
        isOpen={showFilterModal}
        onClose={handleCloseFilterModal}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
      />

      {/* ✅ AQUÍ ESTABA LO QUE FALTABA: Renderizar el Modal de Solicitud */}
      <SolicitarModal 
        isOpen={showSolicitarModal}
        onClose={() => setShowSolicitarModal(false)}
        servicio={selectedService}
      />
    </div>
  );
}