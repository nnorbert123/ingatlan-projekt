import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import MessageModal from '../components/MessageModal';
import PropertyMap from '../components/PropertyMap';
import { FaEye } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import { RiUpload2Fill } from "react-icons/ri";
import { IoIosTrendingUp } from "react-icons/io";
import { MdFavorite } from "react-icons/md";



const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    fetchProperty();
    if (user) {
      checkFavorite();
    }
  }, [id, user]);

  const fetchProperty = async () => {
    try {
      const res = await axios.get(`https://api.ingatlan-projekt.com/api/properties/${id}`);
      console.log('API Response:', res.data);
      
      // Handle both old and new API response structures
      const propertyData = res.data.data.property || res.data.data;
      const imagesData = res.data.data.images || [];
      
      console.log('Property Data:', propertyData);
      console.log('Images Data:', imagesData);
      
      // Check if property is suspended (inaktiv)
      if (propertyData.statusz === 'inaktiv') {
        // Only show if user is admin or owner
        if (!user || (user.id !== propertyData.felhasznalo_id && user.szerepkor !== 'admin')) {
          toast.error('Ez a hirdetés jelenleg nem elérhető');
          navigate('/ingatlanok');
          return;
        }
        
        if (user.id === propertyData.felhasznalo_id) {
          toast.warning('Ez a hirdetésed felfüggesztve van');
        }
      }
      
      // Combine property with images
      setProperty({
        ...propertyData,
        kepek: imagesData
      });
      
      console.log('Final property with images:', {
        ...propertyData,
        kepek: imagesData
      });
    } catch (error) {
      console.error('Hiba:', error);
      toast.error('Az ingatlan nem található');
      navigate('/ingatlanok');
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const res = await axios.get(`https://api.ingatlan-projekt.com/api/favorites/check/${id}`);
      setIsFavorite(res.data.isFavorite);
    } catch (error) {
      console.error('Kedvenc ellenőrzés hiba:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.warning('Jelentkezz be a kedvencek használatához!');
      navigate('/bejelentkezes');
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`https://api.ingatlan-projekt.com/api/favorites/${id}`);
        toast.success('Eltávolítva a kedvencekből');
        setIsFavorite(false);
      } else {
        await axios.post(`https://api.ingatlan-projekt.com/api/favorites/${id}`);
        toast.success('Hozzáadva a kedvencekhez');
        setIsFavorite(true);
      }
    } catch (error) {
      toast.error('Hiba történt');
    }
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('hu-HU').format(price) + ' ' + currency;
  };

  const nextImage = () => {
    if (property.kepek && property.kepek.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.kepek.length);
    }
  };

  const prevImage = () => {
    if (property.kepek && property.kepek.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + property.kepek.length) % property.kepek.length);
    }
  };

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showLightbox) {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') closeLightbox();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showLightbox, property]);

  // Auto-play slideshow (optional)
  useEffect(() => {
    if (property && property.kepek && property.kepek.length > 1) {
      const interval = setInterval(() => {
        nextImage();
      }, 5000); // Change image every 5 seconds

      return () => clearInterval(interval);
    }
  }, [property, currentImageIndex]);

  if (loading) {
    return <div className="container loading"><p>Betöltés...</p></div>;
  }

  if (!property) {
    return <div className="container"><p>Az ingatlan nem található.</p></div>;
  }

  const extrak = property.extrak ? JSON.parse(property.extrak) : {};

  return (
    <div className="property-detail-page">
      <div className="container">
        {/* Suspension Warning */}
        {property.statusz === 'inaktiv' && user && (
          <div className="suspension-warning">
            <h3>Ez a hirdetés fel van függesztve</h3>
            {property.felfuggesztve_indok && (
              <p><strong>Indok:</strong> {property.felfuggesztve_indok}</p>
            )}
            {user.id === property.felhasznalo_id && (
              <p>A hirdetés nem látható mások számára. Kérjük vedd fel a kapcsolatot az adminisztrátorral.</p>
            )}
          </div>
        )}

        {/* Header */}
        <div className="detail-header">
          <div>
            <h1>
              {property.cim}
              {/* FOGLALT badge ha lefoglalva */}
              {!!property.lefoglalva && (
                <span className="badge-reserved-inline">FOGLALT</span>
              )}
            </h1>
            <p className="location"><FaLocationDot /> {property.varos}{property.kerulet ? `, ${property.kerulet}` : ''}</p>
          </div>
          <div className="header-actions">
            <button onClick={toggleFavorite} className={`btn-favorite ${isFavorite ? 'active' : ''}`}>
              {isFavorite ? 'Kedvencekben' : 'Kedvencekhez'}
            </button>
            <div className="price-badge">{formatPrice(property.ar, property.penznem)}</div>
          </div>
        </div>

        {/* Foglalt figyelmeztetés */}
        {!!property.lefoglalva && (
          <div className="reserved-alert">
            <strong>Ez az ingatlan jelenleg foglalt</strong>
            {property.lefoglalva_datum && (
              <p>Foglalás dátuma: {new Date(property.lefoglalva_datum).toLocaleDateString('hu-HU')}</p>
            )}
          </div>
        )}

        {/* Images - Professional Slideshow */}
        {property.kepek && property.kepek.length > 0 ? (
          <div className="property-slideshow">
            <div className="slideshow-container">
              {/* Main Image */}
              <div className="slideshow-main-image" onClick={() => openLightbox(currentImageIndex)}>
                <img 
                  src={property.kepek[currentImageIndex]?.fajl_utvonal?.startsWith('http') 
                    ? property.kepek[currentImageIndex].fajl_utvonal 
                    : `https://api.ingatlan-projekt.com${property.kepek[currentImageIndex]?.fajl_utvonal}`}
                  alt={`${property.cim} - ${currentImageIndex + 1}`}
                  onError={(e) => {
                    console.error('Image load error:', e.target.src);
                    e.target.src = 'https://via.placeholder.com/1200x600?text=Nincs+kép';
                  }}
                />
                
                {/* Navigation Arrows */}
                {property.kepek.length > 1 && (
                  <>
                    <button className="slideshow-prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                      ❮
                    </button>
                    <button className="slideshow-next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                      ❯
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="slideshow-counter">
                  {currentImageIndex + 1} / {property.kepek.length}
                </div>

                {/* Zoom Icon */}
                <div className="slideshow-zoom-hint">
                  Kattints a nagyításhoz
                </div>
              </div>

              {/* Thumbnail Navigation */}
              {property.kepek.length > 1 && (
                <div className="slideshow-thumbnails">
                  {property.kepek.map((kep, index) => (
                    <div 
                      key={index}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img 
                        src={kep.fajl_utvonal?.startsWith('http') 
                          ? kep.fajl_utvonal 
                          : `https://api.ingatlan-projekt.com${kep.fajl_utvonal}`}
                        alt={`Thumbnail ${index + 1}`}
                        onError={(e) => {
                          console.error('Thumbnail load error:', e.target.src);
                          e.target.src = 'https://via.placeholder.com/150x100?text=Nincs+kép';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Indicator Dots */}
              {property.kepek.length > 1 && (
                <div className="slideshow-dots">
                  {property.kepek.map((_, index) => (
                    <span 
                      key={index}
                      className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="property-slideshow">
            <div className="slideshow-main-image no-image">
              <img src="https://via.placeholder.com/1200x600?text=Nincs+feltöltött+kép" alt="Nincs kép" />
            </div>
          </div>
        )}

        {/* Lightbox Modal */}
        {showLightbox && property.kepek && property.kepek.length > 0 && (
          <div className="lightbox-overlay" onClick={closeLightbox}>
            <button className="lightbox-close" onClick={closeLightbox}>✕</button>
            
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <img 
                src={property.kepek[currentImageIndex]?.fajl_utvonal?.startsWith('http') 
                  ? property.kepek[currentImageIndex].fajl_utvonal 
                  : `https://api.ingatlan-projekt.com${property.kepek[currentImageIndex]?.fajl_utvonal}`}
                alt={`${property.cim} - ${currentImageIndex + 1}`}
                onError={(e) => {
                  console.error('Lightbox image error:', e.target.src);
                  e.target.src = 'https://via.placeholder.com/1200x800?text=Nincs+kép';
                }}
              />
              
              {property.kepek.length > 1 && (
                <>
                  <button className="lightbox-prev" onClick={prevImage}>❮</button>
                  <button className="lightbox-next" onClick={nextImage}>❯</button>
                </>
              )}
              
              <div className="lightbox-counter">
                {currentImageIndex + 1} / {property.kepek.length}
              </div>
            </div>
          </div>
        )}

        <div className="detail-content">
          {/* Left Column */}
          <div className="detail-main">
            <div className="info-card">
              <h2>Alapadatok</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Típus:</span>
                  <span className="value">{property.tipus.charAt(0).toUpperCase() + property.tipus.slice(1)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Tranzakció:</span>
                  <span className="value">{property.tranzakcio_tipus === 'elado' ? 'Eladó' : 'Kiadó'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Alapterület:</span>
                  <span className="value">{property.alapterulet} m²</span>
                </div>
                <div className="info-item">
                  <span className="label">Szobák száma:</span>
                  <span className="value">{property.szobak_szama || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Fürdők száma:</span>
                  <span className="value">{property.furdok_szama || 'N/A'}</span>
                </div>
                {property.emelet && (
                  <div className="info-item">
                    <span className="label">Emelet:</span>
                    <span className="value">{property.emelet}</span>
                  </div>
                )}
                {property.epitesi_ev && (
                  <div className="info-item">
                    <span className="label">Építés éve:</span>
                    <span className="value">{property.epitesi_ev}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="label">Állapot:</span>
                  <span className="value">{property.allapot?.charAt(0).toUpperCase() + property.allapot?.slice(1) || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Összkomfort:</span>
                  <span className="value">{property.osszkomfort ? 'Igen' : 'Nem'}</span>
                </div>
              </div>
            </div>

            {property.leiras && (
              <div className="info-card">
                <h2>Leírás</h2>
                <p className="description">{property.leiras}</p>
              </div>
            )}

            {Object.keys(extrak).length > 0 && (
              <div className="info-card">
                <h2>Extrák</h2>
                <div className="extras-grid">
                  {extrak.parkolas && <span className="extra-badge">Parkolás</span>}
                  {extrak.lift && <span className="extra-badge">Lift</span>}
                  {extrak.erkely && <span className="extra-badge">Erkély</span>}
                  {extrak.terasz && <span className="extra-badge">Terasz</span>}
                  {extrak.legkondicionalas && <span className="extra-badge">Légkondicionálás</span>}
                  {extrak.medence && <span className="extra-badge">Medence</span>}
                  {extrak.jacuzzi && <span className="extra-badge">Jacuzzi</span>}
                  {extrak.szauna && <span className="extra-badge">Szauna</span>}
                  {extrak.riaszto && <span className="extra-badge">Riasztó</span>}
                  {extrak.butorozott && <span className="extra-badge">Bútorozott</span>}
                  {extrak.padlofutes && <span className="extra-badge">Padlófűtés</span>}
                </div>
              </div>
            )}

            {/* Térkép - Környék mutatása */}
            {property.latitude && property.longitude && (
              <div className="info-card">
                <h2>
                  <i className="fas fa-map-marked-alt me-2"></i>
                  Elhelyezkedés
                </h2>
                <p className="text-muted mb-3">
                  <i className="fas fa-map-marker-alt me-1"></i>
                  {property.cim}, {property.varos}
                </p>
                <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
                  <PropertyMap
                    properties={[property]}
                    center={{
                      lat: parseFloat(property.latitude),
                      lng: parseFloat(property.longitude)
                    }}
                    zoom={15}
                    showInfoWindows={false}
                  />
                </div>
                <div className="mt-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="fas fa-external-link-alt me-2"></i>
                    Megnyitás Google Maps-ben
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact */}
          <div className="detail-sidebar">
            <div className="contact-card">
              <h3>Kapcsolatfelvétel</h3>
              <div className="contact-info">
                <p><strong>Hirdető:</strong> {property.hirdeto_nev}</p>
                {property.hirdeto_telefon && (
                  <p><strong>Telefon:</strong> <a href={`tel:${property.hirdeto_telefon}`}>{property.hirdeto_telefon}</a></p>
                )}
                {property.hirdeto_email && (
                  <p><strong>Email:</strong> <a href={`mailto:${property.hirdeto_email}`}>{property.hirdeto_email}</a></p>
                )}
              </div>
              <button className="btn-contact" onClick={() => {
                if (!user) {
                  toast.warning('Jelentkezz be az üzenetküldéshez!');
                  navigate('/bejelentkezes');
                  return;
                }
                
                // Ellenőrzés: saját hirdetés
                if (user.id === property.hirdeto_id) {
                  toast.info('Ez a te hirdetésed!');
                  return;
                }
                
                // Navigálás a chat-re (új üzenet helyett)
                navigate(`/chat/${property.hirdeto_id}`);
              }}>Üzenet küldése</button>
            </div>

            <div className="stats-card">
              <h3>Statisztikák</h3>
              <p><FaEye /> Megtekintések: {property.megtekintesek}</p>
              <p><RiUpload2Fill /> Feltöltve: {new Date(property.letrehozva).toLocaleDateString('hu-HU')}</p>
              {!!property.kiemelt && <p className="featured-badge"><IoIosTrendingUp /> Kiemelt hirdetés</p>}
            </div>
          </div>
        </div>

        {/* Message Modal */}
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          recipientId={property.hirdeto_id}
          recipientName={property.hirdeto_nev}
          propertyId={property.id}
          propertyTitle={property.cim}
        />
      </div>
    </div>
  );
};

export default PropertyDetail;