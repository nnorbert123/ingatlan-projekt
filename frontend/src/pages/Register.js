import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    nev: '',
    email: '',
    password: '',
    passwordConfirm: '',
    telefon: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validáció
    if (!formData.nev || !formData.email || !formData.password) {
      toast.error('Kérlek töltsd ki a kötelező mezőket!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A jelszónak legalább 6 karakter hosszúnak kell lennie!');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error('A jelszavak nem egyeznek!');
      return;
    }

    setLoading(true);

    try {
      await register(formData.nev, formData.email, formData.password, formData.telefon);
      toast.success('Sikeres regisztráció! Üdvözlünk!');
      navigate('/');
    } catch (error) {
      console.error('Regisztráció hiba:', error);
      toast.error(error.response?.data?.message || 'Hiba a regisztráció során!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Regisztráció</h1>
          <p className="auth-subtitle">Hozz létre egy új fiókot</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nev">Teljes név *</label>
              <input
                type="text"
                id="nev"
                name="nev"
                value={formData.nev}
                onChange={handleChange}
                placeholder="Kovács István"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email cím *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="pelda@email.hu"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefon">Telefonszám</label>
              <input
                type="tel"
                id="telefon"
                name="telefon"
                value={formData.telefon}
                onChange={handleChange}
                placeholder="+36 30 123 4567"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Jelszó *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 karakter"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirm">Jelszó megerősítése *</label>
              <input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                placeholder="Írd be újra a jelszót"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Regisztráció...' : 'Regisztráció'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Van már fiókod? <Link to="/bejelentkezes">Jelentkezz be itt</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
