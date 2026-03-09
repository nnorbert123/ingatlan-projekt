import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <div className="not-found-animation">
            
          </div>
          <h2>Oldal nem található</h2>
          <p>Sajnáljuk, a keresett oldal nem létezik vagy áthelyezésre került.</p>
          <p className="error-subtext">Talán az általad keresett ingatlan már elkelt?</p>
          <div className="not-found-actions">
            <Link to="/" className="btn-primary">Vissza a kezdőlapra</Link>
            <Link to="/ingatlanok" className="btn-secondary">Ingatlanok böngészése</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
