import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { FaLocationDot } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { IoIosResize } from "react-icons/io";
import { IoBedSharp } from "react-icons/io5";

const Favorites = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toast.warning('Jelentkezz be a kedvencek megtekintéséhez!');
      navigate('/bejelentkezes');
      return;
    }
    fetchFavorites();
  }, [user, authLoading, navigate]);

  const fetchFavorites = async () => {
    try {
      const res = await axios.get('https://api.ingatlan-projekt.com/api/favorites');
      setFavorites(res.data.data);
    } catch (error) {
      console.error('Kedvencek betöltési hiba:', error);
      toast.error('Hiba a kedvencek betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (propertyId) => {
    try {
      await axios.delete(`https://api.ingatlan-projekt.com/api/favorites/${propertyId}`);
      setFavorites(favorites.filter(fav => fav.id !== propertyId));
      toast.success('Eltávolítva a kedvencekből');
    } catch (error) {
      toast.error('Hiba történt');
    }
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('hu-HU').format(price) + ' ' + currency;
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x300?text=Nincs+kép';
    if (url.startsWith('http')) return url;
    return `https://api.ingatlan-projekt.com${url}`;
  };

  if (authLoading || loading) {
    return <div className="container loading"><p>Betöltés...</p></div>;
  }

  return (
    <div className="favorites-page">
      <div className="container">
        <h1>Kedvenc Ingatlanjaim</h1>
        <p className="page-subtitle">Mentett ingatlanok ({favorites.length} db)</p>

        {favorites.length === 0 ? (
          <div className="no-favorites">
            <h2>Még nincs mentett ingatlanod</h2>
            <p>Böngéssz az ingatlanok között és add hozzá kedvenceidhez azokat, amelyek érdekelnek!</p>
            <Link to="/ingatlanok" className="btn-primary">Ingatlanok böngészése</Link>
          </div>
        ) : (
          <div className="property-grid">
            {favorites.map(property => (
              <div key={property.id} className="property-card">
                <div className="property-image-wrapper">
                  <img 
                    src={getImageUrl(property.fo_kep)} 
                    alt={property.cim}
                    onError={(e) => {
                      console.error('Favorites image error:', e.target.src);
                      e.target.src = 'https://via.placeholder.com/400x300?text=Nincs+kép';
                    }}
                  />
                  <button 
                    onClick={() => removeFavorite(property.id)}
                    className="remove-favorite-btn"
                    title="Eltávolítás a kedvencekből"
                  >
                    <IoMdClose />
                  </button>
                </div>
                <div className="property-info">
                  <h3>{property.cim}</h3>
                  <p className="location"><FaLocationDot /> {property.varos}{property.kerulet ? `, ${property.kerulet}` : ''}</p>
                  <div className="property-details">
                    <span><IoIosResize /> {property.alapterulet} m²</span>
                    {property.szobak_szama && <span><IoBedSharp /> {property.szobak_szama} szoba</span>}
                  </div>
                  <p className="price">{formatPrice(property.ar, property.penznem)}</p>
                  <Link to={`/ingatlan/${property.id}`} className="btn-secondary">
                    Részletek
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
