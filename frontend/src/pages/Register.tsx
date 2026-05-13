import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Dumbbell, ArrowRight, Shield, Zap, BarChart3 } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/register', { email, password });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register');
    }
  };

  const features = [
    { icon: Shield, label: 'Data Isolation', desc: 'Programs never leak data' },
    { icon: Zap, label: 'Real-time Tracking', desc: 'Instant metric updates' },
    { icon: BarChart3, label: 'Multi-Program', desc: 'Track multiple goals' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-warm-white boho-pattern relative">
        <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-baby-blue/10 to-transparent rounded-br-full" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-tl from-warm-amber/10 to-transparent rounded-tl-full" />

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

          <h2 className="text-3xl font-bold text-ink-black mb-2 font-display">Start your journey</h2>
          <p className="text-air-force-blue mb-8">Create an account to begin tracking</p>

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
              className="w-full bg-gradient-to-r from-warm-amber to-ember-glow text-white font-semibold py-3.5 rounded-xl hover:shadow-xl hover:shadow-warm-amber/30 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 group"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 flex items-center">
            <div className="flex-grow h-px bg-sand"></div>
            <span className="px-4 text-sm text-air-force-blue">or</span>
            <div className="flex-grow h-px bg-sand"></div>
          </div>

          <p className="mt-6 text-center text-air-force-blue text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-ink-black hover:text-deep-navy font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Branding with HD Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/images/dashboard-banner.png"
          alt="Sports Motivation"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-bl from-ink-black/70 via-deep-navy/50 to-transparent" />
        <div className="absolute inset-0 tribal-pattern opacity-30" />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-warm-amber/20 p-3 rounded-2xl border border-warm-amber/30">
                <Dumbbell className="text-warm-amber w-8 h-8" />
              </div>
              <span className="text-3xl font-bold font-display text-white">FitRealm</span>
            </div>

            <h1 className="text-4xl font-bold text-white leading-tight mb-6">
              Multi-Program<br />
              <span className="gradient-text-warm">Fitness Tracking</span>
            </h1>

            <div className="space-y-4 mt-8">
              {features.map((feat, i) => (
                <motion.div
                  key={feat.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.15 }}
                  className="flex items-center space-x-4 glass-dark rounded-xl p-4"
                >
                  <div className="bg-warm-amber/20 p-2 rounded-lg">
                    <feat.icon className="w-5 h-5 text-warm-amber" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{feat.label}</div>
                    <div className="text-xs text-air-force-blue">{feat.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
