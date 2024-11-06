import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaymentSuccessPage from './pages/ PaymentSuccessPage/ PaymentSuccessPage';

const HomePage = lazy(() => import('./pages/HomePage/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage/ShopPage'));
const BrandPromotionPage = lazy(
  () => import('./pages/BrandPromotionPage/BrandPromotionPage')
);
const ProductPage = lazy(() => import('./pages/ProductPage/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage/NotFoundPage'));
const OrderDetailsPage = lazy(
  () => import('./pages/OrderDetailsPage/OrderDetailsPage')
);
const BrandAnalyticsPage = lazy(
  () => import('./pages/BrandAnalyticsPage/BrandAnalyticsPage')
);

const App: React.FC = () => {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<LoadingSpinner />}>
          {/* <Route
  path="/payment-failure"
  element={
    <ProtectedRoute>
      <PaymentFailurePage />
    </ProtectedRoute>
  }
/> */}
          <Routes>
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-success"
              element={
                <ProtectedRoute>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/brand-promotion" element={<BrandPromotionPage />} />
            <Route
              path="/brand-analytics"
              element={
                <ProtectedRoute>
                  <BrandAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/products/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetailsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ToastContainer />
    </>
  );
};

export default App;
