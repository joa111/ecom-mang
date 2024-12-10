import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './Homepage';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ShoppingCart from './components/ShoppingCart';
import { AuthProvider } from './AuthContext';
import { Login, SignUp } from './AuthComponents';
import { ProtectedRoute } from './ProtectedRoute';
import AdminDashboard from './AdminDashboard';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './CartContext';

const App = () => {

  return (
    <Router>
      <CartProvider>
    <AuthProvider>
    <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/productlist" element={<ProductList />} />
        <Route path="/productdetail" element={<ProductDetail />} />
        <Route path="/shoppingcart" element={<ShoppingCart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
      </Routes>
    </AuthProvider>
    </CartProvider>
    </Router>
  );
};

export default App;