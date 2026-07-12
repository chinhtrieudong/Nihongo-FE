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
  // TEMPORARY: In development mode, skip auth loading entirely
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  if (isDevelopment) {
    // Return immediately without any auth checks in development
    return (
      <AuthContext.Provider value={{ isInitialized: true, isLoading: false }}>
        {children}
      </AuthContext.Provider>
    );
  }

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
