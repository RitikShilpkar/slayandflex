import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import { RootState, useAppDispatch } from '../../store';
import ProductCard from '../../components/ProductCard/ProductCard';
// import './ProductListingPage.module.css';

const ProductListingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);
  

  return (
    <div className="product-listing-page">
      {' '}
      <h1>Shop Our Collection</h1> {loading && <p>Loading products...</p>}{' '}
      {error && <p>Error loading products: {error}</p>}{' '}
      <div className="product-grid">
        {' '}
        {products &&
          products?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}{' '}
      </div>{' '}
    </div>
  );
};

export default ProductListingPage;
