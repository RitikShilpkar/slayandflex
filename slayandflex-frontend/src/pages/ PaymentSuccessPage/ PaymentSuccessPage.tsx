import React from 'react';
import styles from './PaymentSuccessPage.module.css';

const PaymentSuccessPage: React.FC = () => {
  return (
    <div className={styles['success-page']}>
      <h1>Payment Successful!</h1>
      <p>Your order has been placed successfully. Thank you for shopping with us!</p>
    </div>
  );
};

export default PaymentSuccessPage;
