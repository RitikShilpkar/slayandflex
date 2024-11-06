import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../store/slices/productSlice';
import styles from './ProductCard.module.css'; // Correctly import the CSS module

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className={styles['product-card']}> {/* Use styles from the imported module */}
      <Link to={`/products/${product._id}`}>
        <img src={product.images[0]} alt={product.name} className={styles['product-image']} />
      </Link>
      <h3>{product.name}</h3>
      <p>${product.price.toFixed(2)}</p>
      <Link to={`/products/${product._id}`} className={styles['view-details']}>
        View Details
      </Link>
    </div>
  );
};

export default ProductCard;
