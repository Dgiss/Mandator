
/**
 * Authentication utility functions
 */

// Check if the user is authenticated based on the presence of an auth token
export const checkAuth = (): boolean => {
  const token = localStorage.getItem('authToken');
  return !!token; // Return true if token exists
};

// Get the current authenticated user information
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Error parsing user data:', e);
    return null;
  }
};

// Logout function to clear the authentication data
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  
  // You might want to redirect the user or refresh the page after logout
  window.location.href = '/login';
};

// Set authentication data after successful login
export const setAuth = (token: string, user: any) => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(user));
};
