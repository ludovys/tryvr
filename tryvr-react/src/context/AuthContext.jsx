import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const auth = localStorage.getItem('tryvr_admin_auth');
      setIsAuthenticated(auth === 'true');
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (username, password) => {
    return new Promise((resolve, reject) => {
      // In a real app, this would be an API call
      if (username === 'admin' && password === 'password') {
        localStorage.setItem('tryvr_admin_auth', 'true');
        setIsAuthenticated(true);
        resolve(true);
      } else {
        reject(new Error('Invalid username or password'));
      }
    });
  };

  const logout = () => {
    localStorage.removeItem('tryvr_admin_auth');
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 