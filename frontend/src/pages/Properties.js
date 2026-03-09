import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaLocationDot } from "react-icons/fa6";
import { IoIosResize } from "react-icons/io";
import { IoIosBed } from "react-icons/io";



const Properties = () => {
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    tipus: '',
    tranzakcio: '',
    varos: '',
    min_ar: '',
    max_ar: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const varosParam = searchParams.get('varos');
    if (varosParam) {
      setFilters(prev => ({ ...prev, varos: varosParam }));
    }
  }, [location.search]);

  useEffect(() => {
    fetchProperties();
  }, [pagination.page]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchProperties();
  }, [filters.tipus, filters.tranzakcio, filters.varos, filters.min_ar, filters.max_ar]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (filters.tipus) params.tipus = filters.tipus;
      if (filters.tranzakcio) params.tranzakcio_tipus = filters.tranzakcio;
      if (filters.varos) params.varos = filters.varos;
      if (filters.min_ar) params.min_ar = filters.min_ar;
      if (filters.max_ar) params.max_ar = filters.max_ar;

      console.log('=== FRONTEND FILTER DEBUG ===');
      console.log('Current filters state:', filters);
      console.log('Sending params to API:', params);

      const res = await axios.get('https://api.ingatlan-projekt.com/api/properties', { params });

      console.log('Response data:', res.data.data.length, 'properties');
      console.log('=== END FRONTEND DEBUG ===\n');

      setProperties(res.data.data);
      setPagination(prev => ({
        ...prev,
        total: res.data.pagination.total,
        pages: res.data.pagination.pages
      }));
    } catch (error) {
      console.error('Hiba az ingatlanok betöltésekor:', error);
      toast.error('Hiba az ingatlanok betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('hu-HU').format(price) + ' ' + currency;
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x300?text=Nincs+kép';
    if (url.startsWith('http')) return url;
    return `https://api.ingatlan-projekt.com${url}`;
  };

  return (
    <div className="properties-page">
      {/* Filters - Videó háttérrel */}
      <section className="filters-section" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Videó háttér */}
        <video className="filters-video-bg" autoPlay loop muted playsInline>
          <source src="/videos/haz2.mp4" type="video/mp4" />
        </video>

        {/* Sötét overlay */}
        <div className="filters-video-overlay"></div>

        <div className="container filters-content">
          <h2>Szűrés</h2>
          <div className="filters-grid">
            <div className="filter-group">
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

            <div className="filter-group">
              <label>Tranzakció</label>
              <select name="tranzakcio" value={filters.tranzakcio} onChange={handleFilterChange}>
                <option value="">Eladó és Kiadó</option>
                <option value="elado">Eladó</option>
                <option value="kiado">Kiadó</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Város</label>
              <input
                type="text"
                name="varos"
                placeholder="pl. Budapest"
                value={filters.varos}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label>Min. ár (Ft)</label>
              <input
                type="number"
                name="min_ar"
                placeholder="0"
                value={filters.min_ar}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label>Max. ár (Ft)</label>
              <input
                type="number"
                name="max_ar"
                placeholder="999999999"
                value={filters.max_ar}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>

        {/* Hullám alul */}
        <div style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          width: '100%',
          zIndex: 3,
          lineHeight: 0
        }}>
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 60 }}>
            <path d="M0,0 Q300,60 600,30 T1200,0 L1200,60 L0,60 Z" fill="#f8f7f4" />
          </svg>
        </div>

      </section>

      {/* Results */}
      <section className="results-section">
        <div className="container">
          <div className="results-header">
            <h2>Találatok</h2>
            <p>{pagination.total} ingatlan</p>
          </div>

          {loading ? (
            <div className="loading">
              <p>Betöltés...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="no-results">
              <p>Nincs találat a megadott szűrési feltételekkel.</p>
            </div>
          ) : (
            <>
              <div className="property-grid">
                {properties.map(property => (
                  <div key={property.id} className="property-card">
                    <div className="property-image-wrapper">
                      <img
                        src={getImageUrl(property.fo_kep)}
                        alt={property.cim}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=Nincs+kép';
                        }}
                      />
                      <div className={`property-badge ${property.lefoglalva ? 'badge-reserved' : ''}`}>
                        {property.lefoglalva ? 'FOGLALT' : (property.tranzakcio_tipus === 'elado' ? 'Eladó' : 'Kiadó')}
                      </div>
                    </div>
                    <div className="property-info">
                      <h3>{property.cim}</h3>
                      <p className="location"><FaLocationDot /> {property.varos}{property.kerulet ? `, ${property.kerulet}` : ''}</p>
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

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="pagination-btn"
                  >
                    ← Előző
                  </button>
                  <div className="pagination-info">
                    {pagination.page} / {pagination.pages}
                  </div>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="pagination-btn"
                  >
                    Következő →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Properties;