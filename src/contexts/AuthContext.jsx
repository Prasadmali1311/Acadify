import { createContext, useContext, useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  async function signup(email, password, userInfo = {}) {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          mobileNumber: userInfo.mobileNumber,
          role: userInfo.role || 'student'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sign up');
      }

      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Set current user
      setCurrentUser(data.user);
      setUserRole(data.user.role);
      
      return data.user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to login');
      }

      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Set current user
      setCurrentUser(data.user);
      setUserRole(data.user.role);
      
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  function logout() {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Clear user state
    setCurrentUser(null);
    setUserRole(null);
  }

  async function getUserProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get user profile');
      }

      const data = await response.json();
      setCurrentUser(data.user);
      setUserRole(data.user.role);
      
      return data.user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getUserProfile()
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching profile:', error);
          // If token is invalid, clear it
          localStorage.removeItem('token');
          setCurrentUser(null);
          setUserRole(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    signup,
    login,
    logout,
    getUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 