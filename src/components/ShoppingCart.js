import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../supabaseClient'; // Import your Supabase client

const ShoppingCart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart items from Supabase
  const fetchCartItems = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cart')
      .select(`
        id,
        quantity,
        product_id,
        products (
          name,
          price,
          image_url,
          stock_quantity
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching cart items:', error.message);
    } else {
      // Transform the data into a usable format
      const formattedCartItems = data.map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        name: item.products?.name || 'Unknown Product',
        price: item.products?.price || 0,
        image_url: item.products?.image_url || '/api/placeholder/200/200',
        stock_quantity: item.products?.stock_quantity || 10,
      }));
      setCartItems(formattedCartItems);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  const updateQuantity = async (product_id, change) => {
    if (!user) {
      toast.error('Please log in to modify cart');
      return;
    }

    const item = cartItems.find(item => item.product_id === product_id);
    if (!item) return;

    const newQuantity = Math.max(1, Math.min(item.quantity + change, item.stock_quantity || 10));

    const { error } = await supabase
      .from('cart')
      .update({ quantity: newQuantity })
      .eq('user_id', user.id)
      .eq('product_id', product_id);

    if (error) {
      console.error('Error updating cart quantity:', error.message);
    } else {
      setCartItems(items =>
        items.map(i => (i.product_id === product_id ? { ...i, quantity: newQuantity } : i))
      );
    }
  };

  const removeItem = async (product_id) => {
    if (!user) {
      toast.error('Please log in to modify cart');
      return;
    }

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', product_id);

    if (error) {
      console.error('Error removing item from cart:', error.message);
    } else {
      setCartItems(items => items.filter(item => item.product_id !== product_id));
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 150 ? 0 : 10;
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2">
          {cartItems.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">Your cart is empty</p>
                <Link
                  to="/productlist"
                  className="mt-4 inline-block bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
                >
                  Continue Shopping
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-24 h-24 object-contain"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-semibold">{item.name}</h3>
                          <button
                            onClick={() => removeItem(item.product_id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <div className="flex items-center border rounded-md">
                            <button
                              className="p-2 hover:bg-gray-100"
                              onClick={() => updateQuantity(item.product_id, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4">{item.quantity}</span>
                            <button
                              className="p-2 hover:bg-gray-100"
                              onClick={() => updateQuantity(item.product_id, 1)}
                              disabled={item.quantity >= (item.stock_quantity || 10)}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="font-semibold">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  className="w-full bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800"
                  disabled={!user || cartItems.length === 0}
                >
                  {!user ? 'Login to Checkout' : 'Proceed to Checkout'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
