import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser } from '../../store/slices/authSlice';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <div className={styles['login-page']}>
      <h2 className={styles['title']}>Login</h2>
      {error && <p className={styles['error-message']}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles['login-form']}>
        <div className={styles['form-group']}>
          <label htmlFor="email" className={styles['form-label']}>Email:</label>
          <input
            type="email"
            id="email"
            className={styles['form-input']}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="password" className={styles['form-label']}>Password:</label>
          <input
            type="password"
            id="password"
            className={styles['form-input']}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>
        <button
          type="submit"
          className={styles['submit-button']}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className={styles['register-link']}>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
};

export default LoginPage;
