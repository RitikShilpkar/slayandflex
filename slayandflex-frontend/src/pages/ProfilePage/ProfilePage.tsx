import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchUser } from '../../store/slices/authSlice';
import { fetchOrders } from '../../store/slices/orderSlice';
import styles from './ProfilePage.module.css';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading: userLoading, error: userError } = useAppSelector((state) => state.auth);
  const { orders, loading: ordersLoading, error: ordersError } = useAppSelector((state) => state.orders);

  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [filterDelivered, setFilterDelivered] = useState<'all' | 'delivered' | 'undelivered'>('all');

  useEffect(() => {
    if (!user) {
      dispatch(fetchUser());
    } else if (!orders.length) {
      dispatch(fetchOrders());
    }
  }, [dispatch, user, orders]);

  useEffect(() => {
    if (!user && !userLoading) {
      navigate('/login');
    }
  }, [user, userLoading, navigate]);

  if (userLoading || !user) {
    return <div className={styles['loading']}>Loading your profile...</div>;
  }

  // Filter orders based on selected filters
  const filteredOrders = orders.filter((order) => {
    let matchesPaidFilter = true;
    let matchesDeliveredFilter = true;

    if (filterPaid === 'paid') {
      matchesPaidFilter = order.isPaid;
    } else if (filterPaid === 'unpaid') {
      matchesPaidFilter = !order.isPaid;
    }

    if (filterDelivered === 'delivered') {
      matchesDeliveredFilter = order.isDelivered;
    } else if (filterDelivered === 'undelivered') {
      matchesDeliveredFilter = !order.isDelivered;
    }

    return matchesPaidFilter && matchesDeliveredFilter;
  });

  return (
    <div className={styles['profile-page']}>
      <h2 className={styles['title']}>My Profile</h2>
      {userError && <p className={styles['error-message']}>{userError}</p>}
      <div className={styles['profile-details']}>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      <h3 className={styles['orders-title']}>Order History</h3>
      {/* Filters */}
      <div className={styles['filters']}>
        <label>
          Paid:
          <select value={filterPaid} onChange={(e) => setFilterPaid(e.target.value as 'all' | 'paid' | 'unpaid')}>
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </label>
        <label>
          Delivered:
          <select value={filterDelivered} onChange={(e) => setFilterDelivered(e.target.value as 'all' | 'delivered' | 'undelivered')}>
            <option value="all">All</option>
            <option value="delivered">Delivered</option>
            <option value="undelivered">Undelivered</option>
          </select>
        </label>
      </div>
      <button onClick={() => dispatch(fetchOrders())}>Refresh Orders</button>

      <div className={styles['order-history']}>
        {ordersLoading ? (
          <p>Loading your orders...</p>
        ) : ordersError ? (
          <p className={styles['error-message']}>{ordersError}</p>
        ) : filteredOrders.length > 0 ? (
          <table className={styles['orders-table']}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Delivered</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>₹{order.totalPrice.toFixed(2)}</td>
                  <td>{order.isPaid ? new Date(order.paidAt!).toLocaleDateString() : 'No'}</td>
                  <td>{order.isDelivered ? new Date(order.deliveredAt!).toLocaleDateString() : 'No'}</td>
                  <td>
                    <button
                      className={styles['details-button']}
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No orders match the selected filters.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
