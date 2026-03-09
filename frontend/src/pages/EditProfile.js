import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const EditProfile = () => {
  const { user, loading: authLoading, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formData, setFormData] = useState({
    nev: '',
    email: '',
    telefon: '',
    jelenlegi_jelszo: '',
    uj_jelszo: '',
    uj_jelszo_megerosites: ''
  });

  React.useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toast.warning('Jelentkezz be a profil szerkesztéséhez!');
      navigate('/bejelentkezes');
      return;
    }

    setFormData({
      nev: user.nev || '',
      email: user.email || '',
      telefon: user.telefon || '',
      jelenlegi_jelszo: '',
      uj_jelszo: '',
      uj_jelszo_megerosites: ''
    });

    // JAVÍTÁS: perjel ellenőrzés hogy ne ragadjon össze az URL
    if (user.profilkep) {
      const imgPath = user.profilkep.startsWith('/') ? user.profilkep : `/${user.profilkep}`;
      setPreviewUrl(`https://api.ingatlan-projekt.com${imgPath}`);
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('A kép maximum 2MB lehet!');
        return;
      }
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.uj_jelszo) {
      if (!formData.jelenlegi_jelszo) {
        toast.error('Add meg a jelenlegi jelszavadat!');
        return;
      }
      if (formData.uj_jelszo.length < 6) {
        toast.error('Az új jelszónak legalább 6 karakter hosszúnak kell lennie!');
        return;
      }
      if (formData.uj_jelszo !== formData.uj_jelszo_megerosites) {
        toast.error('Az új jelszavak nem egyeznek!');
        return;
      }
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('nev', formData.nev);
      data.append('email', formData.email);
      data.append('telefon', formData.telefon);
      
      if (formData.uj_jelszo) {
        data.append('jelenlegi_jelszo', formData.jelenlegi_jelszo);
        data.append('uj_jelszo', formData.uj_jelszo);
      }

      if (profileImage) {
        data.append('profilkep', profileImage);
      }

      await axios.put('https://api.ingatlan-projekt.com/api/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Profil sikeresen frissítve!');
      
      const res = await axios.get('https://api.ingatlan-projekt.com/api/auth/me');
      updateUser(res.data.user);

      setFormData(prev => ({
        ...prev,
        jelenlegi_jelszo: '',
        uj_jelszo: '',
        uj_jelszo_megerosites: ''
      }));

      setTimeout(() => {
        navigate('/profil');
      }, 1000);
    } catch (error) {
      console.error('Profil frissítés hiba:', error);
      toast.error(error.response?.data?.message || 'Hiba a profil frissítésekor');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="edit-profile-page">
      <div className="container">
        <h1>Profil Szerkesztése</h1>
        <p className="page-subtitle">Módosítsd adataidat és profilképedet</p>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="profile-image-section">
            <h2>Profilkép</h2>
            <div className="image-upload-wrapper">
              <div className="current-profile-image">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt={user.nev}
                    onError={(e) => {
                      setPreviewUrl('');
                    }}
                  />
                ) : (
                  <div className="avatar-large">
                    {user.nev.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="upload-controls">
                <label htmlFor="profileImage" className="btn-upload">
                  Új kép feltöltése
                </label>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <p className="upload-hint">Maximum 2MB, JPG vagy PNG</p>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Személyes adatok</h2>
            
            <div className="form-group">
              <label>Teljes név *</label>
              <input
                type="text"
                name="nev"
                value={formData.nev}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email cím *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Telefonszám</label>
              <input
                type="tel"
                name="telefon"
                value={formData.telefon}
                onChange={handleChange}
                placeholder="+36 30 123 4567"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Jelszó módosítása (opcionális)</h2>
            
            <div className="form-group">
              <label>Jelenlegi jelszó</label>
              <input
                type="password"
                name="jelenlegi_jelszo"
                value={formData.jelenlegi_jelszo}
                onChange={handleChange}
                placeholder="Add meg a jelenlegi jelszavad"
              />
            </div>

            <div className="form-group">
              <label>Új jelszó</label>
              <input
                type="password"
                name="uj_jelszo"
                value={formData.uj_jelszo}
                onChange={handleChange}
                placeholder="Minimum 6 karakter"
              />
            </div>

            <div className="form-group">
              <label>Új jelszó megerősítése</label>
              <input
                type="password"
                name="uj_jelszo_megerosites"
                value={formData.uj_jelszo_megerosites}
                onChange={handleChange}
                placeholder="Írd be újra az új jelszót"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/profil')} className="btn-cancel">
              Mégse
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Mentés...' : 'Változtatások mentése'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;