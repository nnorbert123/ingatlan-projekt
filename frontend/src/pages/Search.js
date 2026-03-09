import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IoIosResize } from "react-icons/io";
import { IoIosBed } from "react-icons/io";
import { FaLocationDot } from "react-icons/fa6";


const Search = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    q: '',
    tipus: '',
    tranzakcio: '',
    varos: '',
    min_ar: '',
    max_ar: '',
    min_alapterulet: '',
    max_alapterulet: '',
    min_szobak: '',
    allapot: ''
  });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const res = await axios.get('https://api.ingatlan-projekt.com/api/search', { params });
      setProperties(res.data.data);
      
      if (res.data.data.length === 0) {
        toast.info('Nincs találat a keresési feltételekkel');
      }
    } catch (error) {
      console.error('Keresési hiba:', error);
      toast.error('Hiba a keresés során');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      q: '',
      tipus: '',
      tranzakcio: '',
      varos: '',
      min_ar: '',
      max_ar: '',
      min_alapterulet: '',
      max_alapterulet: '',
      min_szobak: '',
      allapot: ''
    });
    setProperties([]);
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('hu-HU').format(price) + ' ' + currency;
  };

  // Kép URL prefix hozzáadása
  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x300?text=Nincs+kép';
    if (url.startsWith('http')) return url;
    return `https://api.ingatlan-projekt.com${url}`;
  };

  return (
    <div className="search-page">
      <div className="container">
        <h1>Részletes Keresés</h1>
        <p className="page-subtitle">Találd meg az ideális ingatlant részletes szűrőkkel</p>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-grid">
            {/* Szöveges keresés */}
            <div className="form-group full-width">
              <label>Kulcsszó keresés</label>
              <input
                type="text"
                name="q"
                placeholder="pl. modern lakás Budapest"
                value={filters.q}
                onChange={handleFilterChange}
              />
            </div>

            {/* Típus */}
            <div className="form-group">
              <label>Típus</label>
              <select name="tipus" value={filters.tipus} onChange={handleFilterChange}>
                <option value="">Minden típus</option>
                <option value="lakas">Lakás</option>
                <option value="haz">Ház</option>
                <option value="telek">Telek</option>
                <option value="iroda">Iroda</option>
                <option value="garázs">Garázs</option>
              </select>
            </div>

            {/* Tranzakció */}
            <div className="form-group">
              <label>Tranzakció</label>
              <select name="tranzakcio" value={filters.tranzakcio} onChange={handleFilterChange}>
                <option value="">Eladó és Kiadó</option>
                <option value="elado">Eladó</option>
                <option value="kiado">Kiadó</option>
              </select>
            </div>

            {/* Város */}
            <div className="form-group">
              <label>Város</label>
              <input
                type="text"
                name="varos"
                placeholder="Budapest"
                value={filters.varos}
                onChange={handleFilterChange}
              />
            </div>

            {/* Állapot */}
            <div className="form-group">
              <label>Állapot</label>
              <select name="allapot" value={filters.allapot} onChange={handleFilterChange}>
                <option value="">Bármilyen</option>
                <option value="uj">Új</option>
                <option value="felujitott">Felújított</option>
                <option value="felujitando">Felújítandó</option>
                <option value="bontas">Bontás</option>
              </select>
            </div>

            {/* Ár min */}
            <div className="form-group">
              <label>Min. ár (Ft)</label>
              <input
                type="number"
                name="min_ar"
                placeholder="0"
                value={filters.min_ar}
                onChange={handleFilterChange}
              />
            </div>

            {/* Ár max */}
            <div className="form-group">
              <label>Max. ár (Ft)</label>
              <input
                type="number"
                name="max_ar"
                placeholder="999999999"
                value={filters.max_ar}
                onChange={handleFilterChange}
              />
            </div>

            {/* Alapterület min */}
            <div className="form-group">
              <label>Min. alapterület (m²)</label>
              <input
                type="number"
                name="min_alapterulet"
                placeholder="0"
                value={filters.min_alapterulet}
                onChange={handleFilterChange}
              />
            </div>

            {/* Alapterület max */}
            <div className="form-group">
              <label>Max. alapterület (m²)</label>
              <input
                type="number"
                name="max_alapterulet"
                placeholder="1000"
                value={filters.max_alapterulet}
                onChange={handleFilterChange}
              />
            </div>

            {/* Szobák száma */}
            <div className="form-group">
              <label>Min. szobák száma</label>
              <select name="min_szobak" value={filters.min_szobak} onChange={handleFilterChange}>
                <option value="">Bármennyi</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
          </div>

          <div className="search-actions">
            <button type="submit" className="btn-search" disabled={loading}>
              {loading ? 'Keresés...' : 'Keresés'}
            </button>
            <button type="button" onClick={handleReset} className="btn-reset">
              Alaphelyzet
            </button>
          </div>
        </form>

        {/* Results */}
        {properties.length > 0 && (
          <div className="search-results">
            <h2>Találatok ({properties.length} db)</h2>
            <div className="property-grid">
              {properties.map(property => (
                <div key={property.id} className="property-card">
                  <div className="property-image-wrapper">
                    <img 
                      src={getImageUrl(property.fo_kep)} 
                      alt={property.cim}
                      onError={(e) => {
                        console.error('Search image error:', e.target.src);
                        e.target.src = 'https://via.placeholder.com/400x300?text=Nincs+kép';
                      }}
                    />
                    <div className="property-badge">
                      {property.tranzakcio_tipus === 'elado' ? 'Eladó' : 'Kiadó'}
                    </div>
                  </div>
                  <div className="property-info">
                    <h3>{property.cim}</h3>
                    <p className="location"><FaLocationDot /> {property.varos}</p>
                    <div className="property-details">
                      <span><IoIosResize /> {property.alapterulet} m²</span>
                      {property.szobak_szama && <span><IoIosBed /> {property.szobak_szama} szoba</span>}
                    </div>
                    <p className="price">{formatPrice(property.ar, property.penznem)}</p>
                    <Link to={`/ingatlan/${property.id}`} className="btn-secondary">
                      Részletek
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && properties.length === 0 && (
          <div className="no-results">
            <p>Használd a fenti szűrőket a kereséshez</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;