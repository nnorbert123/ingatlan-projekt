import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import AdvancedImageUploader from '../components/AdvancedImageUploader';

const LEPESEK = [
  { szam: 1, nev: 'Alapadatok' },
  { szam: 2, nev: 'Részletek' },
  { szam: 3, nev: 'Helyszín' },
  { szam: 4, nev: 'Képek' },
  { szam: 5, nev: 'Összesítés' },
];

const AddProperty = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageItems, setImageItems] = useState([]);
  const [lepes, setLepes] = useState(1);
  const [formData, setFormData] = useState({
    cim: '',
    leiras: '',
    tipus: 'lakas',
    tranzakcio_tipus: 'elado',
    ar: '',
    penznem: 'HUF',
    varos: '',
    kerulet: '',
    iranyitoszam: '',
    utca: '',
    hazszam: '',
    alapterulet: '',
    szobak_szama: '',
    furdok_szama: '',
    emelet: '',
    osszkomfort: false,
    epitesi_ev: '',
    allapot: 'felujitando'
  });

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.warning('Jelentkezz be hirdetés feladásához!');
      navigate('/bejelentkezes');
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImagesChange = (newImages) => {
    setImageItems(newImages);
  };

  const kovetkezo = () => {
    if (lepes === 4 && imageItems.length === 0) {
      toast.error('Legalább 1 képet fel kell töltened!');
      document.querySelector('.advanced-image-uploader')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.querySelector('.advanced-image-uploader')?.classList.add('required-empty');
      return;
    }
    document.querySelector('.advanced-image-uploader')?.classList.remove('required-empty');
    if (lepes < 5) setLepes(lepes + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const vissza = () => {
    if (lepes > 1) setLepes(lepes - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cim || !formData.ar || !formData.varos || !formData.alapterulet) {
      toast.error('Töltsd ki a kötelező mezőket!');
      return;
    }
    if (imageItems.length === 0) {
      toast.error('Legalább 1 képet fel kell töltened!');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      imageItems.forEach((item, index) => {
        data.append('images', item.file);
        if (item.isPrimary) data.append('primaryImageIndex', index);
      });

      await axios.post('https://api.ingatlan-projekt.com/api/properties', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Hirdetés sikeresen feladva!');
      navigate('/profil');
    } catch (error) {
      console.error('Hirdetés feladási hiba:', error);
      toast.error(error.response?.data?.message || 'Hiba a hirdetés feladásakor');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const arFormatted = formData.ar ? parseInt(formData.ar).toLocaleString('hu-HU') : '—';

  return (
    <>
      <style>{`
        .ap-wrapper {
          background: #f8f7f4;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
        }
        .ap-fejlec {
          background: #0c132a;
          color: white;
          padding: 52px 5% 44px;
        }
        .ap-fejlec-felirat {
          font-size: 0.7rem;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #facc15;
          margin-bottom: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ap-fejlec-felirat::before {
          content: '';
          display: block;
          width: 26px;
          height: 2px;
          background: #facc15;
          border-radius: 2px;
        }
        .ap-fejlec-cim {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 900;
          line-height: 1.15;
          margin-bottom: 10px;
        }
        .ap-fejlec-cim em {
          font-style: italic;
          color: #facc15;
        }
        .ap-fejlec-al {
          color: rgba(255,255,255,0.6);
          font-size: 0.95rem;
        }
        .ap-burok {
          max-width: 860px;
          margin: 0 auto;
          padding: 48px 5% 80px;
        }
        .ap-urlap-cim {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 700;
          color: #0c132a;
          margin-bottom: 6px;
        }
        .ap-elvalaszto {
          width: 48px;
          height: 3px;
          background: #facc15;
          border-radius: 2px;
          margin-bottom: 36px;
        }
        /* Lépésjelző */
        .ap-lepesek {
          display: flex;
          align-items: center;
          margin-bottom: 40px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .ap-lepesek::-webkit-scrollbar { display: none; }
        .ap-lepes {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-shrink: 0;
          cursor: pointer;
        }
        .ap-lepes-szam {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid #e5e0d8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          color: #6b7280;
          font-weight: 500;
          background: white;
          transition: all 0.3s;
        }
        .ap-lepes.aktiv .ap-lepes-szam {
          background: #0c132a;
          border-color: #0c132a;
          color: #facc15;
          font-weight: 700;
          box-shadow: 0 4px 14px rgba(12,19,42,0.22);
        }
        .ap-lepes.kesz .ap-lepes-szam {
          background: #facc15;
          border-color: #facc15;
          color: #0c132a;
          font-weight: 700;
        }
        .ap-lepes-nev {
          font-size: 0.76rem;
          color: #6b7280;
          white-space: nowrap;
        }
        .ap-lepes.aktiv .ap-lepes-nev {
          color: #0c132a;
          font-weight: 600;
        }
        .ap-lepes.kesz .ap-lepes-nev {
          color: #d4a800;
        }
        .ap-osszekoto {
          width: 28px;
          height: 2px;
          background: #e5e0d8;
          flex-shrink: 0;
          margin: 0 4px;
        }
        /* Panel */
        .ap-panel {
          background: white;
          border-radius: 14px;
          border: 1.5px solid #e5e0d8;
          padding: 32px 28px;
          box-shadow: 0 4px 24px rgba(12,19,42,0.07);
          animation: apPanelBe 0.35s ease;
        }
        @keyframes apPanelBe {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ap-szekcio-cim {
          font-size: 0.7rem;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          color: #0c132a;
          margin-bottom: 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ap-szekcio-cim::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e0d8;
        }
        /* Form elemek */
        .ap-mezo {
          display: flex;
          flex-direction: column;
          margin-bottom: 20px;
        }
        .ap-mezo label {
          font-size: 0.72rem;
          font-weight: 600;
          color: #6b7280;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }
        .ap-mezo input,
        .ap-mezo select,
        .ap-mezo textarea {
          border: 1.5px solid #e5e0d8;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 0.92rem;
          font-family: 'DM Sans', sans-serif;
          background: #f8f7f4;
          color: #0c132a;
          outline: none;
          transition: all 0.3s;
        }
        .ap-mezo input:focus,
        .ap-mezo select:focus,
        .ap-mezo textarea:focus {
          border-color: #facc15;
          background: white;
          box-shadow: 0 0 0 3px rgba(250,204,21,0.15);
        }
        .ap-mezo textarea {
          resize: vertical;
          min-height: 110px;
        }
        .ap-racs-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .ap-racs-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }
        /* Checkbox */
        .ap-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 12px 14px;
          border: 1.5px solid #e5e0d8;
          border-radius: 10px;
          background: #f8f7f4;
          transition: all 0.3s;
          user-select: none;
          margin-bottom: 20px;
        }
        .ap-checkbox:hover {
          border-color: #0c132a;
          background: white;
        }
        .ap-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #0c132a;
          cursor: pointer;
        }
        .ap-checkbox span {
          font-size: 0.9rem;
          color: #0c132a;
          font-weight: 500;
        }
        /* Ár előnézet */
        .ap-ar-elonezet {
          background: #0c132a;
          border-radius: 14px;
          padding: 20px 24px;
          margin-bottom: 20px;
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .ap-ar-szam {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #facc15;
        }
        .ap-ar-penznem {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.45);
        }
        /* Info doboz */
        .ap-info-doboz {
          background: rgba(12,19,42,0.04);
          border: 1px solid rgba(12,19,42,0.1);
          border-left: 3px solid #0c132a;
          border-radius: 0 10px 10px 0;
          padding: 12px 16px;
          font-size: 0.86rem;
          color: #6b7280;
          margin-bottom: 22px;
          line-height: 1.65;
        }
        .ap-info-doboz strong { color: #0c132a; }
        /* Összesítés */
        .ap-osszesites-sor {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f0ede6;
          font-size: 0.9rem;
        }
        .ap-osszesites-sor:last-child { border-bottom: none; }
        .ap-osszesites-label { color: #6b7280; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .ap-osszesites-ertek { color: #0c132a; font-weight: 600; }
        /* Gomb sor */
        .ap-gomb-sor {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 32px;
          flex-wrap: wrap;
        }
        .ap-gomb-fo {
          background: #0c132a;
          color: #facc15;
          border: none;
          padding: 13px 34px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.84rem;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 18px rgba(12,19,42,0.2);
        }
        .ap-gomb-fo:hover:not(:disabled) {
          background: #1a2340;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(12,19,42,0.28);
        }
        .ap-gomb-fo:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ap-gomb-masod {
          background: transparent;
          border: 1.5px solid #e5e0d8;
          color: #6b7280;
          padding: 13px 28px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.84rem;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .ap-gomb-masod:hover {
          border-color: #0c132a;
          color: #0c132a;
          transform: translateY(-1px);
        }
        .ap-gomb-siker {
          background: #facc15;
          color: #0c132a;
          border: none;
          padding: 15px 44px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 6px 20px rgba(250,204,21,0.35);
        }
        .ap-gomb-siker:hover:not(:disabled) {
          background: #d4a800;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(250,204,21,0.45);
        }
        .ap-gomb-siker:disabled { opacity: 0.6; cursor: not-allowed; }
        @media (max-width: 600px) {
          .ap-racs-2, .ap-racs-3 { grid-template-columns: 1fr; }
          .ap-panel { padding: 22px 16px; }
          .ap-fejlec { padding: 36px 5% 32px; }
          .ap-lepes-nev { display: none; }
          .ap-lepes.aktiv .ap-lepes-nev { display: block; }
          .ap-osszekoto { width: 14px; }
          .ap-gomb-sor { justify-content: stretch; }
          .ap-gomb-fo, .ap-gomb-masod, .ap-gomb-siker { flex: 1; text-align: center; padding: 13px 16px; }
        }
      `}</style>

      <div className="ap-wrapper">
        {/* Fejléc */}
        <div className="ap-fejlec">
          <p className="ap-fejlec-felirat">Hirdetés feladása</p>
          <h1 className="ap-fejlec-cim">Add el vagy add ki<br /><em>ingatlanodat</em> könnyedén</h1>
          <p className="ap-fejlec-al">Töltsd fel képeidet, adj meg néhány adatot, és hirdetésed perceken belül megjelenik.</p>
        </div>

        <div className="ap-burok">
          <p className="ap-urlap-cim">Töltsd ki lépésről lépésre</p>
          <div className="ap-elvalaszto"></div>

          {/* Lépésjelző */}
          <div className="ap-lepesek">
            {LEPESEK.map((l, i) => (
              <React.Fragment key={l.szam}>
                <div
                  className={`ap-lepes ${lepes === l.szam ? 'aktiv' : ''} ${lepes > l.szam ? 'kesz' : ''}`}
                  onClick={() => lepes > l.szam && setLepes(l.szam)}
                >
                  <div className="ap-lepes-szam">
                    {lepes > l.szam ? '✓' : l.szam}
                  </div>
                  <div className="ap-lepes-nev">{l.nev}</div>
                </div>
                {i < LEPESEK.length - 1 && <div className="ap-osszekoto"></div>}
              </React.Fragment>
            ))}
          </div>

          {/* 1. lépés – Alapadatok */}
          {lepes === 1 && (
            <div className="ap-panel">
              <div className="ap-szekcio-cim">Alapadatok</div>

              <div className="ap-mezo">
                <label>Hirdetés címe *</label>
                <input
                  type="text"
                  name="cim"
                  placeholder="pl. Modern lakás a belvárosban"
                  value={formData.cim}
                  onChange={handleChange}
                />
              </div>

              <div className="ap-mezo">
                <label>Részletes leírás</label>
                <textarea
                  name="leiras"
                  placeholder="Írd le részletesen az ingatlan jellemzőit..."
                  value={formData.leiras}
                  onChange={handleChange}
                />
              </div>

              <div className="ap-racs-2">
                <div className="ap-mezo">
                  <label>Ingatlan típusa *</label>
                  <select name="tipus" value={formData.tipus} onChange={handleChange}>
                    <option value="lakas">Lakás</option>
                    <option value="haz">Ház</option>
                    <option value="telek">Telek</option>
                    <option value="iroda">Iroda</option>
                    <option value="garázs">Garázs</option>
                  </select>
                </div>
                <div className="ap-mezo">
                  <label>Hirdetés típusa *</label>
                  <select name="tranzakcio_tipus" value={formData.tranzakcio_tipus} onChange={handleChange}>
                    <option value="elado">Eladó</option>
                    <option value="kiado">Kiadó</option>
                  </select>
                </div>
              </div>

              {formData.ar && (
                <div className="ap-ar-elonezet">
                  <div className="ap-ar-szam">{arFormatted}</div>
                  <div className="ap-ar-penznem">{formData.penznem}</div>
                </div>
              )}

              <div className="ap-racs-2">
                <div className="ap-mezo">
                  <label>Ár *</label>
                  <input
                    type="number"
                    name="ar"
                    placeholder="85000000"
                    value={formData.ar}
                    onChange={handleChange}
                  />
                </div>
                <div className="ap-mezo">
                  <label>Pénznem</label>
                  <select name="penznem" value={formData.penznem} onChange={handleChange}>
                    <option value="HUF">HUF</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div className="ap-gomb-sor">
                <button className="ap-gomb-fo" type="button" onClick={kovetkezo}>Tovább →</button>
              </div>
            </div>
          )}

          {/* 2. lépés – Részletek */}
          {lepes === 2 && (
            <div className="ap-panel">
              <div className="ap-szekcio-cim">Ingatlan részletei</div>

              <div className="ap-racs-3">
                <div className="ap-mezo">
                  <label>Alapterület (m²) *</label>
                  <input
                    type="number"
                    name="alapterulet"
                    placeholder="95"
                    value={formData.alapterulet}
                    onChange={handleChange}
                  />
                </div>
                <div className="ap-mezo">
                  <label>Szobák száma</label>
                  <input
                    type="number"
                    name="szobak_szama"
                    placeholder="3"
                    value={formData.szobak_szama}
                    onChange={handleChange}
                  />
                </div>
                <div className="ap-mezo">
                  <label>Fürdők száma</label>
                  <input
                    type="number"
                    name="furdok_szama"
                    placeholder="2"
                    value={formData.furdok_szama}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="ap-racs-3">
                <div className="ap-mezo">
                  <label>Emelet</label>
                  <input
                    type="number"
                    name="emelet"
                    placeholder="5"
                    value={formData.emelet}
                    onChange={handleChange}
                  />
                </div>
                <div className="ap-mezo">
                  <label>Építés éve</label>
                  <input
                    type="number"
                    name="epitesi_ev"
                    placeholder="2018"
                    value={formData.epitesi_ev}
                    onChange={handleChange}
                  />
                </div>
                <div className="ap-mezo">
                  <label>Állapot</label>
                  <select name="allapot" value={formData.allapot} onChange={handleChange}>
                    <option value="uj">Új</option>
                    <option value="felujitott">Felújított</option>
                    <option value="felujitando">Felújítandó</option>
                    <option value="bontas">Bontás</option>
                  </select>
                </div>
              </div>

              <label className="ap-checkbox">
                <input
                  type="checkbox"
                  name="osszkomfort"
                  checked={formData.osszkomfort}
                  onChange={handleChange}
                />
                <span>Összkomfortos ingatlan</span>
              </label>

              <div className="ap-gomb-sor">
                <button className="ap-gomb-masod" type="button" onClick={vissza}>← Vissza</button>
                <button className="ap-gomb-fo" type="button" onClick={kovetkezo}>Tovább →</button>
              </div>
            </div>
          )}

          {/* 3. lépés – Helyszín */}
          {lepes === 3 && (
            <div className="ap-panel">
              <div className="ap-szekcio-cim">Helyszín</div>

              <div className="ap-racs-2">
                <div className="ap-mezo">
                  <label>Város *</label>
                  <input
                    type="text"
                    name="varos"
                    placeholder="Budapest"
                    value={formData.varos}
                    onChange={handleChange}
                  />
                </div>
                <div className="ap-mezo">
                  <label>Kerület / Megye</label>
                  <input
                    type="text"
                    name="kerulet"
                    placeholder="V. kerület"
                    value={formData.kerulet}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="ap-racs-3">
                <div className="ap-mezo">
                  <label>Irányítószám</label>
                  <input
                    type="text"
                    name="iranyitoszam"
                    placeholder="1051"
                    value={formData.iranyitoszam}
                    onChange={handleChange}
                  />
                </div>
                <div className="ap-mezo">
                  <label>Utca</label>
                  <input
                    type="text"
                    name="utca"
                    placeholder="Fő utca"
                    value={formData.utca}
                    onChange={handleChange}
                  />
                </div>
                <div className="ap-mezo">
                  <label>Házszám</label>
                  <input
                    type="text"
                    name="hazszam"
                    placeholder="12"
                    value={formData.hazszam}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="ap-gomb-sor">
                <button className="ap-gomb-masod" type="button" onClick={vissza}>← Vissza</button>
                <button className="ap-gomb-fo" type="button" onClick={kovetkezo}>Tovább →</button>
              </div>
            </div>
          )}

          {/* 4. lépés – Képek */}
          {lepes === 4 && (
            <div className="ap-panel">
              <div className="ap-szekcio-cim">Képek feltöltése</div>
              <div className="ap-info-doboz">
                <strong>Tipp:</strong> Az első kép lesz a főkép. Húzd a képeket a rendezéshez, vágd ki őket, vagy állíts be másik főképet. A jó minőségű képek <strong>háromszor több érdeklődőt</strong> vonzanak!
              </div>
              <AdvancedImageUploader
                images={imageItems}
                onChange={handleImagesChange}
                maxImages={30}
              />
              <div className="ap-gomb-sor">
                <button className="ap-gomb-masod" type="button" onClick={vissza}>← Vissza</button>
                <button className="ap-gomb-fo" type="button" onClick={kovetkezo}>Tovább →</button>
              </div>
            </div>
          )}

          {/* 5. lépés – Összesítés */}
          {lepes === 5 && (
            <div className="ap-panel">
              <div className="ap-szekcio-cim">Összesítés</div>

              <div className="ap-info-doboz">
                Ellenőrizd az adatokat, majd kattints a <strong>Hirdetés feladása</strong> gombra.
              </div>

              {formData.ar && (
                <div className="ap-ar-elonezet" style={{ marginBottom: 24 }}>
                  <div className="ap-ar-szam">{arFormatted}</div>
                  <div className="ap-ar-penznem">{formData.penznem}</div>
                </div>
              )}

              <div className="ap-osszesites-sor">
                <span className="ap-osszesites-label">Cím</span>
                <span className="ap-osszesites-ertek">{formData.cim || '—'}</span>
              </div>
              <div className="ap-osszesites-sor">
                <span className="ap-osszesites-label">Típus</span>
                <span className="ap-osszesites-ertek">{formData.tipus} · {formData.tranzakcio_tipus}</span>
              </div>
              <div className="ap-osszesites-sor">
                <span className="ap-osszesites-label">Helyszín</span>
                <span className="ap-osszesites-ertek">{[formData.iranyitoszam, formData.varos, formData.utca, formData.hazszam].filter(Boolean).join(', ') || '—'}</span>
              </div>
              <div className="ap-osszesites-sor">
                <span className="ap-osszesites-label">Alapterület</span>
                <span className="ap-osszesites-ertek">{formData.alapterulet ? `${formData.alapterulet} m²` : '—'}</span>
              </div>
              <div className="ap-osszesites-sor">
                <span className="ap-osszesites-label">Szobák</span>
                <span className="ap-osszesites-ertek">{formData.szobak_szama || '—'}</span>
              </div>
              <div className="ap-osszesites-sor">
                <span className="ap-osszesites-label">Állapot</span>
                <span className="ap-osszesites-ertek">{formData.allapot}</span>
              </div>
              <div className="ap-osszesites-sor">
                <span className="ap-osszesites-label">Képek</span>
                <span className="ap-osszesites-ertek">{imageItems.length} db</span>
              </div>

              <div className="ap-gomb-sor">
                <button className="ap-gomb-masod" type="button" onClick={vissza}>← Vissza</button>
                <button
                  className="ap-gomb-siker"
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Feltöltés...' : '✓ Hirdetés feladása'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AddProperty;