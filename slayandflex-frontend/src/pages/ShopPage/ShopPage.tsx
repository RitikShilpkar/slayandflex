import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchProducts } from '../../store/slices/productSlice';
import {
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
} from '../../store/slices/cartSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './ShopPage.module.css';

const ShopPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector((state) => state.products);
  const cartItems = useAppSelector((state) => state.cart.items);

  useEffect(() => {
    if (!products.length) {
      
      dispatch(fetchProducts());
    }
  }, [dispatch, products]);

  const handleAddToCart = (product: any) => {
    dispatch(addItemToCart({ ...product, quantity: 1 }));
    toast.success(`${product.name} added to cart`);
  };

  const handleIncreaseQuantity = (productId: string) => {
    dispatch(updateItemQuantity({ productId, quantity: 1 }));
  };

  const handleDecreaseQuantity = (productId: string) => {
    const item = cartItems.find((item) => item._id === productId);
    if (item) {
      if (item.quantity > 1) {
        dispatch(updateItemQuantity({ productId, quantity: -1 }));
      } else {
        dispatch(removeItemFromCart(productId));
      }
    }
  };

  const getItemQuantity = (productId: string) => {
    const item = cartItems.find((item) => item._id === productId);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return <div className={styles['loading']}>Loading products...</div>;
  }

  if (error) {
    return <div className={styles['error']}>{error}</div>;
  }

  return (
    <div className={styles['shop-page']}>
      <h1 className={styles['title']}>Shop</h1>
      <div className={styles['product-grid']}>
      {/* <button disabled onClick={() => dispatch(fetchProducts())}>Refresh Product</button> */}

        {products.map((product) => {
          const quantity = getItemQuantity(product._id ?? '');
          return (
            <div key={product._id} className={styles['product-card']}>
              <Link to={`/products/${product._id}`} className={styles['product-link']}>
                <img src={product.images[0]} alt={product.name} className={styles['product-image']} />
                <h2 className={styles['product-name']}>{product.name}</h2>
              </Link>
              <p className={styles['product-price']}>${product.price.toFixed(2)}</p>
              {quantity === 0 ? (
                <button
                  className={styles['add-to-cart-button']}
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              ) : (
                <div className={styles['quantity-controls']}>
                  <button
                    className={styles['decrease-button']}
                    onClick={() => handleDecreaseQuantity(product._id ?? '')}
                    aria-label={`Decrease quantity of ${product.name}`}
                  >
                    -
                  </button>
                  <span className={styles['quantity-display']}>{quantity}</span>
                  <button
                    className={styles['increase-button']}
                    onClick={() => handleIncreaseQuantity(product._id ?? '')}
                    aria-label={`Increase quantity of ${product.name}`}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShopPage;
