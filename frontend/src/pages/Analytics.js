import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { FaEye } from "react-icons/fa";
import { AiFillMessage } from "react-icons/ai";
import { MdFavorite } from "react-icons/md";
import { IoMdHome } from "react-icons/io";
import { FcStatistics } from "react-icons/fc";
import { GoGraph } from "react-icons/go";
import { GoPlus } from "react-icons/go";
import { FaPlus } from "react-icons/fa6";
import { FaCameraRetro } from "react-icons/fa";
import { MdOutlineDescription } from "react-icons/md";
import { CiBag1 } from "react-icons/ci";



const Analytics = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalMessages: 0,
    totalFavorites: 0,
    activeProperties: 0,
    viewsThisMonth: 0,
    messagesThisMonth: 0,
    topProperty: null,
    recentActivity: []
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toast.warning('Jelentkezz be a statisztikák megtekintéséhez!');
      navigate('/bejelentkezes');
      return;
    }
    
    fetchAnalytics();
  }, [user, authLoading, navigate]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://api.ingatlan-projekt.com/api/analytics');
      setStats(res.data.data);
    } catch (error) {
      console.error('Analytics betöltési hiba:', error);
      toast.error('Hiba a statisztikák betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Kép URL fix
  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x300?text=Nincs+kép';
    if (url.startsWith('http')) return url;
    return `https://api.ingatlan-projekt.com${url}`;
  };

  if (authLoading || loading) {
    return <div className="container loading"><p>Betöltés...</p></div>;
  }

  return (
    <div className="analytics-page">
      <div className="container">
        <h1>Statisztikák & Elemzések</h1>
        <p className="page-subtitle">Hirdetéseid teljesítményének követése</p>

        {/* Overview Cards */}
        <div className="analytics-grid">
          <div className="analytics-card views">
            <div className="analytics-icon"><FaEye /></div>
            <div className="analytics-info">
              <h3>{stats.totalViews.toLocaleString('hu-HU')}</h3>
              <p>Összes megtekintés</p>
              <span className="analytics-trend">+{stats.viewsThisMonth} ebben a hónapban</span>
            </div>
          </div>

          <div className="analytics-card messages">
            <div className="analytics-icon"><AiFillMessage /></div>
            <div className="analytics-info">
              <h3>{stats.totalMessages}</h3>
              <p>Érdeklődések</p>
              <span className="analytics-trend">+{stats.messagesThisMonth} ebben a hónapban</span>
            </div>
          </div>

          <div className="analytics-card favorites">
            <div className="analytics-icon"><MdFavorite /></div>
            <div className="analytics-info">
              <h3>{stats.totalFavorites}</h3>
              <p>Kedvencekhez adva</p>
            </div>
          </div>

          <div className="analytics-card properties">
            <div className="analytics-icon"><IoMdHome /></div>
            <div className="analytics-info">
              <h3>{stats.activeProperties}</h3>
              <p>Aktív hirdetések</p>
            </div>
          </div>
        </div>

        {/* Top Performing Property */}
        {stats.topProperty && (
          <div className="top-property-section">
            <h2>Legjobban teljesítő hirdetésed</h2>
            <div className="top-property-card">
              <img 
                src={getImageUrl(stats.topProperty.fo_kep)} 
                alt={stats.topProperty.cim}
                onError={(e) => {
                  console.error('Analytics top property image error:', e.target.src);
                  e.target.src = 'https://via.placeholder.com/400x300?text=Nincs+kép';
                }}
              />
              <div className="top-property-info">
                <h3>{stats.topProperty.cim}</h3>
                <p>{stats.topProperty.varos}</p>
                <div className="top-property-stats">
                  <div className="stat-item">
                    <span className="stat-icon"><FaEye /></span>
                    <span>{stats.topProperty.megtekintesek} megtekintés</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon"><CiBag1 /></span>
                    <span>{new Intl.NumberFormat('hu-HU').format(stats.topProperty.ar)} {stats.topProperty.penznem}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="recent-activity-section">
          <h2><GoGraph /> Közelmúlt aktivitás</h2>
          <div className="activity-list">
            {stats.recentActivity.length === 0 ? (
              <p className="no-activity">Még nincs aktivitás</p>
            ) : (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon"><FaEye /></div>
                  <div className="activity-content">
                    <p><strong>{activity.title}</strong></p>
                    <p className="activity-description">{activity.description}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="tips-section">
          <h2 className="analytics-section-title"><FaPlus className="analytics-title-icon" /> Tippek a jobb teljesítményhez</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="analytics-tip-icon"><FaCameraRetro /></div>
              <h4>Használj minőségi képeket</h4>
              <p>A jó minőségű fotók 3x több megtekintést generálnak</p>
            </div>
            <div className="tip-card">
              <div className="analytics-tip-icon"><MdOutlineDescription /></div>
              <h4>Részletes leírás</h4>
              <p>A részletes leírások 50%-kal több érdeklődést eredményeznek</p>
            </div>
            <div className="tip-card">
              <div className="analytics-tip-icon"><CiBag1 /></div>
              <h4>Versenyképes ár</h4>
              <p>A piaci átlaghoz igazított árak gyorsabb eladást jelentenek</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;