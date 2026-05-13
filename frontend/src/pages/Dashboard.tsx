import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Activity, Calendar, TrendingUp, Target, Zap, Dumbbell, Heart, Wind } from 'lucide-react';

interface Program {
  id: string;
  type: string;
  name: string;
  description: string;
}

interface Metric {
  id: string;
  metric_name: string;
  value: number;
  updated_at: string;
}

// Program icons & accent colors
const programMeta: Record<string, { icon: React.ElementType; accent: string; gradient: string; badge: string }> = {
  strength: {
    icon: Dumbbell,
    accent: 'text-warm-amber',
    gradient: 'from-warm-amber to-ember-glow',
    badge: 'bg-warm-amber/15 text-warm-amber border-warm-amber/30',
  },
  weight_loss: {
    icon: Heart,
    accent: 'text-brick-ember',
    gradient: 'from-brick-ember to-ember-glow',
    badge: 'bg-brick-ember/15 text-brick-ember border-brick-ember/30',
  },
  cardio: {
    icon: Wind,
    accent: 'text-baby-blue',
    gradient: 'from-baby-blue to-pale-sky',
    badge: 'bg-baby-blue/15 text-baby-blue border-baby-blue/30',
  },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);

  // Isolated State Management
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Form State
  const [metricName, setMetricName] = useState('');
  const [metricValue, setMetricValue] = useState('');

  // Fetch Available Programs on Mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await api.get('/programs');
        setPrograms(res.data);
        if (res.data.length > 0) {
          setActiveProgram(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch programs", err);
      }
    };
    fetchPrograms();
  }, []);

  // Fetch Isolated Metrics when Active Program Changes
  useEffect(() => {
    if (!activeProgram || !user) return;

    let isMounted = true;

    const fetchMetrics = async () => {
      setLoadingMetrics(true);
      // Clear previous metrics state to ensure strict isolation UI-side
      setMetrics([]);

      try {
        const res = await api.get(`/progress/${user.id}`, {
          params: {
            program_type: activeProgram.type,
            program_id: activeProgram.id
          }
        });

        if (isMounted) {
          setMetrics(res.data);
          setLoadingMetrics(false);
        }
      } catch (err) {
        console.error("Failed to fetch metrics", err);
        if (isMounted) setLoadingMetrics(false);
      }
    };

    fetchMetrics();

    return () => { isMounted = false; };
  }, [activeProgram, user]);

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProgram || !user || !metricName || !metricValue) return;

    try {
      await api.post('/progress/update', {
        user_id: user.id,
        program_type: activeProgram.type,
        program_id: activeProgram.id,
        metric_name: metricName,
        value: parseFloat(metricValue)
      });

      // Reset form
      setMetricName('');
      setMetricValue('');

      // Refetch to get updated list
      const res = await api.get(`/progress/${user.id}`, {
        params: {
          program_type: activeProgram.type,
          program_id: activeProgram.id
        }
      });
      setMetrics(res.data);
    } catch (err) {
      console.error("Failed to update metric", err);
    }
  };

  const meta = programMeta[activeProgram?.type || 'strength'] || programMeta.strength;
  const ProgramIcon = meta.icon;

  return (
    <div className="min-h-screen bg-ink-black flex flex-col">
      <Navbar />


      <div className="relative overflow-hidden">
        <img
          src="/images/hero-bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-black/40 via-ink-black/60 to-ink-black" />
        <div className="absolute inset-0 tribal-pattern opacity-20" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h1
                key={activeProgram?.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl font-bold text-white font-display"
              >
                {activeProgram?.name || 'Dashboard'}
              </motion.h1>
              <p className="text-air-force-blue mt-1">{activeProgram?.description}</p>
            </div>

            {/* Active program badge */}
            <motion.div
              key={activeProgram?.type}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${meta.badge} self-start`}
            >
              <ProgramIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">{activeProgram?.type?.replace('_', ' ').toUpperCase()}</span>
            </motion.div>
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* Program Selector Tabs */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold mb-3 text-air-force-blue uppercase tracking-widest">Switch Program</h2>
          <div className="flex flex-wrap gap-3">
            {programs.map((p) => {
              const pm = programMeta[p.type] || programMeta.strength;
              const PMIcon = pm.icon;
              const isActive = activeProgram?.id === p.id;

              return (
                <motion.button
                  key={p.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveProgram(p)}
                  className={`flex items-center space-x-2.5 px-5 py-3 rounded-2xl transition-all font-medium text-sm border ${isActive
                    ? `bg-gradient-to-r ${pm.gradient} border-transparent text-white shadow-lg`
                    : 'glass-dark border-air-force-blue/20 text-gray-400 hover:text-white hover:border-air-force-blue/40'
                    }`}
                >
                  <PMIcon className={`w-4 h-4 ${isActive ? 'text-white' : pm.accent}`} />
                  <span>{p.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Summary Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Target, label: 'Total Metrics', value: metrics.length, color: 'text-baby-blue', bg: 'bg-baby-blue/10' },
            { icon: TrendingUp, label: 'Latest Value', value: metrics.length > 0 ? metrics[0].value : '—', color: 'text-warm-amber', bg: 'bg-warm-amber/10' },
            { icon: Zap, label: 'Active Program', value: activeProgram?.type?.replace('_', ' ') || '—', color: 'text-pale-sky', bg: 'bg-pale-sky/10' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-dark rounded-2xl p-5 flex items-center space-x-4"
            >
              <div className={`${card.bg} p-3 rounded-xl`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <div className="text-xs text-air-force-blue uppercase tracking-wider">{card.label}</div>
                <div className="text-xl font-bold text-white font-display capitalize">{card.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Add Metric Form */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-warm rounded-2xl p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className={`bg-gradient-to-br ${meta.gradient} p-2.5 rounded-xl`}>
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-ink-black font-display">Record Progress</h3>
              </div>

              <form onSubmit={handleAddMetric} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-dark mb-1.5">Metric Name</label>
                  <input
                    type="text"
                    placeholder="e.g. bench_press_max"
                    className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-ink-black placeholder-air-force-blue focus:outline-none focus:border-warm-amber focus:ring-2 focus:ring-warm-amber/20 transition-all"
                    value={metricName}
                    onChange={(e) => setMetricName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-dark mb-1.5">Value</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 100"
                    className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-ink-black placeholder-air-force-blue focus:outline-none focus:border-warm-amber focus:ring-2 focus:ring-warm-amber/20 transition-all"
                    value={metricValue}
                    onChange={(e) => setMetricValue(e.target.value)}
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`w-full flex items-center justify-center space-x-2 bg-gradient-to-r ${meta.gradient} text-white font-semibold py-3 rounded-xl shadow-lg transition-all mt-2`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Record</span>
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* Metrics Display */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-cream font-display">
                Progress Metrics
              </h3>
              <span className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${meta.badge}`}>
                {metrics.length} recorded
              </span>
            </div>

            {loadingMetrics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="glass-dark h-32 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : metrics.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-dark rounded-2xl p-14 flex flex-col items-center justify-center text-center border-2 border-dashed border-air-force-blue/20"
              >
                <div className="bg-air-force-blue/10 p-4 rounded-2xl mb-4">
                  <ProgramIcon className="w-10 h-10 text-air-force-blue opacity-50" />
                </div>
                <p className="text-gray-400 font-semibold font-display">No progress recorded yet</p>
                <p className="text-gray-500 text-sm mt-1.5">Add your first metric to start tracking!</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence>
                  {metrics.map((metric, i) => (
                    <motion.div
                      key={metric.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-metric rounded-2xl p-5 group hover:border-warm-amber/40 transition-all relative overflow-hidden"
                    >
                      {/* Decorative corner accent */}
                      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${meta.gradient} opacity-10 rounded-bl-3xl`} />

                      <div className="flex justify-between items-start mb-3 relative z-10">
                        <span className={`text-xs font-semibold uppercase tracking-widest ${meta.accent} group-hover:brightness-125 transition-all`}>
                          {metric.metric_name.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(metric.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-4xl font-extrabold text-white tracking-tight font-display relative z-10">
                        {metric.value}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-air-force-blue/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span className="text-xs text-gray-600">© 2026 FitRealm — Multi-Tenant Fitness Tracker</span>
          <span className="text-xs text-gray-600">Data Isolation: <span className="text-warm-amber font-semibold">Active</span></span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
