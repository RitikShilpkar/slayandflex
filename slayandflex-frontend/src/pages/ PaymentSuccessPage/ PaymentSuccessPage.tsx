import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PaymentSuccessPage.module.css';

const PaymentSuccessPage: React.FC = () => {
  return (
    <div className={styles['success-page']}>
      <h1>Payment Successful!</h1>
      <p>Your order has been placed successfully. Thank you for shopping with us!</p>
      <Link to="/shop" className={styles['continue-shopping-button']}>
        Continue Shopping
      </Link>
    </div>
  );
};

export default PaymentSuccessPage;
