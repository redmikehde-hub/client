import { createContext, useContext, useState, useEffect } from 'react';

const AuthModalContext = createContext(null);

export const AuthModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('login');
  const [redirectPath, setRedirectPath] = useState(null);

  const openLogin = (redirect = null) => {
    setMode('login');
    setRedirectPath(redirect);
    setIsOpen(true);
  };

  const openSignup = (redirect = null) => {
    setMode('signup');
    setRedirectPath(redirect);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setRedirectPath(null);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <AuthModalContext.Provider value={{ 
      isOpen, 
      mode,
      redirectPath,
      openLogin, 
      openSignup, 
      closeModal,
      switchMode 
    }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};
