import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import ServiceCard from '../components/ServiceCard';
import FilterModal from '../components/FilterModal';
import '../styles/global.css';
import { serviciosAPI } from '../config/api';

// Importa las imágenes de servicios
import plomeroImg from '../assets/images/plomero.png';
import carpinteroImg from '../assets/images/carpintero.png';
import meseroImg from '../assets/images/mesero.png';
// Agrega más importaciones según tus imágenes

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  
  // Estado de los filtros
  const [filters, setFilters] = useState({
    showAvailable: true,
    showOccupied: true,
    minRating: 0
  });

  // Datos de servicios locales (fallback)
  const defaultServices = [
    {
      id: 1,
      title: 'Arreglo de lavadoras',
      category: 'Plomero',
      rating: 4.5,
      available: true,
      image: plomeroImg,
      usuario: { nombre: 'Carlos Martínez', email: 'carlos@example.com' }
    },
    {
      id: 2,
      title: 'Reparación de muebles',
      category: 'Carpintero',
      rating: 4.8,
      available: false,
      image: carpinteroImg,
      usuario: { nombre: 'Juan Rodríguez', email: 'juan@example.com' }
    },
    {
      id: 3,
      title: 'Servicio de mesero',
      category: 'Mesero',
      rating: 4.3,
      available: true,
      image: meseroImg,
      usuario: { nombre: 'María López', email: 'maria@example.com' }
    },
    {
      id: 4,
      title: 'Instalación de tuberías',
      category: 'Plomero',
      rating: 4.7,
      available: true,
      image: plomeroImg,
      usuario: { nombre: 'Pedro González', email: 'pedro@example.com' }
    },
    {
      id: 5,
      title: 'Construcción de closets',
      category: 'Carpintero',
      rating: 4.9,
      available: true,
      image: carpinteroImg,
      usuario: { nombre: 'Luis Hernández', email: 'luis@example.com' }
    },
    {
      id: 6,
      title: 'Servicio de eventos',
      category: 'Mesero',
      rating: 4.6,
      available: false,
      image: meseroImg,
      usuario: { nombre: 'Ana García', email: 'ana@example.com' }
    }
  ];

  // Cargar servicios del backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        console.log('🔄 Iniciando carga de servicios públicos...');
        
        // Usar endpoint de servicios públicos (sin autenticación)
        const data = await serviciosAPI.listarPublicos();
        console.log('✅ Servicios públicos recibidos del backend:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        } else {
          console.log('ℹ️ Backend vacío, usando datos locales');
          setServices(defaultServices);
        }
      } catch (err) {
        console.error('❌ Error cargando servicios del backend:', err.message);
        console.log('ℹ️ Usando datos locales como fallback');
        // Usar datos locales como fallback
        setServices(defaultServices);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleContactClick = (service) => {
    if (!isAuthenticated) {
      alert('Por favor inicia sesión para contactar con este servicio');
      navigate('/login');
    } else {
      setSelectedService(service);
      // Navegar a mensajes y pasar el servicio como estado
      navigate('/mensajes', { state: { service } });
    }
  };

  const handleAuthClick = () => {
    navigate('/login');
  };

  const handleFilterClick = () => {
    setShowFilterModal(true);
  };

  const handleCloseFilterModal = () => {
    setShowFilterModal(false);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleApplyFilters = () => {
    setShowFilterModal(false);
  };

  const handleClearFilters = () => {
    setFilters({
      showAvailable: true,
      showOccupied: true,
      minRating: 0
    });
  };

  // Función para filtrar servicios según la búsqueda y filtros
  const filteredServices = services.filter((service) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      service.title.toLowerCase().includes(searchLower) ||
      service.category.toLowerCase().includes(searchLower);
    
    // Filtro de disponibilidad
    const matchesAvailability = 
      (filters.showAvailable && service.available) ||
      (filters.showOccupied && !service.available);
    
    // Filtro de calificación
    const matchesRating = service.rating >= filters.minRating;
    
    return matchesSearch && matchesAvailability && matchesRating;
  });

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
          <div className="loading">
            <p>Cargando servicios...</p>
          </div>
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
            <p className="no-results-text">
              No se encontraron servicios que coincidan con "{searchQuery}"
            </p>
            <button 
              className="clear-search-button"
              onClick={() => setSearchQuery('')}
            >
              Limpiar búsqueda
            </button>
          </div>
        )}
      </div>

      <FilterModal
        isOpen={showFilterModal}
        onClose={handleCloseFilterModal}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}