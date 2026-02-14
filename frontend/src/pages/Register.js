import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-20" data-testid="register-page">
      <div className="max-w-md w-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold tracking-tighter uppercase mb-8 text-center font-['Montserrat']">
            REGISTER
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-[0.2em] block mb-2">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-testid="name-input"
                className="border-0 border-b border-black rounded-none px-0 py-3 bg-transparent focus:ring-0 focus:border-black"
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
                data-testid="email-input"
                className="border-0 border-b border-black rounded-none px-0 py-3 bg-transparent focus:ring-0 focus:border-black"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-[0.2em] block mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="password-input"
                className="border-0 border-b border-black rounded-none px-0 py-3 bg-transparent focus:ring-0 focus:border-black"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-[0.2em] block mb-2">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                data-testid="confirm-password-input"
                className="border-0 border-b border-black rounded-none px-0 py-3 bg-transparent focus:ring-0 focus:border-black"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              data-testid="register-submit-button"
              className="w-full rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 bg-black text-white border border-black hover:bg-transparent hover:text-black transition-all duration-300"
            >
              {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
            </Button>
          </form>

          <p className="text-center text-sm mt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-bold underline hover:opacity-50 transition-opacity">
              Login here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;