import { store } from '../store';
import { loginSuccess, loginStart, loginFailure } from '../store/slices/userSlice';
// Check for existing tokens on app initialization
export const initializeAuth = async () => {
  
  // Check if user is already authenticated in Redux
  const currentState = store.getState();
  if (currentState.user.isAuthenticated && currentState.user.currentUser) {
    return true;
  }
  
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  // Set loading state
  store.dispatch(loginStart());
  
  if (accessToken && refreshToken) {
    // For now, just decode JWT locally to avoid server dependency issues
    try {
      const decodedToken = decodeJWT(accessToken);
      
      if (decodedToken && (decodedToken.id || decodedToken.sub || decodedToken.userId)) {
        const userId = decodedToken.id || decodedToken.sub || decodedToken.userId;
        
        const userData = {
          id: userId,
          email: decodedToken.email || '',
          username: decodedToken.username || decodedToken.name || 'User',
          role: decodedToken.role || 'student',
          currentLevel: decodedToken.currentLevel || 'N5',
          totalXp: decodedToken.totalXp || 0,
          streakDays: decodedToken.streakDays || 0,
        };
        
        store.dispatch(loginSuccess(userData));
        return true;
      } else {
        console.error('❌ No valid user ID found in token');
      }
    } catch (decodeError) {
      console.error('❌ JWT decode failed:', decodeError);
    }
    
    // If all attempts fail, clear tokens and dispatch failure
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    store.dispatch(loginFailure('Session expired. Please login again.'));
    return false;
  } else {
    store.dispatch(loginFailure(''));
    return false;
  }
};

// Basic JWT decoder (for client-side use only)
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};
