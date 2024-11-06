import React from 'react';
import './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Stay and Flex. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
