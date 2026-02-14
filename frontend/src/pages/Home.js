import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    // Fetch featured products
    api.get('/products')
      .then(response => setFeaturedProducts(response.data.slice(0, 4)))
      .catch(error => console.error('Failed to fetch products:', error));

    // Fetch reviews
    api.get('/reviews')
      .then(response => setReviews(response.data.slice(0, 3)))
      .catch(error => console.error('Failed to fetch reviews:', error));

    // Fetch settings
    api.get('/settings')
      .then(response => setSettings(response.data))
      .catch(error => console.error('Failed to fetch settings:', error));
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Featured Products */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-[1920px] mx-auto px-4 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-light tracking-wide uppercase mb-4 font-['Montserrat']">
              FEATURED COLLECTION
            </h2>
            <div className="w-24 h-px bg-black mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/shop">
              <Button
                data-testid="view-all-products"
                className="rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 px-8 bg-transparent text-black border border-black hover:bg-black hover:text-white transition-all duration-300"
              >
                VIEW ALL PRODUCTS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-[1920px] mx-auto px-4 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-light tracking-wide uppercase mb-8 font-['Montserrat']">
                OUR STORY
              </h2>
              <p className="text-base md:text-lg leading-relaxed text-gray-800">
                {settings?.about_text || 'We are committed to delivering exceptional luxury products that combine timeless elegance with modern sophistication. Every piece in our collection is carefully curated to bring you the finest quality and craftsmanship.'}
              </p>
              <div className="mt-8">
                <Link to="/about">
                  <Button
                    data-testid="learn-more-button"
                    className="rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 px-8 bg-black text-white border border-black hover:bg-transparent hover:text-black transition-all duration-300"
                  >
                    LEARN MORE
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-20 md:py-32 bg-white">
          <div className="max-w-[1920px] mx-auto px-4 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-light tracking-wide uppercase mb-4 font-['Montserrat']">
                WHAT OUR CUSTOMERS SAY
              </h2>
              <div className="w-24 h-px bg-black mx-auto"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gray-50 p-8"
                  data-testid={`review-card-${review.id}`}
                >
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
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-16">
              <Link to="/reviews">
                <Button
                  data-testid="view-all-reviews"
                  className="rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 px-8 bg-transparent text-black border border-black hover:bg-black hover:text-white transition-all duration-300"
                >
                  VIEW ALL REVIEWS
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;