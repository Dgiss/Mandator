
// Simple authentication utility functions

/**
 * Check if user is authenticated
 * For demo purposes, this checks for a valid token in localStorage
 */
export const checkAuth = (): boolean => {
  // In a real app, check for a token in localStorage or cookies
  const token = localStorage.getItem('authToken');
  return !!token;
};

/**
 * Log out the current user
 */
export const logout = (): void => {
  // In a real app, remove token from localStorage or cookies
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  console.log("User logged out");
};

/**
 * Log in a user with credentials
 */
export const login = (username: string, password: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Simulate API call
    setTimeout(() => {
      if (username === 'admin@example.com' && password === 'password') {
        // Store token in localStorage for demo purposes
        localStorage.setItem('authToken', 'fake-jwt-token');
        localStorage.setItem('user', JSON.stringify({ name: 'Administrateur', email: username }));
        resolve(true);
      } else {
        resolve(false);
      }
    }, 500);
  });
};
