import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.module.css';

const NotFoundPage: React.FC = () => {
  return (
    <div className="notfound-page">
      <h2>404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">Go Back Home</Link>
    </div>
  );
};

export default NotFoundPage;
