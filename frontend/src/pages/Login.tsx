import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Dumbbell, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding with HD Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/images/auth-bg.png"
          alt="Fitness Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-black/80 via-deep-navy/60 to-transparent" />
        <div className="absolute inset-0 tribal-pattern opacity-40" />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-warm-amber/20 p-3 rounded-2xl border border-warm-amber/30 pulse-ring">
                <Dumbbell className="text-warm-amber w-8 h-8" />
              </div>
              <span className="text-3xl font-bold font-display text-white">FitRealm</span>
            </div>
            <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
              Your Fitness.<br />
              <span className="gradient-text-warm">Your Programs.</span><br />
              Your Data.
            </h1>
            <p className="text-lg text-white max-w-md leading-relaxed">
              Track progress across multiple programs with complete data isolation.
              Switch between Strength, Weight Loss & Cardio, each with its own metrics.
            </p>

            {/* Decorative stats */}
            <div className="flex space-x-6 mt-10">
              {[
                { label: 'Programs', value: '3+' },
                { label: 'Metrics', value: '∞' },
                { label: 'Isolation', value: '100%' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-warm-amber">{stat.value}</div>
                  <div className="text-xs text-air-force-blue-200 uppercase tracking-widest mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-warm-white boho-pattern relative">
        {/* Top corner decoration on mobile */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-warm-amber/10 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-baby-blue/10 to-transparent rounded-tr-full" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md px-8 relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center space-x-3 mb-8 justify-center">
            <div className="bg-warm-amber/20 p-2.5 rounded-xl border border-warm-amber/30">
              <Dumbbell className="text-warm-amber w-6 h-6" />
            </div>
            <span className="text-2xl font-bold font-display text-ink-black">FitRealm</span>
          </div>

          <h2 className="text-3xl font-bold text-ink-black mb-2 font-display">Welcome back</h2>
          <p className="text-air-force-blue mb-8">Sign in to track your fitness journey</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-brick-ember/10 border border-brick-ember/30 text-brick-ember px-4 py-3 rounded-xl mb-6 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-dark mb-2">Email Address</label>
              <input
                type="email"
                className="w-full bg-white border border-sand rounded-xl px-4 py-3.5 text-ink-black placeholder-air-force-blue/50 focus:outline-none focus:border-warm-amber focus:ring-2 focus:ring-warm-amber/20 transition-all"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-dark mb-2">Password</label>
              <input
                type="password"
                className="w-full bg-white border border-sand rounded-xl px-4 py-3.5 text-ink-black placeholder-air-force-blue/50 focus:outline-none focus:border-warm-amber focus:ring-2 focus:ring-warm-amber/20 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-ink-black to-deep-navy text-cream font-semibold py-3.5 rounded-xl hover:shadow-xl hover:shadow-ink-black/20 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 group"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 flex items-center">
            <div className="flex-grow h-px bg-sand"></div>
            <span className="px-4 text-sm text-air-force-blue">or</span>
            <div className="flex-grow h-px bg-sand"></div>
          </div>

          <p className="mt-6 text-center text-air-force-blue text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-warm-amber hover:text-ember-glow font-semibold transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
