import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { IoMdClose } from "react-icons/io";


const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error('Érvénytelen vagy hiányzó token!');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.password || !formData.confirmPassword) {
      toast.error('Töltsd ki az összes mezőt!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A jelszónak legalább 6 karakter hosszúnak kell lennie!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('A jelszavak nem egyeznek!');
      return;
    }

    setLoading(true);

    try {
      await axios.post('https://api.ingatlan-projekt.com/api/auth/reset-password', {
        token,
        newPassword: formData.password
      });
      
      toast.success('Jelszó sikeresen megváltoztatva! Most már bejelentkezhetsz.');
      setTimeout(() => {
        navigate('/bejelentkezes');
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.message || 'Hiba történt. A link lehet lejárt.');
      setTokenValid(false);
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '4rem', marginBottom: '1rem'}}><IoMdClose /></div>
              <h1>Érvénytelen Link</h1>
              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}>
                Ez a jelszó visszaállító link érvénytelen vagy már lejárt.
              </p>
              <Link to="/elfelejtett-jelszo" className="btn btn-primary" style={{textDecoration: 'none'}}>
                Új Link Kérése
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Új Jelszó Beállítása</h1>
          <p style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            marginBottom: '2rem'
          }}>
            Add meg az új jelszavad.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Új Jelszó</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 karakter"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Jelszó Megerősítése</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Add meg újra a jelszót"
                required
              />
            </div>

            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p style={{color: 'var(--danger-color)', fontSize: '0.875rem', marginBottom: '1rem'}}>
                 A jelszavak nem egyeznek!
              </p>
            )}

            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading || (formData.password !== formData.confirmPassword)}
            >
              {loading ? 'Mentés...' : 'Jelszó Mentése'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              <Link to="/bejelentkezes">Vissza a bejelentkezéshez</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
