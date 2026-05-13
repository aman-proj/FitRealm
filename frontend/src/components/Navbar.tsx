import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Dumbbell, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-ink-black/90 backdrop-blur-xl border-b border-air-force-blue/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-warm-amber to-ember-glow p-2 rounded-xl">
              <Dumbbell className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold font-display text-white">
              Fit<span className="text-warm-amber">Realm</span>
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-5">
            {/* User badge */}
            <div className="hidden sm:flex items-center space-x-2 bg-slate-dark/60 px-3 py-1.5 rounded-full border border-air-force-blue/15">
              <Flame className="w-3.5 h-3.5 text-warm-amber" />
              <span className="text-sm text-cream/80">{user?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-air-force-blue hover:text-brick-ember transition-colors group"
            >
              <LogOut className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:block text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
