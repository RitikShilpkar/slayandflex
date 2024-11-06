import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchProductBySlug } from '../../store/slices/productSlice';
import { addItemToCart } from '../../store/slices/cartSlice';
import styles from './ProductPage.module.css';

const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const { productDetails, loading, error } = useAppSelector(
    (state) => state.products
  );

  useEffect(() => {
    if (slug) {
      dispatch(fetchProductBySlug(slug));
    }
  }, [dispatch, slug]);

  if (loading) return <div className={styles['loading']}>Loading product...</div>;
  if (error) return <div className={styles['error']}>Error loading product: {error}</div>;
  if (!productDetails) return <div className={styles['not-found']}>Product not found.</div>;

  const handleAddToCart = () => {
    dispatch(addItemToCart({...productDetails, quantity: 1}));
  };

  return (
    <div className={styles['product-page']}>
      <div className={styles['product-gallery']}>
        <img
          src={productDetails.images[0]}
          alt={productDetails.name}
          className={styles['product-image']}
        />
        {/* If there are additional images, you can add a thumbnail gallery here */}
      </div>
      <div className={styles['product-details']}>
        <h2 className={styles['product-name']}>{productDetails.name}</h2>
        <p className={styles['product-price']}>${productDetails.price.toFixed(2)}</p>
        <p className={styles['product-description']}>{productDetails.description}</p>
        <button onClick={handleAddToCart} className={styles['add-to-cart-button']}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductPage;
