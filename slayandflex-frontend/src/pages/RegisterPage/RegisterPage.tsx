import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { registerUser } from '../../store/slices/authSlice';
import styles from './RegisterPage.module.css';

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(registerUser({ name, email, password }));
    if (registerUser.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <div className={styles['register-page']}>
      <h2 className={styles['title']}>Register</h2>
      {error && <p className={styles['error-message']}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles['register-form']}>
        <div className={styles['form-group']}>
          <label htmlFor="name" className={styles['form-label']}>Name:</label>
          <input
            type="text"
            id="name"
            className={styles['form-input']}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your name"
          />
        </div>
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
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className={styles['login-link']}>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default RegisterPage;
