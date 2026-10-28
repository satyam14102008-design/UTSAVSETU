import React from 'react';
import { NavLink } from 'react-router-dom';
import { useEvent } from '../context/EventContext';
import {
  LayoutDashboard,
  CalendarDays,
  Palette,
  Users,
  Send,
  CheckCircle2,
  PieChart,
  UserCheck,
  Bot,
  FileSpreadsheet,
  Settings,
  Sparkles,
  Github,
  Linkedin
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<Props> = ({ isOpen, onClose }) => {
  const { activeEvent, activeConfig } = useEvent();

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/events', label: 'My Events', icon: CalendarDays },
    { to: '/invitation-studio', label: 'Invitation Studio', icon: Palette, highlight: true },
    { to: '/guests', label: 'Guests & Families', icon: Users },
    { to: '/whatsapp', label: 'Invitations & WhatsApp', icon: Send },
    { to: '/rsvp-tracking', label: 'RSVP Tracking', icon: CheckCircle2 },
    { to: '/budget', label: 'Budget & Food Planning', icon: PieChart },
    { to: '/attendance', label: 'Attendance Check-in', icon: UserCheck },
    { to: '/smart-assist', label: 'Smart Assistant', icon: Bot },
    { to: '/reports', label: 'Reports & Exports', icon: FileSpreadsheet },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white/80 backdrop-blur-md border-r border-[#D4AF37]/20 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 overflow-y-auto flex-1 space-y-6">
          {/* Active Event Mini Pill */}
          {activeEvent && (
            <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/30 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#800020]">
                  Active Celebration
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <h4 className="text-xs font-bold text-stone-900 truncate">{activeEvent.title}</h4>
              <p className="text-[11px] text-stone-500 mt-0.5 truncate">📍 {activeEvent.venue_name}</p>
              {activeConfig && (
                <div className="mt-2 pt-2 border-t border-[#D4AF37]/20 flex items-center justify-between text-[10px] text-stone-600 font-medium">
                  <span>{activeConfig.badge}</span>
                  <span className="text-[#800020] font-semibold">{activeEvent.date}</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-2">
              Event Management
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                    isActive
                      ? 'bg-[#800020] text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF7F2]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`w-4 h-4 shrink-0 transition ${
                        isActive ? 'text-[#D4AF37]' : 'text-stone-400 group-hover:text-stone-700'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                    {item.highlight && (
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] ml-auto shrink-0 opacity-80" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Brand Info & Developer Credit */}
        <div className="p-3 border-t border-stone-100 text-center space-y-1.5 bg-[#FAF7F2]/50">
          <p className="text-[10px] text-stone-500 font-medium">
            UtsavSetu (उत्सवसेतु) • v1.0
          </p>
          <div className="text-[10px] text-stone-600">
            Crafted by <span className="font-bold text-[#800020]">Satyam Rai</span>
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            <a
              href="https://github.com/satyam14102008-design"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400 hover:text-stone-900 transition hover:scale-110"
              title="Satyam Rai on GitHub"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
            <span className="text-stone-300">•</span>
            <a
              href="https://www.linkedin.com/in/satyam-rai-65a298386/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400 hover:text-[#0A66C2] transition hover:scale-110"
              title="Satyam Rai on LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};

