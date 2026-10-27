import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvent } from '../context/EventContext';
import { useToast } from '../context/ToastContext';
import { ApiService } from '../services/api';
import { SmartInsight } from '../types';
import {
  Bot,
  Sparkles,
  AlertTriangle,
  Clock,
  UtensilsCrossed,
  DollarSign,
  Send,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const SmartAssistPage: React.FC = () => {
  const { activeEvent } = useEvent();
  const { showToast } = useToast();

  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeEvent) {
      setLoading(true);
      ApiService.getSmartInsights(activeEvent.id)
        .then((res) => {
          setInsights(res.insights);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [activeEvent]);

  if (!activeEvent) {
    return <div className="p-8 text-center text-stone-500">Please select an event.</div>;
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">High Priority</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Medium Priority</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Recommendation</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-[#D4AF37]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#800020]">
              AI Smart Assistant
            </span>
            <span className="text-xs text-stone-400">• {activeEvent.title}</span>
          </div>
          <h1 className="text-xl font-bold font-serif text-stone-900 mt-0.5">
            Automated Heuristics, Alerts & Recommendations
          </h1>
        </div>

        <Link
          to="/whatsapp"
          className="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition self-start sm:self-auto cursor-pointer"
        >
          <Send className="w-4 h-4 text-[#D4AF37]" /> WhatsApp Reminders
        </Link>
      </div>

      {/* Info card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-[#FAF7F2] border border-[#D4AF37]/40 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#800020] shrink-0 mt-0.5" />
        <div className="text-xs text-stone-700 leading-relaxed">
          <b>Real-Time Event Intelligence:</b> These recommendations are calculated directly from your event’s guest confirmations, dietary preferences, budget allocations, and caterer minimums to help you prevent food wastage and budget overruns.
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3 hover:border-[#D4AF37] transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.priority === 'high' ? (
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                ) : item.type === 'follow_up' ? (
                  <Clock className="w-5 h-5 text-amber-600" />
                ) : (
                  <Sparkles className="w-5 h-5 text-[#800020]" />
                )}
                <h3 className="font-bold text-sm text-stone-900">{item.title}</h3>
              </div>
              {getPriorityBadge(item.priority)}
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>

            {item.guest_names && item.guest_names.length > 0 && (
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-stone-200 text-xs">
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                  Sample Guests Requiring Action:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.guest_names.map((name, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-[11px] font-medium text-stone-800">
                      {name}
                    </span>
                  ))}
                  {item.target_count && item.target_count > item.guest_names.length && (
                    <span className="text-[11px] text-stone-400 self-center">
                      +{item.target_count - item.guest_names.length} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {item.items && (
              <div className="space-y-1 p-3 bg-rose-50/50 rounded-xl border border-rose-200 text-xs">
                {item.items.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between text-rose-900 font-medium">
                    <span>{it.category}</span>
                    <span>Excess: ₹{it.excess.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-stone-100">
              {item.type === 'follow_up' && (
                <Link
                  to="/whatsapp"
                  className="px-4 py-2 rounded-xl bg-[#800020] text-white text-xs font-bold hover:bg-[#580c1f] transition shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Send WhatsApp Reminders
                </Link>
              )}
              {item.type === 'budget_alert' && (
                <Link
                  to="/budget"
                  className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition shadow-xs flex items-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Rebalance Budget Ledger
                </Link>
              )}
              {item.type === 'missing_info' && (
                <Link
                  to="/events"
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-800 text-xs font-bold hover:bg-stone-50 transition"
                >
                  Update Event Info
                </Link>
              )}
              {item.type === 'caterer_minimum' && (
                <Link
                  to="/budget"
                  className="px-4 py-2 rounded-xl bg-[#800020] text-white text-xs font-bold hover:bg-[#580c1f] transition shadow-xs flex items-center gap-1.5"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" /> Adjust Catering Quantities
                </Link>
              )}
            </div>
          </div>
        ))}

        {insights.length === 0 && (
          <div className="p-8 text-center text-xs text-stone-400 bg-white rounded-3xl border">
            All systems looking wonderful! No urgent alerts or overruns detected for this celebration.
          </div>
        )}
      </div>
    </div>
  );
};

