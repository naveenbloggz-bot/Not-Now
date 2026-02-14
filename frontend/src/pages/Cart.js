import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, loading } = useCart();
  const navigate = useNavigate();

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20" data-testid="cart-page">
      <div className="max-w-[1920px] mx-auto px-4 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-12 text-center font-['Montserrat']">
            SHOPPING CART
          </h1>

          {cart.items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg mb-8">Your cart is empty</p>
              <Link to="/shop">
                <Button
                  data-testid="continue-shopping-button"
                  className="rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 px-8 bg-black text-white border border-black hover:bg-transparent hover:text-black transition-all duration-300"
                >
                  CONTINUE SHOPPING
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {cart.items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    data-testid={`cart-item-${item.product.id}`}
                    className="flex gap-6 border-b border-gray-200 pb-6"
                  >
                    <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                      <img
                        src={item.product.images[0] || 'https://via.placeholder.com/150'}
                        alt={item.product.name}
                        className="w-32 h-32 object-cover bg-gray-100"
                      />
                    </Link>

                    <div className="flex-1">
                      <Link to={`/product/${item.product.id}`}>
                        <h3 className="text-xl font-bold uppercase tracking-widest mb-2 font-['Montserrat'] hover:opacity-50 transition-opacity">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-4">${item.product.price.toFixed(2)}</p>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            data-testid={`decrease-quantity-${item.product.id}`}
                            className="w-8 h-8 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors text-sm"
                          >
                            -
                          </button>
                          <span className="w-12 text-center" data-testid={`quantity-${item.product.id}`}>{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            data-testid={`increase-quantity-${item.product.id}`}
                            className="w-8 h-8 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors text-sm"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.product.id)}
                          data-testid={`remove-item-${item.product.id}`}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-gray-50 p-8 sticky top-24"
                >
                  <h2 className="text-xl font-bold uppercase tracking-widest mb-6 font-['Montserrat']">
                    ORDER SUMMARY
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span data-testid="cart-subtotal">${cart.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>FREE</span>
                    </div>
                    <div className="border-t border-gray-300 pt-4 flex justify-between font-bold">
                      <span>Total</span>
                      <span data-testid="cart-total">${cart.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate('/checkout')}
                    data-testid="proceed-checkout-button"
                    className="w-full rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 bg-black text-white border border-black hover:bg-transparent hover:text-black transition-all duration-300 mb-4"
                  >
                    PROCEED TO CHECKOUT
                  </Button>

                  <Link to="/shop">
                    <Button
                      variant="outline"
                      className="w-full rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 bg-transparent text-black border border-black hover:bg-black hover:text-white transition-all duration-300"
                    >
                      CONTINUE SHOPPING
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;