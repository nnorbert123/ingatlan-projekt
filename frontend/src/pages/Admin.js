import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { FcStatistics } from "react-icons/fc";
import { MdOutlineBlock } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
import { IoMdCheckmark } from "react-icons/io";
import { FaEye, FaLock, FaLockOpen } from "react-icons/fa";
import { IoKey } from "react-icons/io5";
import { IoKeySharp } from "react-icons/io5";
import { FaTrashAlt } from "react-icons/fa";
import { IoAlert } from "react-icons/io5";
import { FaRegLightbulb } from "react-icons/fa";
import { GrUserAdmin } from "react-icons/gr";
import { MdOutlinePhoneAndroid } from "react-icons/md";
import { MdEmail } from "react-icons/md";
import { BiSolidMessageRounded } from "react-icons/bi";
import { IoAlertOutline } from "react-icons/io5";
import { VscSearch } from "react-icons/vsc";
import { FaMessage } from "react-icons/fa6";


const Admin = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('adminActiveTab') || 'properties';
  });
  
  const [properties, setProperties] = useState([]);
  const [suspendedProperties, setSuspendedProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    activeProperties: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  
  const [propertySearch, setPropertySearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserProperties, setSelectedUserProperties] = useState([]);
  
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.szerepkor !== 'admin') {
      toast.error('Nincs jogosultságod ehhez az oldalhoz!');
      navigate('/');
      return;
    }
    fetchData();
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const propsRes = await axios.get('https://api.ingatlan-projekt.com/api/properties?limit=1000&includeInactive=true');
      const allProps = propsRes.data.data;
      setProperties(allProps);
      setSuspendedProperties(allProps.filter(p => p.statusz === 'inaktiv'));

      const usersRes = await axios.get('https://api.ingatlan-projekt.com/api/users', config);
      setUsers(usersRes.data.data);

      const totalViews = allProps.reduce((sum, prop) => sum + prop.megtekintesek, 0);
      const activeProps = allProps.filter(p => p.statusz === 'aktiv').length;
      setStats({
        totalUsers: usersRes.data.data.length,
        totalProperties: allProps.length,
        activeProperties: activeProps,
        totalViews: totalViews
      });
    } catch (error) {
      console.error('Admin adatok betöltési hiba:', error);
      toast.error('Hiba az adatok betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (id) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a hirdetést?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://api.ingatlan-projekt.com/api/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProperties(properties.filter(p => p.id !== id));
      toast.success('Hirdetés törölve');
      fetchData();
    } catch (error) {
      toast.error('Hiba a törlés során');
    }
  };

  const togglePropertyStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'aktiv' ? 'inaktiv' : 'aktiv';
    try {
      await axios.put(`https://api.ingatlan-projekt.com/api/properties/${id}`, { statusz: newStatus });
      setProperties(properties.map(p => p.id === id ? { ...p, statusz: newStatus } : p));
      toast.success(`Hirdetés ${newStatus === 'aktiv' ? 'aktiválva' : 'inaktiválva'}`);
      fetchData();
    } catch (error) {
      toast.error('Hiba a státusz módosításakor');
    }
  };

  const deleteUser = async (userId) => {
    if (userId === user.id) {
      toast.error('Saját magadat nem törölheted!');
      return;
    }
    if (!window.confirm('Biztosan törölni szeretnéd ezt a felhasználót? Az összes hirdetése is törlődni fog!')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://api.ingatlan-projekt.com/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u.id !== userId));
      toast.success('Felhasználó törölve');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Hiba a törlés során');
    }
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/80x60?text=Nincs+kép';
    if (url.startsWith('http')) return url;
    return `https://api.ingatlan-projekt.com${url}`;
  };

  const openSuspendModal = (property) => {
    setSelectedProperty(property);
    setSuspensionReason('');
    setShowSuspendModal(true);
  };

  const handleSuspend = async () => {
    if (!suspensionReason.trim()) {
      toast.error('Add meg a felfüggesztés indokát!');
      return;
    }
    try {
      await axios.put(`https://api.ingatlan-projekt.com/api/properties/${selectedProperty.id}`, {
        statusz: 'inaktiv',
        felfuggesztve_indok: suspensionReason,
        felfuggesztve_datum: new Date().toISOString()
      });
      try {
        await axios.post('https://api.ingatlan-projekt.com/api/notifications', {
          felhasznalo_id: selectedProperty.felhasznalo_id,
          tipus: 'figyelmezetes',
          uzenet: `Hirdetés felfüggesztve: "${selectedProperty.cim}". Indok: ${suspensionReason}`
        });
      } catch (notifError) {
        console.error('Értesítés küldési hiba:', notifError);
      }
      toast.success('Hirdetés sikeresen felfüggesztve');
      setShowSuspendModal(false);
      setSuspensionReason('');
      setSelectedProperty(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Hiba a felfüggesztés során');
    }
  };

  const handleReactivate = async (propertyId) => {
    if (!window.confirm('Biztosan visszaállítod ezt a hirdetést?')) return;
    try {
      await axios.put(`https://api.ingatlan-projekt.com/api/properties/${propertyId}`, {
        statusz: 'aktiv',
        felfuggesztve_indok: null,
        felfuggesztve_datum: null
      });
      toast.success('Hirdetés újra aktiválva');
      fetchData();
    } catch (error) {
      toast.error('Hiba a reaktiválás során');
    }
  };

  const handleReserveProperty = async (propertyId, isReserved) => {
    try {
      const endpoint = isReserved ? 'unreserve' : 'reserve';
      const token = localStorage.getItem('token');
      await axios.put(
        `https://api.ingatlan-projekt.com/api/properties/${propertyId}/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast.success(isReserved ? 'Lefoglalás visszavonva' : 'Ingatlan lefoglalva');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Hiba történt');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    if (userId === user.id) {
      toast.error('Saját szerepkörödet nem módosíthatod!');
      fetchData(); // reset select value
      return;
    }
    try {
      await axios.put(`https://api.ingatlan-projekt.com/api/users/${userId}/role`, { szerepkor: newRole });
      toast.success('Szerepkör frissítve');
      fetchData();
    } catch (error) {
      toast.error('Hiba a szerepkör módosítása során');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    // Saját magát nem függesztheti fel
    if (userId === user.id) {
      toast.error('Saját magadat nem függesztheted fel!');
      return;
    }
    try {
      const newStatus = !currentStatus;
      await axios.put(`https://api.ingatlan-projekt.com/api/users/${userId}`, { aktiv: newStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, aktiv: newStatus } : u));
      toast.success(`Felhasználó ${newStatus ? 'aktiválva' : 'felfüggesztve'}`);
    } catch (error) {
      toast.error('Hiba a státusz módosításakor');
    }
  };

  const openResetPasswordModal = (usr) => {
    setResetPasswordUser(usr);
    setNewPassword('');
    setShowResetPasswordModal(true);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('A jelszónak legalább 6 karakter hosszúnak kell lennie!');
      return;
    }
    try {
      await axios.put(`https://api.ingatlan-projekt.com/api/users/${resetPasswordUser.id}/reset-password`, {
        newPassword: newPassword
      });
      toast.success(`Jelszó sikeresen visszaállítva! Új jelszó: ${newPassword}`);
      setShowResetPasswordModal(false);
      setNewPassword('');
      setResetPasswordUser(null);
    } catch (error) {
      toast.error('Hiba a jelszó visszaállítása során');
    }
  };

  const openUserModal = async (usr) => {
    setSelectedUser(usr);
    setShowUserModal(true);
    try {
      const userProps = properties.filter(p => p.felhasznalo_id === usr.id);
      setSelectedUserProperties(userProps);
    } catch (error) {
      console.error('User properties fetch error:', error);
    }
  };

  const filteredProperties = properties.filter(prop => {
    if (!propertySearch) return true;
    const search = propertySearch.toLowerCase();
    return (
      prop.cim?.toLowerCase().includes(search) ||
      prop.varos?.toLowerCase().includes(search) ||
      prop.hirdeto_nev?.toLowerCase().includes(search) ||
      prop.tipus?.toLowerCase().includes(search) ||
      prop.id?.toString().includes(search)
    );
  });

  const filteredUsers = users.filter(u => {
    if (!userSearch) return true;
    const search = userSearch.toLowerCase();
    return (
      u.nev?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search) ||
      u.telefon?.toLowerCase().includes(search) ||
      u.szerepkor?.toLowerCase().includes(search)
    );
  });

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('hu-HU').format(price) + ' ' + currency;
  };

  if (authLoading || loading) {
    return <div className="container loading"><p>Betöltés...</p></div>;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <h1> <GrUserAdmin /> Admin felület</h1>
        <p className="page-subtitle">Rendszer kezelése és statisztikák</p>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><FaRegUser /></div>
            <div className="stat-info"><h3>{stats.totalUsers}</h3><p>Felhasználók</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaHome /></div>
            <div className="stat-info"><h3>{stats.totalProperties}</h3><p>Összes hirdetés</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IoMdCheckmark /></div>
            <div className="stat-info"><h3>{stats.activeProperties}</h3><p>Aktív hirdetések</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaEye /></div>
            <div className="stat-info"><h3>{stats.totalViews}</h3><p>Összes megtekintés</p></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`} onClick={() => setActiveTab('properties')}>
            <FcStatistics /> Hirdetések
          </button>
          <button className={`tab-btn ${activeTab === 'suspended' ? 'active' : ''}`} onClick={() => setActiveTab('suspended')}>
            <MdOutlineBlock /> Felfüggesztett ({suspendedProperties.length})
          </button>
          <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <FaUser /> Felhasználók
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'properties' && (
            <div className="admin-table-wrapper">
              <div className="d-flex justify-between align-center mb-4">
                <h2>Összes Hirdetés ({filteredProperties.length} db)</h2>
                <div className="input-group" style={{maxWidth: '300px'}}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Keresés (cím, város, hirdető...)"
                    value={propertySearch}
                    onChange={(e) => setPropertySearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th><th>ID</th><th>Kép</th><th>Cím</th><th>Hirdető</th>
                      <th>Típus</th><th>Ár</th><th>Megtekintések</th><th>Státusz</th><th>Műveletek</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProperties.map((property, index) => (
                      <tr key={property.id} className={property.statusz === 'inaktiv' ? 'suspended-row' : ''}>
                        <td><strong>{index + 1}.</strong></td>
                        <td>#{property.id}</td>
                        <td>
                          <img src={getImageUrl(property.fo_kep)} alt={property.cim} className="admin-thumbnail"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/80x60?text=Nincs+kép'; }} />
                        </td>
                        <td><strong>{property.cim}</strong><br /><small>{property.varos}</small></td>
                        <td>{property.hirdeto_nev}</td>
                        <td><span className="type-badge">{property.tipus}</span></td>
                        <td>{formatPrice(property.ar, property.penznem)}</td>
                        <td><FaEye /> {property.megtekintesek}</td>
                        <td>
                          {property.lefoglalva ? (
                            <span className="status-badge badge-reserved">Foglalt</span>
                          ) : property.statusz === 'aktiv' ? (
                            <span className="status-badge status-active"><IoMdCheckmark /> Aktív</span>
                          ) : (
                            <span className="status-badge status-suspended"><MdOutlineBlock /> Felfüggesztve</span>
                          )}
                        </td>
                        <td className="action-buttons">
                          <button onClick={() => handleReserveProperty(property.id, property.lefoglalva)}
                            className={property.lefoglalva ? 'btn-unreserve' : 'btn-reserve'}
                            title={property.lefoglalva ? 'Lefoglalás visszavonása' : 'Lefoglalás'}>
                            {property.lefoglalva ? <FaLockOpen /> : <FaLock />}
                          </button>
                          <button onClick={() => navigate(`/ingatlan/${property.id}`)} className="btn-view" title="Megtekintés">
                            <FaEye />
                          </button>
                          {property.statusz === 'aktiv' ? (
                            <button onClick={() => openSuspendModal(property)} className="btn-suspend" title="Felfüggesztés">
                              <MdOutlineBlock />
                            </button>
                          ) : (
                            <button onClick={() => handleReactivate(property.id)} className="btn-reactivate" title="Visszaállítás">
                              <IoMdCheckmark />
                            </button>
                          )}
                          <button onClick={() => deleteProperty(property.id)} className="btn-delete" title="Törlés">
                            <FaTrashAlt />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'suspended' && (
            <div className="admin-suspended-table suspended-table">
              <h2>Felfüggesztett Hirdetések ({suspendedProperties.length} db)</h2>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Kép</th><th>Cím</th><th>Hirdető</th>
                      <th>Felfüggesztés dátuma</th><th>Indok</th><th>Műveletek</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suspendedProperties.map(property => (
                      <tr key={property.id}>
                        <td>#{property.id}</td>
                        <td>
                          <img src={getImageUrl(property.fo_kep)} alt={property.cim} className="admin-thumbnail"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/80x60'; }} />
                        </td>
                        <td><strong>{property.cim}</strong><br /><small>{property.varos}</small></td>
                        <td>{property.hirdeto_nev}</td>
                        <td>{property.felfuggesztve_datum ? new Date(property.felfuggesztve_datum).toLocaleDateString('hu-HU') : '-'}</td>
                        <td><div className="suspension-reason">{property.felfuggesztve_indok || 'Nincs megadva'}</div></td>
                        <td className="action-buttons">
                          <button onClick={() => handleReactivate(property.id)} className="btn-reactivatee" title="Visszaállítás">
                            <IoMdCheckmark />
                          </button>
                          <button onClick={() => deleteProperty(property.id)} className="btn-delete" title="Törlés">
                            <FaTrashAlt />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="admin-users-table">
              <div className="d-flex justify-between align-center mb-4">
                <h2>Felhasználók ({filteredUsers.length} db)</h2>
                <div className="input-group" style={{maxWidth: '300px'}}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Keresés (név, email, telefon...)"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="table-responsive" style={{overflowX:'auto'}}>
                <table className="admin-table" style={{tableLayout:'auto',width:'100%'}}>
                  <thead>
                    <tr>
                      <th style={{whiteSpace:'nowrap'}}>ID</th>
                      <th style={{minWidth:'150px'}}>Név</th>
                      <th style={{minWidth:'180px'}}>Email</th>
                      <th style={{whiteSpace:'nowrap'}}>Telefon</th>
                      <th style={{whiteSpace:'nowrap'}}>Szerepkör</th>
                      <th style={{whiteSpace:'nowrap'}}>Hirdetések</th>
                      <th style={{whiteSpace:'nowrap'}}>Regisztráció</th>
                      <th style={{whiteSpace:'nowrap'}}>Státusz</th>
                      <th style={{whiteSpace:'nowrap'}}>Műveletek</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(usr => {
                      const isSelf = usr.id === user.id;
                      return (
                        <tr key={usr.id} style={isSelf ? { background: 'rgba(250, 204, 21, 0.07)' } : {}}>
                          <td style={{whiteSpace:'nowrap'}}>#{usr.id}</td>
                          <td style={{whiteSpace:'normal',minWidth:'150px'}}>
                            <strong
                              style={{cursor: 'pointer', color: 'var(--primary-color)', textDecoration: 'underline'}}
                              onClick={() => openUserModal(usr)}
                              title="Kattints a profil megtekintéséhez"
                            >
                              <FaUser /> {usr.nev}
                            </strong>
                            {isSelf && (
                              <span style={{
                                marginLeft: '6px', fontSize: '0.7rem', background: 'var(--gold, #facc15)',
                                color: '#1a1a1a', borderRadius: '4px', padding: '1px 5px', fontWeight: 700
                              }}>Te</span>
                            )}
                          </td>
                          <td>{usr.email}</td>
                          <td>{usr.telefon || '-'}</td>
                          <td>
                            <select
                              value={usr.szerepkor}
                              onChange={(e) => updateUserRole(usr.id, e.target.value)}
                              className="role-select"
                              disabled={isSelf}
                              title={isSelf ? 'Saját szerepkörödet nem módosíthatod' : ''}
                              style={isSelf ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td>{usr.ingatlanok_szama} db</td>
                          <td>{new Date(usr.regisztracio_datum).toLocaleDateString('hu-HU')}</td>
                          <td>
                            <button
                              onClick={() => toggleUserStatus(usr.id, usr.aktiv)}
                              className={`status-toggle ${usr.aktiv ? 'aktiv' : 'inaktiv'}`}
                              disabled={isSelf}
                              title={isSelf ? 'Saját magadat nem függesztheted fel' : ''}
                              style={isSelf ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                            >
                              {usr.aktiv ? 'Aktív' : 'Felfüggesztve'}
                            </button>
                          </td>
                          <td className="action-buttons">
                            <button
                              onClick={() => openResetPasswordModal(usr)}
                              className="btn-edit"
                              title="Jelszó visszaállítása"
                            >
                              <IoKeySharp />
                            </button>
                            <button
                              onClick={() => deleteUser(usr.id)}
                              className="btn-delete"
                              title={isSelf ? 'Saját magadat nem törölheted' : 'Törlés'}
                              disabled={isSelf}
                              style={isSelf ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                            >
                              <FaTrashAlt />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Suspend Modal */}
        {showSuspendModal && (
          <div className="modal-overlay" onClick={() => setShowSuspendModal(false)}>
            <div className="modal-content suspend-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Hirdetés felfüggesztése</h2>
              <p><strong>Hirdetés:</strong> {selectedProperty?.cim}</p>
              <p><strong>Hirdető:</strong> {selectedProperty?.hirdeto_nev}</p>
              <div className="form-group">
                <label htmlFor="suspensionReason">Felfüggesztés indoka *</label>
                <textarea
                  id="suspensionReason"
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Add meg a felfüggesztés okát (pl. Szabálytalanság, Adathiba, stb.)"
                  rows="4"
                  className="form-textarea"
                />
              </div>
              <p className="modal-note">
                <IoAlertOutline /> A hirdetés tulajdonosa értesítést fog kapni a felfüggesztésről és az indokról.
              </p>
              <div className="modal-actions">
                <button onClick={() => setShowSuspendModal(false)} className="btn-secondary">Mégse</button>
                <button onClick={handleSuspend} className="btn-suspend" disabled={!suspensionReason.trim()}>
                  <MdOutlineBlock /> Felfüggesztés
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Profile Modal */}
        {showUserModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth:'95vw',width:'960px'}}>
              <div className="modal-header">
                <h3>{selectedUser.nev} Profilja</h3>
                <button onClick={() => setShowUserModal(false)} className="modal-close">✕</button>
              </div>
              <div className="modal-body">
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem', marginBottom: '2rem', padding: '1.5rem',
                  background: 'var(--bg-light, #f8f9fa)', borderRadius: '12px',
                  border: '1px solid var(--gray-200, #e2e8f0)'
                }}>
                  <div>
                    <div style={{fontSize: '0.875rem', color: 'var(--text-secondary, #6b7280)', marginBottom: '0.25rem', fontWeight: '600'}}><MdEmail /> Email</div>
                    <div style={{fontWeight: '500'}}>{selectedUser.email}</div>
                  </div>
                  <div>
                    <div style={{fontSize: '0.875rem', color: 'var(--text-secondary, #6b7280)', marginBottom: '0.25rem', fontWeight: '600'}}><MdOutlinePhoneAndroid /> Telefon</div>
                    <div style={{fontWeight: '500'}}>{selectedUser.telefon || 'Nincs megadva'}</div>
                  </div>
                  <div>
                    <div style={{fontSize: '0.875rem', color: 'var(--text-secondary, #6b7280)', marginBottom: '0.25rem', fontWeight: '600'}}><GrUserAdmin /> Szerepkör</div>
                    <div style={{fontWeight: '500'}}>{selectedUser.szerepkor === 'admin' ? 'Admin' : 'Felhasználó'}</div>
                  </div>
                  <div>
                    <div style={{fontSize: '0.875rem', color: 'var(--text-secondary, #6b7280)', marginBottom: '0.25rem', fontWeight: '600'}}><MdEmail /> Regisztráció</div>
                    <div style={{fontWeight: '500'}}>{new Date(selectedUser.regisztracio_datum).toLocaleDateString('hu-HU')}</div>
                  </div>
                  <div>
                    <div style={{fontSize: '0.875rem', color: 'var(--text-secondary, #6b7280)', marginBottom: '0.25rem', fontWeight: '600'}}><IoMdCheckmark /> Státusz</div>
                    <div style={{fontWeight: '500'}}>{selectedUser.aktiv ? 'Aktív' : 'Inaktív'}</div>
                  </div>
                  <div>
                    <div style={{fontSize: '0.875rem', color: 'var(--text-secondary, #6b7280)', marginBottom: '0.25rem', fontWeight: '600'}}><FaHome /> Hirdetések száma</div>
                    <div style={{fontWeight: '500'}}>{selectedUserProperties.length} db</div>
                  </div>
                </div>
                <h4 style={{marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600'}}><FaHome /> Hirdetései ({selectedUserProperties.length} db)</h4>
                {selectedUserProperties.length > 0 ? (
                  <div className="table-responsive" style={{overflowX:'auto'}}>
                    <table className="admin-table" style={{tableLayout:'auto',width:'100%'}}>
                      <thead>
                        <tr>
                          <th style={{width:'60px'}}>Kép</th>
                          <th style={{minWidth:'180px'}}>Cím</th>
                          <th style={{whiteSpace:'nowrap'}}>Típus</th>
                          <th style={{minWidth:'150px',whiteSpace:'nowrap'}}>Ár</th>
                          <th style={{whiteSpace:'nowrap'}}>Megtekintések</th>
                          <th style={{whiteSpace:'nowrap'}}>Státusz</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedUserProperties.map(prop => (
                          <tr key={prop.id}>
                            <td style={{width:'60px'}}><img src={getImageUrl(prop.fo_kep)} alt={prop.cim} className="admin-thumbnail" style={{width:'56px',height:'42px',objectFit:'cover',borderRadius:'6px'}} onError={(e) => { e.target.src = 'https://via.placeholder.com/80x60?text=Nincs+kép'; }} /></td>
                            <td style={{whiteSpace:'normal',minWidth:'180px'}}><strong>{prop.cim}</strong><br/><small style={{color: 'var(--text-secondary, #6b7280)'}}>{prop.varos}</small></td>
                            <td><span className="type-badge">{prop.tipus}</span></td>
                            <td>{formatPrice(prop.ar, prop.penznem)}</td>
                            <td><FaEye /> {prop.megtekintesek}</td>
                            <td>
                              {prop.lefoglalva ? (
                                <span className="status-badge badge-reserved">Foglalt</span>
                              ) : prop.statusz === 'aktiv' ? (
                                <span className="status-badge status-active"><IoMdCheckmark /> Aktív</span>
                              ) : (
                                <span className="status-badge status-suspended"><MdOutlineBlock /> Felfüggesztve</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{textAlign: 'center', color: 'var(--text-secondary, #6b7280)', padding: '3rem', background: 'var(--bg-light, #f8f9fa)', borderRadius: '12px'}}>
                    <div style={{fontSize: '3rem', marginBottom: '1rem'}}><FaMessage /></div>
                    <p style={{margin: 0, fontSize: '1rem'}}>Még nincs hirdetése</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <Link to={`/chat/${selectedUser.id}`} className="btn btn-primary" onClick={() => setShowUserModal(false)} style={{textDecoration: 'none'}}>
                  <BiSolidMessageRounded /> Üzenet küldése
                </Link>
                <button onClick={() => setShowUserModal(false)} className="btn btn-secondary">Bezárás</button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetPasswordModal && resetPasswordUser && (
          <div className="modal-overlay" onClick={() => setShowResetPasswordModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
              <div className="modal-header">
                <h3><IoKey /> Jelszó Visszaállítása</h3>
                <button onClick={() => setShowResetPasswordModal(false)} className="modal-close">✕</button>
              </div>
              <div className="modal-body">
                <p style={{marginBottom: '1rem', color: 'var(--text-secondary, #6b7280)'}}>
                  <strong>Felhasználó:</strong> {resetPasswordUser.nev} ({resetPasswordUser.email})
                </p>
                <div className="form-group">
                  <label htmlFor="newPassword">Új Jelszó *</label>
                  <input type="text" id="newPassword" className="form-control" value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 karakter" autoFocus />
                  <small style={{color: 'var(--text-secondary, #6b7280)', marginTop: '0.5rem', display: 'block'}}>
                    <FaRegLightbulb /> A felhasználó ezzel az új jelszóval tud belépni.
                  </small>
                </div>
                <div style={{marginTop: '1rem', padding: '1rem', background: 'var(--bg-light, #f8f9fa)', borderRadius: '8px', border: '1px solid var(--gray-200, #e2e8f0)'}}>
                  <p style={{margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary, #6b7280)'}}>
                    <IoAlert /> <strong>Figyelem:</strong> Add meg az új jelszót a felhasználónak, mert a rendszer nem küldi el automatikusan!
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowResetPasswordModal(false)} className="btn btn-secondary">Mégse</button>
                <button onClick={handleResetPassword} className="btn btn-primary" disabled={!newPassword || newPassword.length < 6}>
                  Jelszó Visszaállítása
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;