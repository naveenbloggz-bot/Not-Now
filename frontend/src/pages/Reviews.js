import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { toast } from 'sonner';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const fetchReviews = () => {
    api.get('/reviews')
      .then(response => setReviews(response.data))
      .catch(error => console.error('Failed to fetch reviews:', error));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/reviews', { name, email, rating, comment });
      toast.success('Review submitted! It will be visible after admin approval.');
      setComment('');
      setRating(5);
      if (!user) {
        setName('');
        setEmail('');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-20" data-testid="reviews-page">
      <div className="max-w-[1920px] mx-auto px-4 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-4 font-['Montserrat']">
            CUSTOMER REVIEWS
          </h1>
          <div className="w-24 h-px bg-black mx-auto"></div>
        </motion.div>

        {/* Submit Review Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-2xl mx-auto mb-16 bg-gray-50 p-8"
        >
          <h2 className="text-xl font-bold uppercase tracking-widest mb-6 font-['Montserrat']">
            SUBMIT YOUR REVIEW
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="text-xs font-bold uppercase tracking-[0.2em] block mb-2">
                  Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid="review-name-input"
                  className="border-0 border-b border-black rounded-none px-0 py-3 bg-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.2em] block mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="review-email-input"
                  className="border-0 border-b border-black rounded-none px-0 py-3 bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] block mb-2">
                Rating
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    data-testid={`star-${star}`}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star
                      size={32}
                      className={star <= rating ? 'fill-black' : 'fill-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="comment" className="text-xs font-bold uppercase tracking-[0.2em] block mb-2">
                Your Review
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={4}
                data-testid="review-comment-input"
                className="border border-black rounded-none p-3"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              data-testid="submit-review-button"
              className="w-full rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 bg-black text-white border border-black hover:bg-transparent hover:text-black transition-all duration-300"
            >
              {loading ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
            </Button>
          </form>
        </motion.div>

        {/* Display Reviews */}
        {reviews.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="bg-gray-50 p-8"
                data-testid={`review-${review.id}`}
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
        )}
      </div>
    </div>
  );
};

export default Reviews;