import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/orders')
      .then(response => setOrders(response.data))
      .catch(error => console.error('Failed to fetch orders:', error));
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'shipped':
        return 'text-green-600';
      case 'delivered':
        return 'text-green-800';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-white py-20" data-testid="dashboard-page">
      <div className="max-w-[1920px] mx-auto px-4 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-4 font-['Montserrat']">
            MY ACCOUNT
          </h1>
          <p className="text-lg text-gray-600 mb-12">Welcome, {user?.name}</p>

          <div className="space-y-12">
            {/* Orders Section */}
            <div>
              <h2 className="text-3xl font-light tracking-wide uppercase mb-8 font-['Montserrat']">
                ORDER HISTORY
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50">
                  <p className="text-lg mb-4">You haven't placed any orders yet.</p>
                  <Link
                    to="/shop"
                    className="text-sm font-bold uppercase tracking-[0.2em] underline hover:opacity-50 transition-opacity"
                  >
                    START SHOPPING
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      data-testid={`order-${order.id}`}
                      className="border border-gray-200 p-6 hover:border-black transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-600 mb-1">
                            Order ID
                          </p>
                          <p className="font-mono text-sm">{order.id}</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <p className={`text-xs font-bold uppercase tracking-[0.2em] ${getStatusColor(order.status)}`}>
                            {order.status}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.product_name} x {item.quantity}</span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="mt-4 text-xs text-gray-500">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;