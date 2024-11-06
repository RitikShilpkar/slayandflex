import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css'; // Import CSS module

const HomePage: React.FC = () => {
  return (
    <div className={styles['home-page']}>
      <div className={styles['options']}>
        <Link to="/brand-promotion" className={styles['option-card']}>
          <h2>Brand Promotion</h2>
          <p>Discover our exclusive plans and promotions.</p>
        </Link>
        <Link to="/shop" className={styles['option-card']}>
          <h2>Shop Now</h2>
          <p>Browse and purchase our products.</p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
