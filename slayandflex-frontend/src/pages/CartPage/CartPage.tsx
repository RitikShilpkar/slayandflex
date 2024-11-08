import React from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  removeItemFromCart,
  updateItemQuantity,
} from '../../store/slices/cartSlice';
import styles from './CartPage.module.css';

const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, totalAmount } = useAppSelector((state) => state.cart);

  const handleRemove = (productId: string) => {
    
    dispatch(removeItemFromCart(productId));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateItemQuantity({ productId, quantity }));
    }
  };

  if (items.length === 0)
    return (
      <div className={styles['cart-page']}>
        <h2 className={styles['empty-cart']}>Your Cart is Empty</h2>
        <Link to="/shop" className={styles['shop-link']}>
          Continue Shopping
        </Link>
      </div>
    );

  return (
    <div className={styles['cart-page']}>
      <h1 className={styles['title']}>Shopping Cart</h1>
      <div className={styles['cart-container']}>
        <div className={styles['cart-items']}>
          {items.map((item) => (
            <div key={item._id} className={styles['cart-item']}>
              <img src={item.images[0]} alt={item.name} className={styles['item-image']} />
              <div className={styles['item-details']}>
                <Link to={`/products/${item.slug}`} className={styles['item-name']}>
                  {item.name}
                </Link>
                <p className={styles['item-price']}>${item.price.toFixed(2)}</p>
                <div className={styles['quantity-controls']}>
                  <label htmlFor={`quantity-${item._id}`}>Quantity:</label>
                  <input
                    type="number"
                    id={`quantity-${item._id}`}
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item._id ?? '', Number(e.target.value))
                    }
                    className={styles['quantity-input']}
                  />
                </div>
                <p className={styles['item-subtotal']}>
                  Subtotal: ${(item.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => handleRemove(item._id ?? '')}
                  className={styles['remove-button']}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className={styles['order-summary']}>
          <h2 className={styles['summary-title']}>Order Summary</h2>
          <div className={styles['summary-details']}>
            <div className={styles['summary-row']}>
              <span>Subtotal</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            {/* Add taxes, shipping if applicable */}
            <div className={styles['summary-row']}>
              <strong>Total</strong>
              <strong>${totalAmount.toFixed(2)}</strong>
            </div>
            <Link to="/checkout" className={styles['checkout-button']}>
              Proceed to Checkout
            </Link>
            <Link to="/shop" className={styles['continue-shopping']}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
