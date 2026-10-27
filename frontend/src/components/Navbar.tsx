import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';
import { EventTypeBadge } from './EventTypeBadge';
import {
  Calendar,
  ChevronDown,
  PlusCircle,
  LogOut,
  Sparkles,
  User as UserIcon,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

interface Props {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<Props> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { events, activeEvent, setActiveEventId } = useEvent();
  const navigate = useNavigate();
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D4AF37]/25 h-16 px-4 md:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile hamburger & Brand */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#800020] text-[#D4AF37] flex items-center justify-center font-serif text-lg font-bold shadow-md border border-[#D4AF37]/40">
            ॐ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-extrabold text-lg tracking-wider text-[#800020]">UTSAVSETU</span>
              <span className="hidden sm:inline-block text-[11px] font-hindi text-[#D4AF37] tracking-wider font-semibold">
                उत्सवसेतु
              </span>
            </div>
            <p className="text-[10px] text-stone-500 tracking-tight hidden sm:block">
              One Platform. Every Celebration.
            </p>
          </div>
        </Link>
      </div>

      {/* Center: Event Switcher Dropdown */}
      {user && (
        <div className="relative">
          <button
            onClick={() => setShowEventDropdown(!showEventDropdown)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-[#D4AF37]/40 bg-white/80 hover:bg-white text-stone-800 shadow-xs transition group"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-left max-w-[140px] sm:max-w-[220px] truncate">
              <p className="text-xs font-bold text-stone-900 truncate leading-tight">
                {activeEvent ? activeEvent.title : 'Select Celebration'}
              </p>
              {activeEvent && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-stone-500 font-medium">
                    {activeEvent.date}
                  </span>
                </div>
              )}
            </div>
            {activeEvent && <EventTypeBadge type={activeEvent.event_type} showIcon={false} className="hidden lg:inline-flex scale-90" />}
            <ChevronDown className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition" />
          </button>

          {showEventDropdown && (
            <div
              className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-[#D4AF37]/30 p-2 z-50 animate-in fade-in slide-in-from-top-2"
              onClick={() => setShowEventDropdown(false)}
            >
              <div className="px-3 py-2 border-b border-stone-100 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Switch Event
                </span>
                <Link
                  to="/events/create"
                  className="text-xs text-[#800020] hover:text-[#580c1f] font-semibold flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> New
                </Link>
              </div>

              <div className="max-h-64 overflow-y-auto py-1">
                {events.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => setActiveEventId(evt.id)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 transition ${
                      activeEvent?.id === evt.id ? 'bg-[#FAF7F2] border border-[#D4AF37]/40' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#800020]/10 text-[#800020] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      {evt.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">{evt.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <EventTypeBadge type={evt.event_type} className="scale-75 origin-left" />
                        <span className="text-[10px] text-stone-500">{evt.date}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Right: Actions & User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Demo Mode Indicator Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300/60 text-amber-900 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Demo Environment Ready</span>
        </div>

        {user ? (
          <>
            <Link
              to="/events/create"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white text-xs font-semibold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Celebration</span>
            </Link>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-[#800020] flex items-center justify-center font-bold text-xs transition"
              >
                {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </button>

              {showUserDropdown && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-stone-200 p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setShowUserDropdown(false)}
                >
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                    {user.family_name && (
                      <span className="inline-block mt-1 text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">
                        {user.family_name}
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <Link
                      to="/settings"
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-stone-400" /> Settings & WhatsApp API
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-white transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white text-xs font-semibold shadow-sm transition"
            >
              Get Started Free
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

