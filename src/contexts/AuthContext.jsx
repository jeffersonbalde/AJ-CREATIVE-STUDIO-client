import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (token) {
        // Verify token with backend
        const apiBaseUrl = import.meta.env.VITE_LARAVEL_API || import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiBaseUrl}/admin/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('AuthContext - /admin/me response:', JSON.stringify(data, null, 2));
          console.log('AuthContext - Setting user:', JSON.stringify(data.user, null, 2));
          setUser(data.user);
          setIsAuthenticated(true);
        } else if (response.status === 401 || response.status === 403) {
          // Token invalid/expired – clear it
          localStorage.removeItem('token');
          localStorage.removeItem('admin_token');
          setUser(null);
          setIsAuthenticated(false);
        } else {
          // Non-auth errors (e.g., network/API down) – do NOT wipe token, allow retry
          console.warn('Auth check failed but token kept. Status:', response.status);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Keep token so we can retry if this was just a transient error
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_LARAVEL_API || import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token (use 'token' for Sanctum, but keep 'admin_token' for backward compatibility)
        localStorage.setItem('token', data.token);
        localStorage.setItem('admin_token', data.token); // Backward compatibility
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      } else {
        return { 
          success: false, 
          error: data.message || 'Login failed. Please check your credentials.' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (token) {
        const apiBaseUrl = import.meta.env.VITE_LARAVEL_API || import.meta.env.VITE_API_URL || 'http://localhost:8000';
        // Call backend logout to revoke token
        await fetch(`${apiBaseUrl}/admin/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always remove token from localStorage and clear state
      localStorage.removeItem('token');
      localStorage.removeItem('admin_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Get token from localStorage
  const token = localStorage.getItem('token') || localStorage.getItem('admin_token');

  // For backward compatibility, also expose as 'admin'
  return (
    <AuthContext.Provider
      value={{
        user,
        admin: user, // Alias for backward compatibility
        token, // Expose token for API calls
        loading,
        isAuthenticated,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

