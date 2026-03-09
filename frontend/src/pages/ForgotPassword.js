import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Add meg az email címed!');
      return;
    }

    setLoading(true);

    try {
      await axios.post('https://api.ingatlan-projekt.com/api/auth/forgot-password', { email });
      
      setEmailSent(true);
      toast.success('Jelszó visszaállító link elküldve az email címedre!');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Hiba történt. Próbáld újra!');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div style={{textAlign: 'center'}}>
              <h1>Email Elküldve!</h1>
              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}>
                Küldtünk egy email-t a <strong>{email}</strong> címre egy jelszó visszaállító linkkel.
              </p>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                marginBottom: '2rem'
              }}>
                Ellenőrizd a spam/levélszemét mappát is!
              </p>
              <Link to="/bejelentkezes" className="btn btn-primary" style={{textDecoration: 'none'}}>
                Vissza a bejelentkezéshez
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
          <h1>Elfelejtett Jelszó</h1>
          <p style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            marginBottom: '2rem'
          }}>
            Add meg az email címed és küldünk egy jelszó visszaállító linket.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email cím</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pelda@email.hu"
                required
                autoFocus
              />
            </div>

            <button 
              type="submit" 
              className="btn-submitt"
              disabled={loading}
              style={{marginBottom: '1rem'}}
            >
              {loading ? 'Küldés...' : 'Link küldése'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Emlékszel a jelszóra? <Link to="/bejelentkezes">Bejelentkezés</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;