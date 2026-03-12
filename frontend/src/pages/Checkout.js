import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useCart } from '../context/CartContext';
import api from '../lib/api';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('success');
  const [orderId] = useState(searchParams.get('order_id'));
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart after successful order
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-20" data-testid="checkout-success-page">
      <div className="max-w-2xl w-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
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
                We will contact you shortly to confirm your order.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/shop')}
                  className="rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 px-8 bg-black text-white border border-black hover:bg-transparent hover:text-black transition-all duration-300"
                >
                  CONTINUE SHOPPING
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart.items, navigate]);

  const handleInputChange = (e) => {
    setContactInfo({
      ...contactInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create order with contact details
      const orderData = {
        items: cart.items.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        })),
        total: cart.total,
        contact_info: contactInfo
      };

      const response = await api.post('/guest/orders', orderData);
      
      toast.success('Order placed successfully!');
      
      // Navigate to success page
      navigate(`/checkout/success?order_id=${response.data.order_id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Order failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-20" data-testid="checkout-page">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-12 text-center font-['Montserrat']">
            CHECKOUT
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information Form */}
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-6 font-['Montserrat']">
                CONTACT INFORMATION
              </h2>
              
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                <div>
                  <label htmlFor="name" className="text-xs font-bold uppercase tracking-[0.2em] block mb-2">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={contactInfo.name}
                    onChange={handleInputChange}
                    required
                    data-testid="checkout-name-input"
                    className="border-0 border-b border-black rounded-none px-0 py-3 bg-transparent focus:ring-0 focus:border-black"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.2em] block mb-2">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={handleInputChange}
                    required
                    data-testid="checkout-email-input"
                    className="border-0 border-b border-black rounded-none px-0 py-3 bg-transparent focus:ring-0 focus:border-black"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="text-xs font-bold uppercase tracking-[0.2em] block mb-2">
                    Phone *
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={contactInfo.phone}
                    onChange={handleInputChange}
                    required
                    data-testid="checkout-phone-input"
                    className="border-0 border-b border-black rounded-none px-0 py-3 bg-transparent focus:ring-0 focus:border-black"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="text-xs font-bold uppercase tracking-[0.2em] block mb-2">
                    Address *
                  </label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={contactInfo.address}
                    onChange={handleInputChange}
                    required
                    data-testid="checkout-address-input"
                    className="border-0 border-b border-black rounded-none px-0 py-3 bg-transparent focus:ring-0 focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="text-xs font-bold uppercase tracking-[0.2em] block mb-2">
                      City *
                    </label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      value={contactInfo.city}
                      onChange={handleInputChange}
                      required
                      data-testid="checkout-city-input"
                      className="border-0 border-b border-black rounded-none px-0 py-3 bg-transparent focus:ring-0 focus:border-black"
                    />
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="text-xs font-bold uppercase tracking-[0.2em] block mb-2">
                      Postal Code *
                    </label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      value={contactInfo.postalCode}
                      onChange={handleInputChange}
                      required
                      data-testid="checkout-postal-input"
                      className="border-0 border-b border-black rounded-none px-0 py-3 bg-transparent focus:ring-0 focus:border-black"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  data-testid="place-order-button"
                  className="w-full rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 bg-black text-white border border-black hover:bg-transparent hover:text-black transition-all duration-300 mt-8"
                >
                  {loading ? 'PROCESSING...' : 'PLACE ORDER'}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-gray-50 p-8 sticky top-24">
                <h2 className="text-xl font-bold uppercase tracking-widest mb-6 font-['Montserrat']">
                  ORDER SUMMARY
                </h2>

                <div className="space-y-4 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm border-b border-gray-300 pb-3">
                      <div className="flex-1">
                        <p className="font-bold">{item.product.name}</p>
                        <p className="text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-6 border-t border-gray-400 pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span data-testid="checkout-subtotal">${cart.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>Calculated at delivery</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total</span>
                    <span data-testid="checkout-total">${cart.total.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 text-center">
                  We will contact you to confirm shipping costs and payment details.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export { Checkout, CheckoutSuccess };
