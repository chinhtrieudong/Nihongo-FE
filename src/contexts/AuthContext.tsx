import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isInitialized: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isInitialized: false,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Import dynamically to avoid circular dependency
        const { initializeAuth } = await import('../utils/auth');
        await initializeAuth();
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isInitialized, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
