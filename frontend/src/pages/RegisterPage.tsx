import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, Users, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(name, email, password, phone, familyName);
      navigate('/dashboard');
    } catch {
      // Handled by toast
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
          <h2 className="text-2xl font-bold font-serif text-stone-900 pt-2">Create an Account</h2>
          <p className="text-xs text-stone-500">Manage all your family celebrations in one place</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Your Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rajesh Sharma"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Family / House Name</label>
            <div className="relative">
              <Users className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Sharma Family"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">WhatsApp Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
              />
            </div>
          </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2"
          >
            {submitting ? 'Creating account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="text-[#800020] font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

