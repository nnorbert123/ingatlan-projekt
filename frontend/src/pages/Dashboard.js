import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { FaPlusCircle, FaLock, FaLockOpen } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { IoExitOutline } from "react-icons/io5";
import { FiPause } from "react-icons/fi";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaPen } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { IoPlay } from "react-icons/io5";
import { MdBlockFlipped } from "react-icons/md";

const Dashboard = () => {
  const { user, logout, updateUser, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.warning('Jelentkezz be a profilod megtekintéséhez!');
      navigate('/bejelentkezes');
      return;
    }
    // Friss user adatok lekérése a szerverről (pl. profil szerkesztés után)
    axios.get('https://api.ingatlan-projekt.com/api/auth/me')
      .then(res => updateUser(res.data.user))
      .catch(err => console.error('User refresh hiba:', err));

    fetchMyProperties();
  }, [user?.id, authLoading, navigate]);

  const fetchMyProperties = async () => {
    try {
      const res = await axios.get('https://api.ingatlan-projekt.com/api/properties/my/listings');
      setMyProperties(res.data.data);
    } catch (error) {
      console.error('Saját hirdetések betöltési hiba:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (id) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a hirdetést?')) return;
    try {
      await axios.delete(`https://api.ingatlan-projekt.com/api/properties/${id}`);
      setMyProperties(myProperties.filter(prop => prop.id !== id));
      toast.success('Hirdetés törölve');
    } catch (error) {
      toast.error('Hiba a törlés során');
    }
  };

  const reactivateProperty = async (id) => {
    const property = myProperties.find(p => p.id === id);
    if (property && property.felfuggesztve_indok) {
      toast.error('Ezt a hirdetést az admin felfüggesztette. Csak az admin állíthatja vissza.');
      return;
    }
    if (!window.confirm('Biztosan visszaállítod aktívra ezt a hirdetést?')) return;
    try {
      await axios.put(`https://api.ingatlan-projekt.com/api/properties/${id}`, {
        statusz: 'aktiv',
        felfuggesztve_indok: null,
        felfuggesztve_datum: null
      });
      toast.success('Hirdetés újra aktív!');
      fetchMyProperties();
    } catch (error) {
      console.error('Visszaállítás hiba:', error);
      toast.error('Hiba a visszaállítás során');
    }
  };

  const deactivateProperty = async (id) => {
    if (!window.confirm('Biztosan deaktiválod ezt a hirdetést? Így nem fog megjelenni a listában.')) return;
    try {
      await axios.put(`https://api.ingatlan-projekt.com/api/properties/${id}`, { statusz: 'inaktiv' });
      toast.success('Hirdetés deaktiválva');
      fetchMyProperties();
    } catch (error) {
      console.error('Deaktiválás hiba:', error);
      toast.error('Hiba a deaktiválás során');
    }
  };

  const handleReserveProperty = async (propertyId, isReserved) => {
    try {
      const endpoint = isReserved ? 'unreserve' : 'reserve';
      const token = localStorage.getItem('token');
      await axios.put(
        `https://api.ingatlan-projekt.com/api/properties/${propertyId}/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(isReserved ? 'Lefoglalás visszavonva' : 'Ingatlan lefoglalva');
      fetchMyProperties();
    } catch (error) {
      console.error('Reserve error:', error);
      toast.error(error.response?.data?.message || 'Hiba történt');
    }
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('hu-HU').format(price) + ' ' + currency;
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/100x75?text=Nincs+kép';
    if (url.startsWith('http')) return url;
    return `https://api.ingatlan-projekt.com${url}`;
  };

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, rgba(10,10,18,0.6) 0%, rgba(10,10,18,0.88) 100%), url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=85") center/cover no-repeat',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif' }}>Betöltés...</p>
      </div>
    );
  }

  const avatarLetter = user?.nev ? user.nev.charAt(0).toUpperCase() : '?';
  const profilkepUrl = user?.profilkep
    ? (user.profilkep.startsWith('http')
        ? user.profilkep
        : `https://api.ingatlan-projekt.com${user.profilkep.startsWith('/') ? '' : '/'}${user.profilkep}`)
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');

        .dashboard-page {
          min-height: 100vh;
          background:
            linear-gradient(
              to bottom,
              rgba(10,10,18,0.52) 0%,
              rgba(10,10,18,0.38) 30%,
              rgba(10,10,18,0.58) 65%,
              rgba(10,10,18,0.82) 100%
            ),
            url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=85') center/cover no-repeat fixed;
          font-family: 'Inter', sans-serif;
          padding-bottom: 60px;
        }

        /* ── Fejléc terület ── */
        .dashboard-header {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          padding: 2.5rem 2rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .dashboard-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 0.3rem;
        }
        .user-greeting {
          color: rgba(255,255,255,0.65);
          font-size: 0.93rem;
          font-weight: 300;
        }
        .header-actions {
          display: flex;
          gap: 0.7rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .btn-secondaryy {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.4rem;
          background: #D4A017;
          color: #111;
          border: none;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          text-decoration: none;
        }
        .btn-secondaryy:hover { background: #e6b020; color: #111; }
        .btn-logout {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.3rem;
          background: transparent;
          color: rgba(255,255,255,0.85);
          border: 1.5px solid rgba(255,255,255,0.35);
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.87rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-logout:hover { border-color: rgba(255,255,255,0.7); color: #fff; }

        /* ── Tartalom wrapper ── */
        .dashboard-page .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem 0;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* ── Profil kártya (user-info-card) ── */
        .user-info-card {
          background: #fff;
          border-radius: 18px;
          display: flex;
          overflow: hidden;
          box-shadow: 0 8px 60px rgba(0,0,0,0.35);
        }
        /* Bal oldalsáv */
        .profil-oldalsav {
          width: 270px;
          flex-shrink: 0;
          padding: 2.5rem 1.5rem 2rem;
          border-right: 1px solid #eee;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .avatar-gyuru {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          border: 3px solid #D4A017;
          overflow: hidden;
          margin-bottom: 1.1rem;
          background: linear-gradient(135deg, #0c132a, #1a2340);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .avatar-gyuru img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .avatar-kezdobetuk {
          font-family: 'Inter', sans-serif;
          font-size: 2.6rem;
          font-weight: 800;
          color: #D4A017;
        }
        .oldalsav-nev {
          font-family: 'Inter', sans-serif;
          font-size: 1.18rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #1a1a2e;
          text-align: center;
          margin-bottom: 0.4rem;
        }
        .oldalsav-email-sor {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: #6b7280;
          font-size: 0.81rem;
          margin-bottom: 0.8rem;
          text-align: center;
          word-break: break-all;
        }
        .szerepkor-badge {
          display: inline-block;
          padding: 0.22rem 0.85rem;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 1.4rem;
        }
        .szerepkor-badge.admin { background: #fef3c7; color: #92400e; }
        .szerepkor-badge.user  { background: #dbeafe; color: #1e40af; }
        .oldalsav-stat-sor {
          display: flex;
          gap: 1.4rem;
          padding-top: 1.4rem;
          border-top: 1px solid #eee;
          width: 100%;
          justify-content: center;
        }
        .oldalsav-stat { text-align: center; }
        .oldalsav-stat-szam {
          font-family: 'Inter', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1;
        }
        .oldalsav-stat-felirat {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #9ca3af;
          margin-top: 3px;
        }

        /* Jobb panel – adatok */
        .urlap-panel {
          flex: 1;
          padding: 2.2rem 2.5rem 2rem;
          display: flex;
          flex-direction: column;
        }
        .urlap-panel h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.55rem;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 1.6rem;
        }
        .mezo-csoport { margin-bottom: 1.1rem; }
        .mezo-cimke {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          color: #9ca3af;
          font-size: 0.8rem;
          margin-bottom: 0.35rem;
        }
        .mezo-ertek {
          width: 100%;
          padding: 0.72rem 1rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.92rem;
          color: #111827;
          background: #f9fafb;
        }
        .ket-oszlopos-sor {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .urlap-gombok {
          display: flex;
          justify-content: flex-end;
          gap: 0.7rem;
          margin-top: auto;
          padding-top: 1.5rem;
        }
        .btn-szerkesztes {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.58rem 1.8rem;
          border: none;
          border-radius: 25px;
          background: #D4A017;
          color: #111;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          text-decoration: none;
        }
        .btn-szerkesztes:hover { background: #e6b020; color: #111; }

        /* ── Hirdetések szekció (my-properties-section) ── */
        .my-properties-section {
          background: #fff;
          border-radius: 18px;
          overflow: visible;
          box-shadow: 0 8px 60px rgba(0,0,0,0.35);
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.6rem 2rem 1.3rem;
          border-bottom: 1px solid #f0f0f0;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .section-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: #1a1a2e;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.55rem 1.2rem;
          background: #1a1a2e;
          color: #D4A017;
          border-radius: 8px;
          text-decoration: none;
          font-size: 0.84rem;
          font-weight: 600;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        .btn-primary:hover { background: #0c132a; color: #D4A017; transform: translateY(-1px); }
        .no-properties {
          text-align: center;
          padding: 3rem 2rem;
          color: #9ca3af;
        }
        .no-properties p { margin-bottom: 1rem; font-size: 1rem; }

        /* Táblázat */
        .properties-table { overflow-x: auto; border-radius: 0 0 18px 18px; }
        .properties-table table {
          width: 100%;
          border-collapse: collapse;
          min-width: 680px;
        }
        .properties-table thead tr { background: #f8f7f4; }
        .properties-table th {
          padding: 0.75rem 0.75rem;
          text-align: left;
          font-size: 0.68rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }
        .properties-table td {
          padding: 0.7rem 0.75rem;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
          font-size: 0.84rem;
          color: #374151;
        }
        .properties-table tr:last-child td { border-bottom: none; }
        .properties-table tr:hover td { background: #fafafa; }
        .table-thumbnail {
          width: 60px;
          height: 44px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          display: block;
        }
        .property-location { color: #9ca3af; font-size: 0.75rem; }
        .type-badge {
          background: #f0ede6;
          color: #1a1a2e;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .price-cell { font-weight: 600; color: #1a1a2e; white-space: nowrap; font-size: 0.82rem; }
        .status-badge {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .status-badge.aktiv    { background: #d1fae5; color: #065f46; }
        .status-badge.inaktiv  { background: #fee2e2; color: #991b1b; }
        .status-badge.badge-reserved { background: #fef3c7; color: #92400e; }
        .views-count {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: #6b7280;
          font-size: 0.82rem;
        }

        /* Műveletek */
        .action-buttons {
          display: flex;
          gap: 0.3rem;
          align-items: center;
          flex-wrap: nowrap;
        }
        .action-buttons button,
        .action-buttons a {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.78rem;
          transition: all 0.2s;
          text-decoration: none;
          flex-shrink: 0;
        }
        .action-buttons button:hover,
        .action-buttons a:hover { transform: translateY(-1px); }

        .btn-view        { background: #dbeafe; color: #1e40af; }
        .btn-view:hover  { background: #bfdbfe; }
        .btn-edit        { background: #fef3c7; color: #92400e; }
        .btn-edit:hover  { background: #fde68a; }
        .btn-deactivate  { background: #f3f4f6; color: #6b7280; }
        .btn-deactivate:hover { background: #e5e7eb; }
        .btn-reactivate  { background: #d1fae5; color: #065f46; }
        .btn-reactivate:hover { background: #a7f3d0; }
        .btn-delete      { background: #fee2e2; color: #991b1b; }
        .btn-delete:hover { background: #fecaca; }
        .btn-reserve     { background: #ede9fe; color: #5b21b6; }
        .btn-reserve:hover { background: #ddd6fe; }
        .btn-unreserve   { background: #fef3c7; color: #92400e; }
        .btn-unreserve:hover { background: #fde68a; }
        .btn-suspended-by-admin {
          background: #fef3c7 !important;
          color: #92400e !important;
          cursor: not-allowed !important;
          opacity: 0.7;
        }

        /* ── Reszponzív ── */
        @media (max-width: 900px) {
          .dashboard-header { padding: 1.8rem 1.5rem 1.4rem; }
          .dashboard-page .container { padding: 0 1.5rem; }
          .profil-oldalsav { width: 210px; }
        }
        @media (max-width: 680px) {
          .dashboard-header { padding: 1.4rem 1rem 1rem; }
          .dashboard-page .container { padding: 0 0.8rem; }
          .user-info-card { flex-direction: column; }
          .profil-oldalsav {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #eee;
            padding: 2rem 1.5rem 1.5rem;
          }
          .urlap-panel { padding: 1.5rem 1.2rem; }
          .ket-oszlopos-sor { grid-template-columns: 1fr; }
          .section-header { padding: 1.2rem 1rem; }
          .action-buttons { flex-wrap: wrap; }
        }
      `}</style>

      <div className="dashboard-page">

        {/* Fejléc */}
        <div className="dashboard-header">
          <div>
            <h1>Profilom</h1>
            <p className="user-greeting">Üdv, {user?.nev}!</p>
          </div>
        </div>

        <div className="container">

          {/* ── Profil kártya ── */}
          <div className="user-info-card">

            {/* Bal oldalsáv */}
            <aside className="profil-oldalsav">
              <div className="avatar-gyuru">
                {profilkepUrl ? (
                  <img
                    src={profilkepUrl}
                    alt={user?.nev}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="avatar-kezdobetuk">{avatarLetter}</div>
                )}
              </div>

              <div className="oldalsav-nev">{user?.nev}</div>

              <div className="oldalsav-email-sor">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {user?.email}
              </div>

              <span className={`szerepkor-badge ${user?.szerepkor === 'admin' ? 'admin' : 'user'}`}>
                {user?.szerepkor}
              </span>

              <div className="oldalsav-stat-sor">
                <div className="oldalsav-stat">
                  <div className="oldalsav-stat-szam">{myProperties.length}</div>
                  <div className="oldalsav-stat-felirat">Hirdetés</div>
                </div>
                <div className="oldalsav-stat">
                  <div className="oldalsav-stat-szam">
                    {myProperties.filter(p => p.statusz === 'aktiv').length}
                  </div>
                  <div className="oldalsav-stat-felirat">Aktív</div>
                </div>
                <div className="oldalsav-stat">
                  <div className="oldalsav-stat-szam">
                    {myProperties.reduce((sum, p) => sum + (p.megtekintesek || 0), 0)}
                  </div>
                  <div className="oldalsav-stat-felirat">Nézett</div>
                </div>
              </div>
            </aside>

            {/* Jobb panel – adatok */}
            <main className="urlap-panel">
              <h2>Profil Adatai</h2>

              <div className="mezo-csoport">
                <div className="mezo-cimke">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Név
                </div>
                <div className="mezo-ertek">{user?.nev || '—'}</div>
              </div>

              <div className="mezo-csoport">
                <div className="mezo-cimke">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  E-mail cím
                </div>
                <div className="mezo-ertek">{user?.email || '—'}</div>
              </div>

              <div className="ket-oszlopos-sor">
                <div className="mezo-csoport">
                  <div className="mezo-cimke">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
                    </svg>
                    Telefonszám
                  </div>
                  <div className="mezo-ertek">{user?.telefon || '—'}</div>
                </div>
                <div className="mezo-csoport">
                  <div className="mezo-cimke">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                    Regisztráció
                  </div>
                  <div className="mezo-ertek">
                    {user?.regisztracio_datum
                      ? new Date(user.regisztracio_datum).toLocaleDateString('hu-HU')
                      : '—'}
                  </div>
                </div>
              </div>

              <div className="urlap-gombok">
                <Link to="/profil/szerkesztes" className="btn-szerkesztes">
                  <CiEdit /> Szerkesztés
                </Link>
              </div>
            </main>
          </div>

          {/* ── Hirdetések szekció ── */}
          <div className="my-properties-section">
            <div className="section-header">
              <h2>Hirdetéseim ({myProperties.length} db)</h2>
              <Link to="/hirdetes-feladas" className="btn-primary">
                <FaPlusCircle /> Új hirdetés
              </Link>
            </div>

            {myProperties.length === 0 ? (
              <div className="no-properties">
                <p>Még nincs hirdetésed.</p>
                <Link to="/hirdetes-feladas" className="btn-primary">
                  Adj fel ingatlant most
                </Link>
              </div>
            ) : (
              <div className="properties-table">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Kép</th>
                      <th>Cím</th>
                      <th>Típus</th>
                      <th>Ár</th>
                      <th>Státusz</th>
                      <th>Megtekintések</th>
                      <th>Műveletek</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProperties.map((property, index) => (
                      <tr key={property.id}>
                        <td>{index + 1}.</td>
                        <td>
                          <img
                            src={getImageUrl(property.fo_kep)}
                            alt={property.cim}
                            className="table-thumbnail"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100x75?text=Nincs+kép';
                            }}
                          />
                        </td>
                        <td>
                          <strong>{property.cim}</strong>
                          <br />
                          <span className="property-location">{property.varos}</span>
                        </td>
                        <td>
                          <span className="type-badge">{property.tipus}</span>
                        </td>
                        <td className="price-cell">
                          {formatPrice(property.ar, property.penznem)}
                        </td>
                        <td>
                          {property.lefoglalva ? (
                            <span className="status-badge badge-reserved">FOGLALT</span>
                          ) : (
                            <span className={`status-badge ${property.statusz}`}>
                              {property.statusz === 'aktiv' ? 'Aktív' : 'Inaktív'}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="views-count">
                            <FaEye /> {property.megtekintesek || 0}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <button
                            onClick={() => handleReserveProperty(property.id, property.lefoglalva)}
                            className={property.lefoglalva ? 'btn-unreserve' : 'btn-reserve'}
                            title={property.lefoglalva ? 'Lefoglalás visszavonása' : 'Lefoglalás'}
                          >
                            {property.lefoglalva ? <FaLockOpen /> : <FaLock />}
                          </button>
                          <Link to={`/ingatlan/${property.id}`} className="btn-view" title="Megtekintés">
                            <FaEye />
                          </Link>
                          {property.statusz === 'aktiv' ? (
                            <>
                              <Link to={`/hirdetes-szerkesztes/${property.id}`} className="btn-edit" title="Szerkesztés">
                                <FaPen />
                              </Link>
                              <button
                                onClick={() => deactivateProperty(property.id)}
                                className="btn-deactivate"
                                title="Deaktiválás"
                              >
                                <FiPause />
                              </button>
                            </>
                          ) : (
                            <>
                              {property.felfuggesztve_indok ? (
                                <button
                                  className="btn-suspended-by-admin"
                                  disabled
                                  title={`Admin felfüggesztette: ${property.felfuggesztve_indok}`}
                                >
                                  <MdBlockFlipped />
                                </button>
                              ) : (
                                <button
                                  onClick={() => reactivateProperty(property.id)}
                                  className="btn-reactivate"
                                  title="Aktiválás"
                                >
                                  <IoPlay />
                                </button>
                              )}
                            </>
                          )}
                          <button
                            onClick={() => deleteProperty(property.id)}
                            className="btn-delete"
                            title="Törlés"
                          >
                            <FaRegTrashCan />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;