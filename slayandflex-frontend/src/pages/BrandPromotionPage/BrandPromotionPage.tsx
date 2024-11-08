// src/pages/BrandPromotionPage/BrandPromotionPage.tsx

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchPlans,
  subscribePlan,
  cancelPlan,
  fetchCurrentPlan,
} from '../../store/slices/promotionSlice';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import styles from './BrandPromotionPage.module.css';

const BrandPromotionPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate(); // Initialize navigate
  const { plans, currentPlan, loading, error } = useAppSelector(
    (state) => state.promotions
  );
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchPlans());
    if (user) {
      dispatch(fetchCurrentPlan());
    }
  }, [dispatch, user]);

  const handleSubscribe = (planName: string) => {
    console.log({planName});
    
    dispatch(subscribePlan(planName));
  };

  const handleCancel = (id: string) => {
    console.log({id});
    
    dispatch(cancelPlan(id));
  };

  const handleViewAnalytics = () => {
    navigate('/brand-analytics'); // Navigate to the analytics page
  };

  if (loading)
    return <div className={styles['loading']}>Loading promotions...</div>;

  if (error)
    return (
      <div className={styles['error']}>Error loading promotions: {error}</div>
    );

  return (
    <div className={styles['brand-promotion-page']}>
      <h1 className={styles['title']}>Our Plans</h1>

      {currentPlan ? (
        <div className={styles['current-plan']}>
          <h2>Your Current Plan: {currentPlan.plan}</h2>
          <p>Price: ${currentPlan.price.toFixed(2)}</p>
          <p>Duration: {currentPlan.durationDays} days</p>
          <h3>Services Included:</h3>
          <ul>
            {currentPlan.services.map((service: string, index: number) => (
              <li key={index}>{service}</li>
            ))}
          </ul>
          <div className={styles['button-group']}>
            <button className={styles['analytics-button']} onClick={handleViewAnalytics}>
              View Analytics
            </button>
            <button className={styles['cancel-button']} onClick={()=> handleCancel(currentPlan._id ?? '')}>
              Cancel Plan
            </button>
          </div>
        </div>
      ) : null}

      <div className={styles['plan-grid']}>
        {plans.map((plan) => (
          <div key={plan.plan} className={styles['plan-card']}>
            <h2 className={styles['plan-name']}>{plan.plan}</h2>
            <p className={styles['plan-price']}>${plan.price.toFixed(2)}</p>
            <p className={styles['plan-duration']}>
              Duration: {plan.durationDays} days
            </p>
            <h3 className={styles['services-title']}>Services Included:</h3>
            <ul className={styles['services-list']}>
              {plan.services.map((service: string, index: number) => (
                <li key={index} className={styles['service-item']}>
                  {service}
                </li>
              ))}
            </ul>
            {currentPlan && currentPlan.plan === plan.plan ? (
              <button className={styles['current-plan-button']}>
                Current Plan
              </button>
            ) : (
              <button
                className={styles['plan-button']}
                onClick={() => handleSubscribe(plan.name)} 
              >
                {currentPlan ? 'Change to this Plan' : 'Get Started'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandPromotionPage;
