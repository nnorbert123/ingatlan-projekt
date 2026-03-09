import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get('https://api.ingatlan-projekt.com/api/auth/me');
      setUser(res.data.user);
      setLoading(false);
    } catch (error) {
      console.error('User fetch error:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    console.log('=== LOGIN DEBUG ===');
    console.log('Email:', email);
    console.log('Calling API...');
    
    try {
      const res = await axios.post('https://api.ingatlan-projekt.com/api/auth/login', { email, jelszo: password });
      console.log('API Response:', res.data);
      
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      
      console.log('Login successful, user:', res.data.user);
      return res.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (nev, email, password, telefon) => {
    const res = await axios.post('https://api.ingatlan-projekt.com/api/auth/register', { nev, email, jelszo: password, telefon });
    localStorage.setItem('token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser({ ...user, ...updatedData });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
