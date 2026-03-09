import React from 'react';
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; 2026 IngatlanKínálat. Minden jog fenntartva.</p>
        <a href="https://github.com/nnorbert123/ingatlan-projekt" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
          <FaGithub size={24} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;