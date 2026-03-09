import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import AdvancedImageUploader from '../components/AdvancedImageUploader';

const EditProperty = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageItems, setImageItems] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [formData, setFormData] = useState({
    cim: '', leiras: '', tipus: 'lakas', tranzakcio_tipus: 'elado',
    ar: '', penznem: 'HUF', varos: '', kerulet: '', iranyitoszam: '',
    utca: '', hazszam: '', alapterulet: '', szobak_szama: '', furdok_szama: '',
    emelet: '', osszkomfort: false, epitesi_ev: '', allapot: 'felujitando', statusz: 'aktiv'
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { toast.warning('Jelentkezz be a szerkesztéshez!'); navigate('/bejelentkezes'); return; }
    fetchProperty();
  }, [user, authLoading, id, navigate]);

  const fetchProperty = async () => {
    try {
      const res = await axios.get(`https://api.ingatlan-projekt.com/api/properties/${id}`);
      const property = res.data.data.property || res.data.data;
      const images = res.data.data.images || [];

      if (property.felhasznalo_id !== user.id && user.szerepkor !== 'admin') {
        toast.error('Nincs jogosultságod ehhez a hirdetéshez!');
        navigate('/profil');
        return;
      }

      setFormData({
        cim: property.cim || '', leiras: property.leiras || '',
        tipus: property.tipus || 'lakas', tranzakcio_tipus: property.tranzakcio_tipus || 'elado',
        ar: property.ar?.toString() || '', penznem: property.penznem || 'HUF',
        varos: property.varos || '', kerulet: property.kerulet || '',
        iranyitoszam: property.iranyitoszam || '', utca: property.utca || '',
        hazszam: property.hazszam || '', alapterulet: property.alapterulet?.toString() || '',
        szobak_szama: property.szobak_szama?.toString() || '',
        furdok_szama: property.furdok_szama?.toString() || '',
        emelet: property.emelet?.toString() || '',
        osszkomfort: property.osszkomfort === 1 || property.osszkomfort === true,
        epitesi_ev: property.epitesi_ev?.toString() || '',
        allapot: property.allapot || 'felujitando', statusz: property.statusz || 'aktiv'
      });

      setExistingImages(images);
    } catch (error) {
      console.error('Hiba:', error);
      toast.error('Az ingatlan betöltése sikertelen');
      navigate('/profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleDeleteExistingImage = (imageId) => {
    setDeletedImageIds(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cim || !formData.ar || !formData.varos || !formData.alapterulet) {
      toast.error('Töltsd ki a kötelező mezőket!'); return;
    }
    // Ellenőrzés: kell legalább 1 kép
    const totalImages = existingImages.length + imageItems.length;
    if (totalImages === 0) {
      toast.error('Legalább 1 képet meg kell tartani vagy hozzá kell adni!');
      return;
    }

    setSaving(true);
    try {
      await axios.put(`https://api.ingatlan-projekt.com/api/properties/${id}`, formData);

      // Törölt képek törlése
      for (const imageId of deletedImageIds) {
        await axios.delete(`https://api.ingatlan-projekt.com/api/properties/${id}/images/${imageId}`);
      }

      // Új képek feltöltése
      if (imageItems.length > 0) {
        const data = new FormData();
        imageItems.forEach((item) => { data.append('images', item.file); });
        await axios.post(`https://api.ingatlan-projekt.com/api/properties/${id}/images`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success('Hirdetés sikeresen frissítve!');
      navigate('/profil');
    } catch (error) {
      console.error('Frissítési hiba:', error);
      toast.error(error.response?.data?.message || 'Hiba a frissítés során');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container loading"><p>Betöltés...</p></div>;

  return (
    <div className="edit-property-page">
      <div className="container">
        <h1>Hirdetés Szerkesztése</h1>
        <p className="page-subtitle">Módosítsd az ingatlan adatait</p>
        <form onSubmit={handleSubmit} className="property-form">
          <div className="form-section">
            <h2>Alapadatok</h2>
            <div className="form-group">
              <label>Cím *</label>
              <input type="text" name="cim" value={formData.cim} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Részletes leírás</label>
              <textarea name="leiras" rows="5" value={formData.leiras} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Típus *</label>
                <select name="tipus" value={formData.tipus} onChange={handleChange} required>
                  <option value="lakas">Lakás</option>
                  <option value="haz">Ház</option>
                  <option value="telek">Telek</option>
                  <option value="iroda">Iroda</option>
                  <option value="garázs">Garázs</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tranzakció *</label>
                <select name="tranzakcio_tipus" value={formData.tranzakcio_tipus} onChange={handleChange} required>
                  <option value="elado">Eladó</option>
                  <option value="kiado">Kiadó</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Ár *</label>
                <input type="number" name="ar" value={formData.ar} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Pénznem</label>
                <select name="penznem" value={formData.penznem} onChange={handleChange}>
                  <option value="HUF">HUF</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Státusz</label>
              <select name="statusz" value={formData.statusz} onChange={handleChange}>
                <option value="aktiv">Aktív</option>
                <option value="inaktiv">Inaktív</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h2>Helyszín</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Város *</label>
                <input type="text" name="varos" value={formData.varos} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Kerület</label>
                <input type="text" name="kerulet" value={formData.kerulet} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Irányítószám</label>
                <input type="text" name="iranyitoszam" value={formData.iranyitoszam} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Utca</label>
                <input type="text" name="utca" value={formData.utca} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Házszám</label>
                <input type="text" name="hazszam" value={formData.hazszam} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Ingatlan jellemzők</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Alapterület (m²) *</label>
                <input type="number" name="alapterulet" value={formData.alapterulet} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Szobák száma</label>
                <input type="number" name="szobak_szama" value={formData.szobak_szama} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Fürdők száma</label>
                <input type="number" name="furdok_szama" value={formData.furdok_szama} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Emelet</label>
                <input type="number" name="emelet" value={formData.emelet} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Építés éve</label>
                <input type="number" name="epitesi_ev" value={formData.epitesi_ev} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Állapot</label>
                <select name="allapot" value={formData.allapot} onChange={handleChange}>
                  <option value="uj">Új</option>
                  <option value="felujitott">Felújított</option>
                  <option value="felujitando">Felújítandó</option>
                  <option value="bontas">Bontás</option>
                </select>
              </div>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" name="osszkomfort" checked={formData.osszkomfort} onChange={handleChange} />
                <span>Összkomfortos</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h2>Képek kezelése</h2>

            {existingImages.length > 0 && (
              <div className="existing-images-section">
                <h3>Jelenlegi képek ({existingImages.length} db)</h3>
                <div className="existing-images-grid">
                  {existingImages.map((img, index) => (
                    <div key={img.id} className="existing-image-item">
                      <img
                        src={`https://api.ingatlan-projekt.com/uploads/properties/${img.fajlnev}`}
                        alt={`Kép ${index + 1}`}
                      />
                      {img.fo_kep === 1 && <span className="existing-image-primary">Főkép</span>}
                      <button
                        type="button"
                        className="existing-image-delete"
                        onClick={() => handleDeleteExistingImage(img.id)}
                        title="Kép törlése"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="new-images-section">
              <h3>Új képek hozzáadása</h3>
              <AdvancedImageUploader
                images={imageItems}
                onChange={setImageItems}
                maxImages={30 - existingImages.length}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/profil')} className="btn-cancel">Mégse</button>
            <button type="submit" className="btn-submit" disabled={saving}>
              {saving ? 'Mentés...' : 'Változtatások mentése'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;
