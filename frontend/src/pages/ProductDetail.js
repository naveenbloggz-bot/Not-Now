import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useCart } from '../context/CartContext';
import api from '../lib/api';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    // Fetch product
    api.get(`/products/${id}`)
      .then(response => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch product:', error);
        setLoading(false);
      });

    // Fetch product reviews
    api.get('/reviews', { params: { product_id: id } })
      .then(response => setReviews(response.data))
      .catch(error => console.error('Failed to fetch reviews:', error));
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product, quantity);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Product not found</p>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-white py-20" data-testid="product-detail-page">
      <div className="max-w-[1920px] mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-[3/4] bg-gray-100 mb-4">
              <img
                src={product.images[selectedImage] || 'https://via.placeholder.com/600x800'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-100 border-2 ${
                      selectedImage === index ? 'border-black' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-600 mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase mb-4 font-['Montserrat']">
                {product.name}
              </h1>
              
              {/* Rating */}
              {reviews.length > 0 && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.round(averageRating) ? 'fill-black' : 'fill-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({reviews.length} reviews)</span>
                </div>
              )}

              <p className="text-3xl font-light mb-6">${product.price.toFixed(2)}</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-base leading-relaxed text-gray-800">{product.description}</p>
            </div>

            {product.in_stock ? (
              <div className="border-t border-gray-200 pt-6 space-y-4">
                {/* Quantity Selector */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2">Quantity</p>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      data-testid="decrease-quantity"
                      className="w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-lg font-bold w-12 text-center" data-testid="quantity-value">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      data-testid="increase-quantity"
                      className="w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  data-testid="add-to-cart-button"
                  className="w-full rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 bg-black text-white border border-black hover:bg-transparent hover:text-black transition-all duration-300"
                >
                  ADD TO CART
                </Button>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-6">
                <p className="text-lg font-bold uppercase tracking-[0.2em] text-red-600">OUT OF STOCK</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-20 border-t border-gray-200 pt-20">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide uppercase mb-12 font-['Montserrat'] text-center">
              CUSTOMER REVIEWS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 p-8" data-testid={`product-review-${review.id}`}>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? 'fill-black' : 'fill-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-800 mb-4">"{review.comment}"</p>
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">{review.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;