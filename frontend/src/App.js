import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import { Checkout, CheckoutSuccess } from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import About from './pages/About';
import Contact from './pages/Contact';
import Reviews from './pages/Reviews';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className=\"min-h-screen flex items-center justify-center\">
        <p className=\"text-lg\">Loading...</p>
      </div>
    );
  }
  
  return user ? children : <Navigate to=\"/login\" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className=\"min-h-screen flex items-center justify-center\">
        <p className=\"text-lg\">Loading...</p>
      </div>
    );
  }
  
  return user?.is_admin ? children : <Navigate to=\"/\" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className=\"App\">
            <Routes>
              <Route path=\"/\" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path=\"shop\" element={<Shop />} />
                <Route path=\"product/:id\" element={<ProductDetail />} />
                <Route path=\"about\" element={<About />} />
                <Route path=\"contact\" element={<Contact />} />
                <Route path=\"reviews\" element={<Reviews />} />
                <Route path=\"login\" element={<Login />} />
                <Route path=\"register\" element={<Register />} />
                
                {/* Protected Routes */}
                <Route
                  path=\"cart\"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=\"checkout\"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=\"checkout/success\"
                  element={
                    <ProtectedRoute>
                      <CheckoutSuccess />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=\"dashboard\"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin Routes */}
                <Route
                  path=\"admin\"
                  element={
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  }
                />
              </Route>
            </Routes>
            <Toaster position=\"top-center\" />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
