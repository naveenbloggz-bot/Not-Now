import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { useCart } from '../context/CartContext';
import api from '../lib/api';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      navigate('/cart');
      return;
    }

    const checkStatus = async (attempts = 0) => {
      if (attempts >= 5) {
        setStatus('error');
        toast.error('Payment verification timed out');
        return;
      }

      try {
        const response = await api.get(`/checkout/status/${sessionId}`);
        
        if (response.data.payment_status === 'paid') {
          setStatus('success');
          setOrderId(response.data.order_id);
          refreshCart();
        } else if (response.data.status === 'expired') {
          setStatus('error');
          toast.error('Payment session expired');
        } else {
          // Continue polling
          setTimeout(() => checkStatus(attempts + 1), 2000);
        }
      } catch (error) {
        setStatus('error');
        toast.error('Failed to verify payment');
      }
    };

    checkStatus();
  }, [sessionId, navigate, refreshCart]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-20" data-testid="checkout-success-page">
      <div className="max-w-2xl w-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {status === 'checking' && (
            <div>
              <div className="mb-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto"></div>
              </div>
              <h1 className="text-3xl font-bold uppercase tracking-wider mb-4 font-['Montserrat']">
                VERIFYING PAYMENT...
              </h1>
              <p className="text-gray-600">Please wait while we confirm your payment.</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="mb-8">
                <CheckCircle2 size={64} className="mx-auto text-green-600" />
              </div>
              <h1 className="text-5xl font-bold uppercase tracking-tighter mb-4 font-['Montserrat']">
                ORDER CONFIRMED
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for your purchase! Your order has been successfully placed.
              </p>
              {orderId && (
                <p className="text-sm text-gray-600 mb-8">
                  Order ID: <span className="font-bold">{orderId}</span>
                </p>
              )}
              <p className="text-sm text-gray-600 mb-8">
                You will receive an email confirmation shortly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/dashboard')}
                  data-testid="view-orders-button"
                  className="rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 px-8 bg-black text-white border border-black hover:bg-transparent hover:text-black transition-all duration-300"
                >
                  VIEW ORDERS
                </Button>
                <Button
                  onClick={() => navigate('/shop')}
                  className="rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 px-8 bg-transparent text-black border border-black hover:bg-black hover:text-white transition-all duration-300"
                >
                  CONTINUE SHOPPING
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-wider mb-4 font-['Montserrat']">
                PAYMENT ERROR
              </h1>
              <p className="text-gray-600 mb-8">There was an issue processing your payment.</p>
              <Button
                onClick={() => navigate('/cart')}
                className="rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 px-8 bg-black text-white border border-black hover:bg-transparent hover:text-black transition-all duration-300"
              >
                RETURN TO CART
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart.items, navigate]);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await api.post('/checkout/create-session');
      window.location.href = response.data.url;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Checkout failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-20" data-testid="checkout-page">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-12 text-center font-['Montserrat']">
            CHECKOUT
          </h1>

          <div className="bg-gray-50 p-8 mb-8">
            <h2 className="text-xl font-bold uppercase tracking-widest mb-6 font-['Montserrat']">
              ORDER SUMMARY
            </h2>

            <div className="space-y-4 mb-6">
              {cart.items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span>
                    {item.product.name} x {item.quantity}
                  </span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-300 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span data-testid="checkout-subtotal">${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span data-testid="checkout-total">${cart.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={loading}
            data-testid="pay-now-button"
            className="w-full rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 bg-black text-white border border-black hover:bg-transparent hover:text-black transition-all duration-300"
          >
            {loading ? 'PROCESSING...' : 'PROCEED TO PAYMENT'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export { Checkout, CheckoutSuccess };