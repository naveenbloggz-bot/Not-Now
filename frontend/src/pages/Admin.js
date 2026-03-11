import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = () => {
    api.get('/products').then(r => setProducts(r.data)).catch(console.error);
    api.get('/admin/banners').then(r => setBanners(r.data)).catch(console.error);
    api.get('/admin/orders').then(r => setOrders(r.data)).catch(console.error);
    api.get('/admin/reviews').then(r => setReviews(r.data)).catch(console.error);
    api.get('/settings').then(r => setSettings(r.data)).catch(console.error);
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const deleteBanner = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await api.delete(`/admin/banners/${id}`);
      toast.success('Banner deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  const approveReview = async (id, approved) => {
    try {
      await api.put(`/admin/reviews/${id}/approve`, { approved });
      toast.success(approved ? 'Review approved' : 'Review rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      toast.success('Order status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  if (!user?.is_admin) return null;

  return (
    <div className="min-h-screen bg-white py-20" data-testid="admin-dashboard">
      <div className="max-w-[1920px] mx-auto px-4 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold tracking-tighter uppercase mb-12 font-['Montserrat']">
            ADMIN DASHBOARD
          </h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="products" data-testid="tab-products">PRODUCTS</TabsTrigger>
              <TabsTrigger value="banners" data-testid="tab-banners">BANNERS</TabsTrigger>
              <TabsTrigger value="orders" data-testid="tab-orders">ORDERS</TabsTrigger>
              <TabsTrigger value="reviews" data-testid="tab-reviews">REVIEWS</TabsTrigger>
              <TabsTrigger value="settings" data-testid="tab-settings">SETTINGS</TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products">
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold uppercase tracking-wider">Products ({products.length})</h2>
                </div>
                {products.map((product) => (
                  <div key={product.id} className="border border-gray-200 p-6" data-testid={`admin-product-${product.id}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold uppercase">{product.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        <p className="text-sm mt-2">
                          <span className="font-bold">${product.price.toFixed(2)}</span> | 
                          <span className="ml-2">{product.category}</span> |
                          <span className={`ml-2 ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                            {product.in_stock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        data-testid={`delete-product-${product.id}`}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Banners Tab */}
            <TabsContent value="banners">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-wider mb-6">Banners ({banners.length})</h2>
                {banners.map((banner) => (
                  <div key={banner.id} className="border border-gray-200 p-6" data-testid={`admin-banner-${banner.id}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold uppercase">{banner.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{banner.description}</p>
                        <p className="text-sm mt-2">
                          <span className="font-bold">${banner.price.toFixed(2)}</span> |
                          <span className="ml-2">Order: {banner.order}</span> |
                          <span className={`ml-2 ${banner.active ? 'text-green-600' : 'text-red-600'}`}>
                            {banner.active ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => deleteBanner(banner.id)}
                        data-testid={`delete-banner-${banner.id}`}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-wider mb-6">Orders ({orders.length})</h2>
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 p-6" data-testid={`admin-order-${order.id}`}>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold uppercase text-gray-600">Order ID</p>
                          <p className="font-mono text-sm">{order.id}</p>
                        </div>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          data-testid={`order-status-${order.id}`}
                          className="border border-black px-3 py-1 text-sm uppercase"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="text-sm">
                        <span className="font-bold">Customer:</span> {order.user_email}
                      </div>
                      <div className="text-sm">
                        <span className="font-bold">Total:</span> ${order.total.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-wider mb-6">Reviews ({reviews.length})</h2>
                {reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 p-6" data-testid={`admin-review-${review.id}`}>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{review.name}</p>
                          <p className="text-sm text-gray-600">{review.email}</p>
                          <p className="text-sm mt-2">Rating: {review.rating}/5</p>
                        </div>
                        <div className="flex space-x-2">
                          {!review.approved && (
                            <button
                              onClick={() => approveReview(review.id, true)}
                              data-testid={`approve-review-${review.id}`}
                              className="text-green-600 hover:text-green-800"
                            >
                              <CheckCircle size={24} />
                            </button>
                          )}
                          <button
                            onClick={() => approveReview(review.id, false)}
                            data-testid={`reject-review-${review.id}`}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XCircle size={24} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm">"{review.comment}"</p>
                      <p className={`text-xs font-bold ${review.approved ? 'text-green-600' : 'text-yellow-600'}`}>
                        {review.approved ? 'APPROVED' : 'PENDING'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold uppercase tracking-wider mb-6">Site Settings</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Settings management is available. Contact admin for updates.
                </p>
                {settings && (
                  <div className="border border-gray-200 p-6 space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-600">Brand Name</p>
                      <p>{settings.brand_name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-600">Contact Email</p>
                      <p>{settings.contact_email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-600">Contact Phone</p>
                      <p>{settings.contact_phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-600">Address</p>
                      <p>{settings.contact_address}</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
