import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // Handled by Toast
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setSubmitting(true);
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch {
      // Handled
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-[#D4AF37]/30 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-[#800020] text-[#D4AF37] flex items-center justify-center font-serif text-2xl font-bold mx-auto border border-[#D4AF37]/40 shadow-md">
            ॐ
          </div>
          <h2 className="text-2xl font-bold font-serif text-stone-900 pt-2">Welcome to UtsavSetu</h2>
          <p className="text-xs text-stone-500">Sign in to manage your celebrations, invitations & guests</p>
        </div>

        {/* Demo Mode Quick Sign-in Callout */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300/70 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Instant Demo Access</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-snug">
            Explore with preloaded Indian weddings, birthdays, poojas & engagements without setting up credentials.
          </p>
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Click Here for 1-Click Demo Login
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-stone-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-stone-400 uppercase tracking-wider font-semibold">
            or sign in with password
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rajesh.sharma@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {submitting ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-stone-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#800020] font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

