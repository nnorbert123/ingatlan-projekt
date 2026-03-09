import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px'
};

const defaultCenter = {
  lat: 47.4979,  // Budapest
  lng: 19.0402
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
  mapTypeControlOptions: {
    style: window.google?.maps?.MapTypeControlStyle?.HORIZONTAL_BAR,
    position: window.google?.maps?.ControlPosition?.TOP_RIGHT,
  }
};

function PropertyMap({ properties = [], center, zoom = 12, onMarkerClick, showInfoWindows = true }) {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [map, setMap] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'marker']
  });

  const mapCenter = center || defaultCenter;

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Térkép viewport beállítása az összes ingatlanhoz
  useEffect(() => {
    if (map && properties.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      let validPropertiesCount = 0;
      
      properties.forEach(property => {
        if (property.latitude && property.longitude) {
          bounds.extend({
            lat: parseFloat(property.latitude),
            lng: parseFloat(property.longitude)
          });
          validPropertiesCount++;
        }
      });
      
      if (validPropertiesCount > 0) {
        map.fitBounds(bounds);
        
        // Ha csak egy ingatlan van, zoom-oljunk rá közelebb
        if (validPropertiesCount === 1) {
          const listener = window.google.maps.event.addListener(map, 'idle', () => {
            if (map.getZoom() > 16) map.setZoom(16);
            window.google.maps.event.removeListener(listener);
          });
        }
      }
    }
  }, [map, properties]);

  const handleMarkerClick = (property) => {
    setSelectedProperty(property);
    if (onMarkerClick) {
      onMarkerClick(property);
    }
  };

  const handleInfoWindowClose = () => {
    setSelectedProperty(null);
  };

  const handlePropertyClick = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  if (loadError) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-triangle me-2"></i>
        Hiba a térkép betöltésekor. Kérjük, frissítse az oldalt.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Térkép betöltése...</span>
        </div>
      </div>
    );
  }

  // Egyedi marker icon különböző ingatlan típusokhoz (SVG alapú)
  const getMarkerIcon = (propertyType, status) => {
    let color = '#007bff'; // kék alapértelmezett
    
    if (status === 'sold' || status === 'inaktiv') {
      color = '#6c757d'; // szürke eladott/inaktív
    } else if (status === 'reserved' || status === 'foglalt') {
      color = '#ffc107'; // sárga foglalt
    } else {
      switch (propertyType) {
        case 'apartment':
        case 'lakas':
          color = '#007bff'; // kék
          break;
        case 'house':
        case 'haz':
          color = '#28a745'; // zöld
          break;
        case 'office':
        case 'iroda':
          color = '#17a2b8'; // cyan
          break;
        case 'land':
        case 'telek':
          color = '#fd7e14'; // narancs
          break;
        case 'garage':
        case 'garazs':
          color = '#6f42c1'; // lila
          break;
        default:
          color = '#007bff';
      }
    }

    // SVG marker ikon készítése
    const svg = `
      <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C9 0 0 9 0 20c0 15 20 30 20 30s20-15 20-30C40 9 31 0 20 0z" 
              fill="${color}" stroke="#fff" stroke-width="2"/>
        <circle cx="20" cy="20" r="8" fill="#fff"/>
      </svg>
    `;

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(40, 50),
      anchor: new window.google.maps.Point(20, 50)
    };
  };

  // Típus név magyar fordítása
  const getPropertyTypeName = (type) => {
    const types = {
      'apartment': 'Lakás',
      'house': 'Ház',
      'office': 'Iroda',
      'land': 'Telek',
      'garage': 'Garázs'
    };
    return types[type] || type;
  };

  // Ár formázása
  const formatPrice = (price) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {properties.map((property) => {
          if (!property.latitude || !property.longitude) return null;

          return (
            <Marker
              key={property.id}
              position={{
                lat: parseFloat(property.latitude),
                lng: parseFloat(property.longitude)
              }}
              icon={getMarkerIcon(property.property_type || property.tipus, property.status || property.statusz)}
              onClick={() => handleMarkerClick(property)}
              title={property.title || property.cim}
            />
          );
        })}

        {showInfoWindows && selectedProperty && (
          <InfoWindow
            position={{
              lat: parseFloat(selectedProperty.latitude),
              lng: parseFloat(selectedProperty.longitude)
            }}
            onCloseClick={handleInfoWindowClose}
          >
            <div style={{ maxWidth: '250px' }}>
              {selectedProperty.images && selectedProperty.images.length > 0 && (
                <img
                  src={`https://api.ingatlan-projekt.com${selectedProperty.images[0].image_url}`}
                  alt={selectedProperty.title || selectedProperty.cim}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }}
                />
              )}
              <h6 className="mb-2">{selectedProperty.title || selectedProperty.cim}</h6>
              <p className="mb-1 text-muted small">
                <i className="fas fa-map-marker-alt me-1"></i>
                {selectedProperty.city || selectedProperty.varos}
              </p>
              <p className="mb-1 small">
                <span className="badge bg-primary me-1">
                  {getPropertyTypeName(selectedProperty.property_type || selectedProperty.tipus)}
                </span>
                {(selectedProperty.area || selectedProperty.alapterulet) && (
                  <span className="text-muted">{selectedProperty.area || selectedProperty.alapterulet} m²</span>
                )}
              </p>
              <p className="mb-2 fw-bold text-primary">
                {formatPrice(selectedProperty.price || selectedProperty.ar)}
              </p>
              <button
                className="btn btn-sm btn-primary w-100"
                onClick={() => handlePropertyClick(selectedProperty.id)}
              >
                <i className="fas fa-eye me-1"></i>
                Részletek
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Térkép jelmagyarázat */}
      {properties.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '10px',
          background: 'white',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          fontSize: '12px',
          zIndex: 1000
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Jelmagyarázat:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#007bff' }}></div>
              <span>Lakás</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28a745' }}></div>
              <span>Ház</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#17a2b8' }}></div>
              <span>Iroda</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fd7e14' }}></div>
              <span>Telek</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#6c757d' }}></div>
              <span>Inaktív</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyMap;
