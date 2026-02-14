import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], total: 0 });
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      await api.post('/cart/add', { product_id: productId, quantity });
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await api.put(`/cart/${productId}`, { product_id: productId, quantity });
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart({ items: [], total: 0 });
    } catch (error) {
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};