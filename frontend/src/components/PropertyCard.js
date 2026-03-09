import React from 'react';
import { Link } from 'react-router-dom';
import { FaLocationDot } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { FaBed } from "react-icons/fa6";
import { IoIosResize } from "react-icons/io";


const PropertyCard = ({ property, onRemove, showRemoveButton = false }) => {
  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('hu-HU').format(price) + ' ' + currency;
  };

  // Handle both relative and absolute image URLs
  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x300?text=Nincs+kép';
    if (url.startsWith('http')) return url;
    return `https://api.ingatlan-projekt.com${url}`;
  };

  return (
    <div className="property-card">
      <div className="property-image-wrapper">
        <img 
          src={getImageUrl(property.fo_kep)} 
          alt={property.cim}
          onError={(e) => {
            console.error('Image load error:', e.target.src);
            e.target.src = 'https://via.placeholder.com/400x300?text=Nincs+kép';
          }}
        />
        
        {/* FOGLALT ha lefoglalva, különben Eladó/Kiadó */}
        <div className={`property-badge ${property.lefoglalva ? 'badge-reserved' : ''}`}>
          {property.lefoglalva ? 'FOGLALT' : (property.tranzakcio_tipus === 'elado' ? 'Eladó' : 'Kiadó')}
        </div>
        
        {showRemoveButton && onRemove && (
          <button 
            onClick={() => onRemove(property.id)}
            className="remove-favorite-btn"
            title="Eltávolítás a kedvencekből"
          >
            <IoMdClose />
          </button>
        )}
      </div>
      <div className="property-info">
        <h3>{property.cim}</h3>
        <p className="location">
          <FaLocationDot /> {property.varos}{property.kerulet ? `, ${property.kerulet}` : ''}
        </p>
        <div className="property-details">
          <span><IoIosResize /> {property.alapterulet} m²</span>
          {property.szobak_szama && <span><FaBed /> {property.szobak_szama} szoba</span>}
        </div>
        <p className="price">{formatPrice(property.ar, property.penznem)}</p>
        <Link to={`/ingatlan/${property.id}`} className="btn-secondary">
          Részletek
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;