import React from 'react';
import { EventType } from '../types';
import { Heart, Sparkles, Cake, Flame, Award, Home, Smile, PartyPopper } from 'lucide-react';

interface Props {
  type: EventType;
  showIcon?: boolean;
  className?: string;
}

export const EventTypeBadge: React.FC<Props> = ({ type, showIcon = true, className = '' }) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'wedding':
        return { label: 'Wedding', bg: 'bg-[#800020]/10 text-[#800020] border-[#800020]/30', Icon: Heart };
      case 'engagement':
        return { label: 'Engagement', bg: 'bg-pink-50 text-pink-700 border-pink-200', Icon: Sparkles };
      case 'birthday':
        return { label: 'Birthday', bg: 'bg-sky-50 text-sky-700 border-sky-200', Icon: Cake };
      case 'pooja':
        return { label: 'Pooja', bg: 'bg-amber-50 text-amber-800 border-amber-300', Icon: Flame };
      case 'anniversary':
        return { label: 'Anniversary', bg: 'bg-purple-50 text-purple-700 border-purple-200', Icon: Award };
      case 'housewarming':
        return { label: 'Griha Pravesh', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', Icon: Home };
      case 'baby_shower':
        return { label: 'Godh Bharai', bg: 'bg-rose-50 text-rose-700 border-rose-200', Icon: Smile };
      case 'naming_ceremony':
        return { label: 'Namkaran', bg: 'bg-teal-50 text-teal-700 border-teal-200', Icon: Sparkles };
      default:
        return { label: 'Celebration', bg: 'bg-stone-100 text-stone-800 border-stone-200', Icon: PartyPopper };
    }
  };

  const { label, bg, Icon } = getBadgeConfig();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} ${className}`}>
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {label}
    </span>
  );
};

