import { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await userService.getMe();
      const freshUser = response.data?.user;
      if (freshUser) {
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        return freshUser;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      if (error.response?.status === 401) {
        logout();
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const { user, accessToken, refreshToken } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setLoading(false);
    
    return response.data;
  };

  const loginPhone = async (phone, password) => {
    const response = await authService.loginPhone({ phone, password });
    const { user, accessToken, refreshToken } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    
    return response.data;
  };

  const register = async (data) => {
    const response = await authService.register(data);
    const { user, accessToken, refreshToken } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    
    return response.data;
  };

  const googleAuth = async (idToken) => {
    const response = await authService.googleAuth(idToken);
    const { user, accessToken, refreshToken } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    
    return response.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      loginPhone,
      register, 
      googleAuth,
      logout, 
      fetchUser,
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
