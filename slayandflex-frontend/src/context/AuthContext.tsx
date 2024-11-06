import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchUser } from '../store/slices/authSlice';

interface AuthContextProps {
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
});

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      await dispatch(fetchUser());
    };
    getUser();
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
