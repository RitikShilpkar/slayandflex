import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { useNavigate } from 'react-router-dom';
import loadRazorpay from '../../utils/loadRazorpay';
import api from '../../services/api';
import { clearCart } from '../../store/slices/cartSlice';
import styles from './CheckoutPage.module.css';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handlePayment = async () => {
    // Validate shipping address fields
    for (const key in shippingAddress) {
      if (!shippingAddress[key as keyof typeof shippingAddress]) {
        alert(`Please fill in your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
        return;
      }
    }

    setLoading(true);
    try {
      // Create order on the backend
      const orderItems = items.map((item) => ({
        product: item._id,
        name: item.name,
        image: item.images[0],
        price: item.price,
        quantity: item.quantity,
      }));

      const orderResponse = await api.post('/api/orders', {
        orderItems,
        shippingAddress,
        paymentMethod,
      });

      const order = orderResponse.data;

      // Load Razorpay script
      const res = await loadRazorpay();
      if (!res) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // Create Razorpay order on the backend
      const paymentResponse = await api.post('/api/payments/create-order', {
        amount: order.totalPrice * 100, // Convert amount to paise
        currency: 'INR',
        orderId: order._id,
      });

      const { amount, id: razorpayOrderId, currency } = paymentResponse.data;

      const options = {
        key: process.env.REACT_RAZORPAY_KEY,
        amount: amount.toString(),
        currency: currency,
        name: 'Your Store Name',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            const paymentResult = {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            };

            // Update order to paid
            await api.put(`/api/orders/${order._id}/pay`, paymentResult);

            // Clear the cart
            dispatch(clearCart());

            // Redirect to success page
            navigate('/payment-success');
          } catch (error) {
            console.error(error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: shippingAddress.fullName || user?.name || '',
          email: user?.email || '',
          contact: shippingAddress.phoneNumber || '', // Add user's contact number
        },
        theme: {
          color: '#3399cc',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.errors) {
        // Display validation errors
        const errors = error.response.data.errors;
        for (const key in errors) {
          alert(errors[key]);
        }
      } else {
        alert('An error occurred while processing your order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['checkout-page']}>
      <h1 className={styles['title']}>Checkout</h1>
      <div className={styles['checkout-container']}>
        <div className={styles['shipping-form']}>
          <h2>Shipping Address</h2>
          <form>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={shippingAddress.fullName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={shippingAddress.phoneNumber}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="addressLine1"
              placeholder="Address Line 1"
              value={shippingAddress.addressLine1}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={shippingAddress.city}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={shippingAddress.state}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="postalCode"
              placeholder="Postal Code"
              value={shippingAddress.postalCode}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={shippingAddress.country}
              onChange={handleChange}
              required
            />
          </form>
        </div>
        <div className={styles['order-summary']}>
          <h2>Order Summary</h2>
          {items.map((item) => (
            <div key={item.id} className={styles['order-item']}>
              <span>{item.name}</span>
              <span>
                {item.quantity} x ₹{item.price.toFixed(2)}
              </span>
            </div>
          ))}
          <button
            onClick={handlePayment}
            className={styles['pay-button']}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Place Order & Pay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
