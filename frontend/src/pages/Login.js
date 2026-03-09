import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
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
    if (!formData.email || !formData.password) {
      toast.error('Kérlek töltsd ki az összes mezőt!');
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Sikeres bejelentkezés!');
      navigate('/');
    } catch (error) {
      console.error('Login hiba:', error);
      toast.error(error.response?.data?.message || 'Hibás email vagy jelszó!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Bejelentkezés</h1>
          <p className="auth-subtitle">Jelentkezz be a fiókodba</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email cím</label>
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
              <label htmlFor="password">Jelszó</label>
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

            <div style={{textAlign: 'right', marginBottom: '1rem'}}>
              <Link 
                to="/elfelejtett-jelszo" 
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--primary-color)',
                  textDecoration: 'none'
                }}
              >
                Elfelejtett jelszó?
              </Link>
            </div>

            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Nincs még fiókod? <Link to="/regisztracio">Regisztrálj itt</Link></p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;