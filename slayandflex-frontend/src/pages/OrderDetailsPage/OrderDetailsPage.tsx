import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchOrderDetails } from '../../store/slices/orderDetailsSlice';
import styles from './OrderDetailsPage.module.css';

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { order, loading, error } = useAppSelector((state) => state.orderDetails);

  useEffect(() => {
    dispatch(fetchOrderDetails(id ?? ''));
  }, [dispatch, id]);

  if (loading) {
    return <div className={styles['loading']}>Loading order details...</div>;
  }

  if (error) {
    return <div className={styles['error-message']}>{error}</div>;
  }

  if (!order) {
    return <div className={styles['error-message']}>Order not found.</div>;
  }

  return (
    <div className={styles['order-details-page']}>
      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> {order._id}</p>
      <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
      <p><strong>Total:</strong> ₹{order.totalPrice.toFixed(2)}</p>
      <p><strong>Paid:</strong> {order.isPaid ? 'Yes' : 'No'}</p>
      <p><strong>Delivered:</strong> {order.isDelivered ? 'Yes' : 'No'}</p>
      {/* Display other order details as needed */}
      <h3>Order Items</h3>
      <ul>
        {order.orderItems.map((item) => (
          <li key={item.product}>
            {item.name} - {item.quantity} x ₹{item.price.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderDetailsPage;
