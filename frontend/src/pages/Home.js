import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropertyCard from '../components/PropertyCard';
import PropertyCardSkeleton from '../components/PropertyCardSkeleton';

const Home = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mind');

  // Szűrő state
  const [filters, setFilters] = useState({
    tipus: '',
    tranzakcio: '',
    varos: '',
    min_ar: '',
    max_ar: ''
  });

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async (overrideFilters) => {
    const f = overrideFilters || filters;
    try {
      const params = { limit: 12 };
      if (f.tipus) params.tipus = f.tipus;
      if (f.tranzakcio) params.tranzakcio_tipus = f.tranzakcio;
      if (f.varos) params.varos = f.varos;
      if (f.min_ar) params.min_ar = f.min_ar;
      if (f.max_ar) params.max_ar = f.max_ar;

      const res = await axios.get('https://api.ingatlan-projekt.com/api/properties', { params });
      setProperties(res.data.data);
    } catch (error) {
      console.error('Hiba az ingatlanok betöltésekor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Keresés gomb
  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchFeaturedProperties();
  };

  // Gyors tab: Eladó / Kiadó / Mind
  const handleTab = (tab) => {
    setActiveTab(tab);
    const newFilters = { ...filters, tranzakcio: tab === 'mind' ? '' : tab };
    setFilters(newFilters);
    setLoading(true);
    fetchFeaturedProperties(newFilters);
  };

  // Szűrők törlése
  const handleReset = () => {
    const empty = { tipus: '', tranzakcio: '', varos: '', min_ar: '', max_ar: '' };
    setFilters(empty);
    setActiveTab('mind');
    setLoading(true);
    fetchFeaturedProperties(empty);
  };

  const hasActiveFilters = filters.tipus || filters.tranzakcio || filters.varos || filters.min_ar || filters.max_ar;

  return (
    <div className="home">

      {/* ── HERO – Videó háttérrel + Szűrő box ── */}
      <section className="home-filters-section">

        {/* Videó háttér */}
        <video className="filters-video-bg" autoPlay loop muted playsInline>
          <source src="/videos/haz2.mp4" type="video/mp4" />
        </video>

        {/* Sötét overlay */}
        <div className="filters-video-overlay"></div>

        <div className="container filters-content">

          {/* Hero szöveg */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2.5rem'
          }}>
            <p style={{
              fontSize: '0.72rem',
              letterSpacing: '5px',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              fontWeight: 600,
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              <span style={{ display: 'inline-block', width: 26, height: 2, background: 'var(--gold)', borderRadius: 2 }}></span>
              Prémium ingatlanközvetítés
              <span style={{ display: 'inline-block', width: 26, height: 2, background: 'var(--gold)', borderRadius: 2 }}></span>
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.1,
              marginBottom: '16px'
            }}>
              Ingatlanok <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Eladó</em> és
              <span style={{ color: '#fff' }}> Kiadó</span>
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '1rem',
              fontWeight: 300,
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: 1.75
            }}>
              Találja meg álmai otthonát könnyedén kínálatunkban,<br />
              legyen szó kiadásról vagy vásárlásról.
            </p>
          </div>

          {/* Szűrő doboz – fehér kártya csak az inputoknak */}
          <div className="home-filters" style={{ marginBottom: 0, paddingBottom: '2rem' }}>
            <div className="filters-grid" style={{ marginBottom: 0 }}>
              <div className="filter-group">
                <label>Típus</label>
                <select name="tipus" value={filters.tipus} onChange={handleFilterChange}>
                  <option value="">Minden típus</option>
                  <option value="lakas">Lakás</option>
                  <option value="haz">Ház</option>
                  <option value="telek">Telek</option>
                  <option value="iroda">Iroda</option>
                  <option value="garazs">Garázs</option>
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

          {/* Keresés gomb – a fehér boxon kívül */}
          <button onClick={handleSearch} className="home-search-btn">
            <i className="fas fa-search"></i>
            Keresés indítása
          </button>

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

      {/* ── TALÁLATOK SZEKCIÓ ── */}
      <section className="featured-properties">
        <div className="container">

          {/* Fejléc sor: cím + gyors tab gombok + találatszám */}
          <div className="results-header" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>
                {hasActiveFilters
                  ? `Találatok (${properties.length} db)`
                  : 'Kiemelt ingatlanok'
                }
              </h2>
              {!loading && (
                <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: '0.85rem' }}>
                  {properties.length} ingatlan találat
                </p>
              )}
            </div>

            {/* Rendezés / tab gombok */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {[
                { key: 'mind', label: '⊞ Összes' },
                { key: 'elado', label: 'Eladó' },
                { key: 'kiado', label: 'Kiadó' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleTab(tab.key)}
                  style={{
                    padding: '0.38rem 1rem',
                    borderRadius: '20px',
                    border: `1.5px solid ${activeTab === tab.key ? 'var(--dark)' : '#e5e0d8'}`,
                    background: activeTab === tab.key ? 'var(--dark)' : '#fff',
                    color: activeTab === tab.key ? 'var(--gold)' : '#6b7280',
                    fontFamily: 'inherit',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
              {hasActiveFilters && (
                <button
                  onClick={handleReset}
                  className="btn-reset"
                  style={{ fontSize: '0.8rem', padding: '0.38rem 1rem' }}
                >
                  ✕ Szűrők törlése
                </button>
              )}
            </div>
          </div>

          {/* Kártyák */}
          {loading ? (
            <div className="property-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="no-results">
              <p>Nincs találat a megadott szűrési feltételekkel.</p>
              <button onClick={handleReset} className="btn-reset">
                Szűrők törlése
              </button>
            </div>
          ) : (
            <div className="property-grid">
              {properties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

        </div>
      </section>

    </div>
  );
};

export default Home;