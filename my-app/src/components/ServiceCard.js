import React from 'react';
import '../styles/ServiceCard.css';

export default function ServiceCard({ service, onContactClick }) {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="star star-filled" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      );
    }
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="star star-filled" style={{opacity: 0.5}} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      );
    }
    while (stars.length < 5) {
      stars.push(
        <svg key={`empty-${stars.length}`} className="star star-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      );
    }
    return stars;
  };

  return (
    <div className="service-card">
      <div className="service-image">
        <img src={service.image} alt={service.title} className="service-image-img" />
      </div>
      
      <div className="service-info">
        <div className="service-header">
          <div>
            <h3 className="service-title">{service.title}</h3>
            <p className="service-category">{service.category}</p>
            {service.usuario && (
              <p className="service-provider">Por: {service.usuario.nombre || service.usuario}</p>
            )}
          </div>
          <span className={`service-status ${service.available ? 'status-available' : 'status-occupied'}`}>
            {service.available ? 'Disponible' : 'Ocupado'}
          </span>
        </div>

        <div className="service-rating">
          <span className="rating-label">Calificación:</span>
          <div className="rating-stars">
            {renderStars(service.rating)}
          </div>
          <span className="rating-value">{service.rating.toFixed(1)}/5</span>
        </div>

        <button onClick={onContactClick} className="contact-button" disabled={!service.available}>
          {service.available ? 'CONTACTAR' : 'NO DISPONIBLE'}
        </button>
      </div>
    </div>
  );
}