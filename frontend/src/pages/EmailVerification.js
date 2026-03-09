import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MdClose } from "react-icons/md";
import { IoMdCheckmark } from "react-icons/io";


const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        toast.error('Hiányzó token!');
        return;
      }

      try {
        const res = await axios.post('https://api.ingatlan-projekt.com/api/auth/verify-email', {
          token
        });

        if (res.data.success) {
          setStatus('success');
          toast.success('Email cím sikeresen megerősítve! 🎉');
          
          // 3 másodperc múlva átirányítás a bejelentkezéshez
          setTimeout(() => {
            navigate('/bejelentkezes');
          }, 3000);
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        toast.error(error.response?.data?.message || 'Hiba történt az email megerősítése során');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {status === 'loading' && (
            <div style={{ textAlign: 'center' }}>
              <div className="spinner"></div>
              <h1>Email megerősítése...</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Kérjük várj, amíg megerősítjük az email címed.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}><IoMdCheckmark /></div>
              <h1>Email Megerősítve!</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Az email címed sikeresen megerősítésre került.
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Átirányítás a bejelentkezéshez...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}><MdClose /></div>
              <h1>Hiba történt</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Az email cím megerősítése sikertelen volt.
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                A link érvénytelen vagy már felhasználásra került.
              </p>
              <Link to="/bejelentkezes" className="btn btn-primary">
                Vissza a bejelentkezéshez
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;