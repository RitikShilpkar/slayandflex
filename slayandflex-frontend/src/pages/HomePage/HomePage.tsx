import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css'; // Import CSS module

const HomePage: React.FC = () => {
  return (
    <div className={styles['home-page']}>
      <div className={styles['options']}>
        <Link to="/brand-promotion" className={styles['option-card']}>
          <h2 className={styles['title']}>Brand Promotion</h2>
          <p className={styles['description']}>Discover our exclusive plans and promotions.</p>
        </Link>
        <Link to="/shop" className={styles['option-card']}>
          <h2 className={styles['title']}>Shop Now</h2>
          <p className={styles['description']}>Browse and purchase our products.</p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
