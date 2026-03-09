import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { IoNotifications } from "react-icons/io5";
import { BiSolidMessageRounded } from "react-icons/bi";
import { FaUser } from "react-icons/fa";
import { FcStatistics } from "react-icons/fc";
import { RiAdminFill } from "react-icons/ri";
import { IoExitOutline } from "react-icons/io5"; 
import { FaHome } from "react-icons/fa";
import { VscSearch } from "react-icons/vsc";
import { IoIosDocument } from "react-icons/io";

const DOCS = [
  { label: 'Fejlesztői dokumentáció',  url: 'https://docs.google.com/document/d/1nDcVVRqSHRZRj_tsTrKCEduB3ZaYlE8I/edit?rtpof=true&tab=t.0' },
  { label: 'Felhasználói útmutató',    url: 'https://docs.google.com/document/d/14WpdKSMqcjfUH7x6DlPrPowAn9lSbInT/edit?usp=drive_link&ouid=101022684915280323262&rtpof=true&sd=true' },
  { label: 'Prezentáció',              url: 'https://docs.google.com/presentation/d/1SKHujt6PoUas9i-iFsvqDFgbWH4b4usU/edit?usp=drive_web&ouid=101022684915280323262&rtpof=true' },
  { label: 'Összefoglaló',             url: 'https://docs.google.com/document/d/1cMSIWEaAhoboGFKDTREw__beykkiY-2P/edit' },
  { label: 'Tesztdokumentáció',        url: 'https://docs.google.com/document/d/1RQpO2urIeqjZUnI3dSKKKZO0f85kqP3V/edit?rtpof=true' },
  { label: 'Táblázat',                 url: 'https://docs.google.com/spreadsheets/d/14t5h8G-j0KUwzPJt13cxfbBPWMCp-Vdh/edit?gid=1461233650#gid=1461233650' },
];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMessageDropdownOpen, setIsMessageDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);
  const [isMobileDocsOpen, setIsMobileDocsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setProfileImageError(false);
  }, [user?.profilkep]);

  useEffect(() => {
    if (user) {
      fetchUnreadCounts();
      const interval = setInterval(fetchUnreadCounts, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCounts = async () => {
    try {
      const notifRes = await axios.get('https://api.ingatlan-projekt.com/api/notifications');
      const unreadNotifs = notifRes.data.data.filter(n => !n.olvasott);
      setUnreadNotifications(unreadNotifs.length);
      setRecentNotifications(unreadNotifs.slice(0, 5));

      const msgRes = await axios.get('https://api.ingatlan-projekt.com/api/messages');
      const allMessages = msgRes.data.data;
      
      const conversationMap = new Map();
      allMessages
        .filter(m => m.fogado_id === user.id && !m.olvasott)
        .forEach(msg => {
          const existing = conversationMap.get(msg.kuldo_id);
          if (!existing || new Date(msg.kuldve) > new Date(existing.kuldve)) {
            conversationMap.set(msg.kuldo_id, msg);
          }
        });
      
      const unreadConversations = Array.from(conversationMap.values());
      setUnreadMessages(unreadConversations.length);
      setRecentMessages(unreadConversations.slice(0, 5));
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  useEffect(() => {
    const searchProperties = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }
      try {
        const res = await axios.get('https://api.ingatlan-projekt.com/api/search', {
          params: { q: searchQuery, limit: 5 }
        });
        setSearchResults(res.data.data || []);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    };
    const debounceTimer = setTimeout(searchProperties, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const closeAllDropdowns = () => {
    setIsUserDropdownOpen(false);
    setIsMessageDropdownOpen(false);
    setIsNotificationDropdownOpen(false);
    setIsDocDropdownOpen(false);
  };

  const toggleUserDropdown = () => {
    const next = !isUserDropdownOpen;
    closeAllDropdowns();
    setIsUserDropdownOpen(next);
  };

  const toggleMessageDropdown = () => {
    const next = !isMessageDropdownOpen;
    closeAllDropdowns();
    setIsMessageDropdownOpen(next);
  };

  const toggleNotificationDropdown = () => {
    const next = !isNotificationDropdownOpen;
    closeAllDropdowns();
    setIsNotificationDropdownOpen(next);
  };

  const toggleDocDropdown = () => {
    const next = !isDocDropdownOpen;
    closeAllDropdowns();
    setIsDocDropdownOpen(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/ingatlanok?varos=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  const handleSearchResultClick = (propertyId) => {
    navigate(`/ingatlan/${propertyId}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    navigate('/');
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('hu-HU').format(price) + ' ' + currency;
  };

  const DocDropdown = () => (
    <div className="nav-dropdown-wrapper">
      <button className="nav-icon-link" onClick={toggleDocDropdown}>
        <div className="nav-icon-wrapper">
          <IoIosDocument />
        </div>
      </button>
      {isDocDropdownOpen && (
        <>
          <div className="dropdown-overlay" onClick={() => setIsDocDropdownOpen(false)} />
          <div className="nav-dropdown notifications-dropdown">
            <h3><IoIosDocument /> Dokumentációk</h3>
            <div className="dropdown-items">
              {DOCS.map((doc, index) => (
                <a
                  key={index}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dropdown-item notification-item"
                  onClick={() => setIsDocDropdownOpen(false)}
                >
                  <div className="dropdown-item-content">
                    <p>{doc.label}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo" onClick={closeMenu}>
           IngatlanKínálat
        </Link>
   
        <button className={`hamburger-menu ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
     
        {/* Search Bar */}
        <div className="navbar-search-wrapper" ref={searchRef}>
          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Keresés..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <VscSearch />
            </button>
          </form>
          {showSearchResults && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map(property => (
                <div
                  key={property.id}
                  className="search-result-item"
                  onClick={() => handleSearchResultClick(property.id)}
                >
                  <img 
                    src={property.fo_kep ? `https://api.ingatlan-projekt.com${property.fo_kep}` : 'https://via.placeholder.com/60x45'} 
                    alt={property.cim}
                    onError={(e) => e.target.src = 'https://via.placeholder.com/60x45'}
                  />
                  <div className="search-result-info">
                    <h4>{property.cim}</h4>
                    <p>{property.varos}</p>
                    <span className="search-result-price">
                      {formatPrice(property.ar, property.penznem)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="search-see-all" onClick={() => {
                navigate(`/ingatlanok?varos=${encodeURIComponent(searchQuery)}`);
                setShowSearchResults(false);
                setSearchQuery('');
              }}>
                Összes találat megtekintése →
              </div>
            </div>
          )}
          {showSearchResults && searchResults.length === 0 && searchQuery.length >= 2 && (
            <div className="search-results-dropdown">
              <div className="search-no-results">
                Nincs találat: "{searchQuery}"
              </div>
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="nav-items-desktop">
          <Link to="/" className="nav-link">Kezdőlap</Link>
          <Link to="/ingatlanok" className="nav-link">Ingatlanok</Link>

          {user ? (
            <>
              <Link to="/kedvencek" className="nav-link">Kedvencek</Link>
              <Link to="/hirdetes-feladas" className="nav-link">Hirdetés feladása</Link>

              {/* Messages */}
              <div className="nav-dropdown-wrapper">
                <button className="nav-icon-link" onClick={toggleMessageDropdown}>
                  <div className="nav-icon-wrapper">
                    <BiSolidMessageRounded />
                    {unreadMessages > 0 && (
                      <span className="nav-badge">{unreadMessages}</span>
                    )}
                  </div>
                </button>
                {isMessageDropdownOpen && (
                  <>
                    <div className="dropdown-overlay" onClick={() => setIsMessageDropdownOpen(false)} />
                    <div className="nav-dropdown messages-dropdown">
                      <h3><BiSolidMessageRounded /> Üzenetek</h3>
                      {recentMessages.length === 0 ? (
                        <p className="dropdown-empty">Nincs új üzenet</p>
                      ) : (
                        <div className="dropdown-items">
                          {recentMessages.map(msg => (
                            <Link
                              key={msg.id}
                              to={`/chat/${msg.kuldo_id}`}
                              className="dropdown-item message-item"
                              onClick={() => setIsMessageDropdownOpen(false)}
                            >
                              <div className="dropdown-item-avatar">
                                {msg.kuldo_profilkep ? (
                                  <img src={`https://api.ingatlan-projekt.com/${msg.kuldo_profilkep}`} alt={msg.kuldo_nev} />
                                ) : (
                                  <span>{msg.kuldo_nev?.charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                              <div className="dropdown-item-content">
                                <strong>{msg.kuldo_nev}</strong>
                                <p>{msg.uzenet?.substring(0, 50)}...</p>
                                <small>{new Date(msg.kuldve).toLocaleDateString('hu-HU')}</small>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                      <Link to="/uzenetek" className="dropdown-footer" onClick={() => setIsMessageDropdownOpen(false)}>
                        Összes üzenet →
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* User avatar */}
              <div className="user-menu">
                <button className="user-avatar" onClick={toggleUserDropdown}>
                  <div className="avatar-circle">
                    {user.profilkep && !profileImageError ? (
                      <img 
                        src={`https://api.ingatlan-projekt.com${user.profilkep}`} 
                        alt={user.nev}
                        onError={() => setProfileImageError(true)}
                      />
                    ) : (
                      <span>{user.nev.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </button>
                {isUserDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <p className="user-name">{user.nev}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/profil" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                      <FaUser /> Profilom
                    </Link>
                    <Link to="/statisztikak" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                      <FcStatistics /> Statisztikák
                    </Link>
                    <Link to="/uzenetek" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                      <BiSolidMessageRounded /> Üzenetek
                    </Link>
                    <Link to="/ertesitesek" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                      <IoNotifications /> Értesítések
                    </Link>
                    {user.szerepkor === 'admin' && (
                      <Link to="/admin" className="dropdown-item admin-item" onClick={() => setIsUserDropdownOpen(false)}>
                        <RiAdminFill /> Admin Panel
                      </Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout-item">
                      <IoExitOutline /> Kilépés
                    </button>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="nav-dropdown-wrapper">
                <button className="nav-icon-link" onClick={toggleNotificationDropdown}>
                  <div className="nav-icon-wrapper">
                    <IoNotifications />
                    {unreadNotifications > 0 && (
                      <span className="nav-badge">{unreadNotifications}</span>
                    )}
                  </div>
                </button>
                {isNotificationDropdownOpen && (
                  <>
                    <div className="dropdown-overlay" onClick={() => setIsNotificationDropdownOpen(false)} />
                    <div className="nav-dropdown notifications-dropdown">
                      <h3><IoNotifications /> Értesítések</h3>
                      {recentNotifications.length === 0 ? (
                        <p className="dropdown-empty">Nincs új értesítés</p>
                      ) : (
                        <div className="dropdown-items">
                          {recentNotifications.map(notif => (
                            <Link
                              key={notif.id}
                              to="/ertesitesek"
                              className="dropdown-item notification-item"
                              onClick={() => setIsNotificationDropdownOpen(false)}
                            >
                              <div className="dropdown-item-content">
                                <p>{notif.uzenet}</p>
                                <small>{new Date(notif.letrehozva).toLocaleDateString('hu-HU')}</small>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                      <Link to="/ertesitesek" className="dropdown-footer" onClick={() => setIsNotificationDropdownOpen(false)}>
                        Összes értesítés →
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* Dokumentációk — bejelentkezett */}
              <DocDropdown />
            </>
          ) : (
            <>
              {/* Kijelentkezett: Bejelentkezés → Regisztráció → Dokumentációk (jobb szélen) */}
              <div className="auth-buttons">
                <Link to="/bejelentkezes" className="btn-login">Bejelentkezés</Link>
                <Link to="/regisztracio" className="btn-register">Regisztráció</Link>
              </div>
              <DocDropdown />
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" onClick={closeMenu}>Kezdőlap</Link>
          <Link to="/ingatlanok" onClick={closeMenu}>Ingatlanok</Link>

          {/* Dokumentációk mobilon — mindenki látja */}
          <button
            onClick={() => setIsMobileDocsOpen(!isMobileDocsOpen)}
            style={{color:'white',background:'none',border:'none',cursor:'pointer',padding:'0.6rem 0.8rem',fontSize:'0.9rem',textAlign:'left',width:'100%',fontFamily:'inherit',display:'flex',alignItems:'center',gap:'0.5rem'}}
          >
            <IoIosDocument /> Dokumentációk {isMobileDocsOpen ? '▲' : '▼'}
          </button>
          {isMobileDocsOpen && DOCS.map((doc, index) => (
            <a key={index} href={doc.url} target="_blank" rel="noopener noreferrer" onClick={closeMenu}
              style={{paddingLeft:'2rem', fontSize:'0.82rem', opacity:0.85}}>
              <IoIosDocument /> {doc.label}
            </a>
          ))}

          {user ? (
            <>
              <Link to="/kedvencek" onClick={closeMenu}>Kedvencek</Link>
              <Link to="/hirdetes-feladas" onClick={closeMenu}>Hirdetés feladása</Link>
              <Link to="/profil" onClick={closeMenu}><FaUser /> Profilom</Link>
              <Link to="/statisztikak" onClick={closeMenu}><FcStatistics /> Statisztikák</Link>
              <Link to="/uzenetek" onClick={closeMenu}>
                <BiSolidMessageRounded /> Üzenetek
                {unreadMessages > 0 && <span style={{background:'#e74c3c',color:'white',borderRadius:'50%',padding:'2px 6px',fontSize:'0.75rem',marginLeft:'6px'}}>{unreadMessages}</span>}
              </Link>
              <Link to="/ertesitesek" onClick={closeMenu}>
                <IoNotifications /> Értesítések
                {unreadNotifications > 0 && <span style={{background:'#e74c3c',color:'white',borderRadius:'50%',padding:'2px 6px',fontSize:'0.75rem',marginLeft:'6px'}}>{unreadNotifications}</span>}
              </Link>
              {user.szerepkor === 'admin' && (
                <Link to="/admin" onClick={closeMenu}><RiAdminFill /> Admin Panel</Link>
              )}
              <button onClick={() => { handleLogout(); closeMenu(); }} className="mobile-logout">
                <IoExitOutline /> Kilépés
              </button>
            </>
          ) : (
            <>
              <Link to="/bejelentkezes" onClick={closeMenu}>Bejelentkezés</Link>
              <Link to="/regisztracio" onClick={closeMenu}>Regisztráció</Link>
            </>
          )}
        </div>
      </div>

      {(isUserDropdownOpen || isDocDropdownOpen) && (
        <div className="dropdown-overlay" onClick={closeAllDropdowns}></div>
      )}
    </nav>
  );
};

export default Navbar;