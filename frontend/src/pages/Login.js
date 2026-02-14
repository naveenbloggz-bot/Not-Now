import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-20" data-testid="login-page">
      <div className="max-w-md w-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold tracking-tighter uppercase mb-8 text-center font-['Montserrat']">
            LOGIN
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Button
              type="submit"
              disabled={loading}
              data-testid="login-submit-button"
              className="w-full rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 bg-black text-white border border-black hover:bg-transparent hover:text-black transition-all duration-300"
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </Button>
          </form>

          <p className="text-center text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold underline hover:opacity-50 transition-opacity">
              Register here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;