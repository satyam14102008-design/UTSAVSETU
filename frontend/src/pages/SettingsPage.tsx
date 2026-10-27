import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiService } from '../services/api';
import {
  Settings,
  MessageSquare,
  ShieldCheck,
  Database,
  ExternalLink,
  Key,
  CheckCircle2,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [waStatus, setWaStatus] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);

  useEffect(() => {
    ApiService.getWhatsAppStatus().then(setWaStatus).catch(console.error);
    fetch('/health')
      .then((r) => r.json())
      .then((d) => setDbStatus(d.database))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-[#D4AF37]/30 shadow-xs">
        <span className="text-xs uppercase font-bold tracking-wider text-[#800020]">
          System & WhatsApp Integrations
        </span>
        <h1 className="text-xl font-bold font-serif text-stone-900 mt-0.5">
          Account Settings & Communication Adapters
        </h1>
      </div>

      {/* WhatsApp Cloud API & Demo Mode Configuration */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif text-stone-900">
                Official WhatsApp Business Platform Cloud API
              </h2>
              <p className="text-xs text-stone-500">
                Direct integration with Meta Graph API for verified messaging & webhooks
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              waStatus?.is_cloud_api_configured
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {waStatus?.is_cloud_api_configured ? '✓ Cloud API Active' : '⚡ Interactive Demo Mode'}
          </span>
        </div>

        {/* Demo Mode Guide */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300/60 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Interactive Demo Mode Capabilities (No paid credentials needed)</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-amber-800 text-[11px] leading-relaxed">
            <li>Direct one-click <b>wa.me</b> prefilled WhatsApp opening for any device.</li>
            <li>Instant personalized tokenized RSVP links for every guest.</li>
            <li>Simulated message dispatch with logged delivery timestamps.</li>
            <li>Fully functional guest RSVP forms, dietary tracking, and food calculations.</li>
          </ul>
        </div>

        {/* Cloud API Configuration Guide */}
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-[#800020]" /> Enabling Live Meta WhatsApp Cloud API
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            To switch from demo mode to live Meta verified delivery, set the following environment variables in your server configuration:
          </p>
          <div className="p-4 bg-stone-900 rounded-2xl text-stone-200 font-mono text-xs space-y-1.5 overflow-x-auto">
            <p><span className="text-emerald-400">WHATSAPP_API_TOKEN</span>="EAAG..."</p>
            <p><span className="text-emerald-400">WHATSAPP_PHONE_NUMBER_ID</span>="1058..."</p>
            <p><span className="text-emerald-400">WHATSAPP_BUSINESS_ACCOUNT_ID</span>="1042..."</p>
            <p><span className="text-emerald-400">WHATSAPP_WEBHOOK_VERIFY_TOKEN</span>="utsavsetu_verify_token_2026"</p>
          </div>
        </div>
      </div>

      {/* Database & System Health */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#800020]/10 text-[#800020] flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-serif text-stone-900">
              Database & Storage Architecture
            </h2>
            <p className="text-xs text-stone-500">
              MongoDB with PyMongo integration and automatic resilient local document fallback
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-50 space-y-1">
            <span className="text-stone-400 text-[10px] uppercase font-bold">Database Engine</span>
            <p className="font-bold text-stone-900 capitalize">
              {dbStatus?.mode?.replace(/_/g, ' ') || 'MongoDB'}
            </p>
            <p className="text-[11px] text-stone-500">
              {dbStatus?.connected_to_mongo ? 'Connected to local/remote MongoDB Server' : 'Running in resilient local persistent store'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 space-y-1">
            <span className="text-stone-400 text-[10px] uppercase font-bold">Database Name</span>
            <p className="font-bold text-stone-900 font-mono">
              {dbStatus?.database_name || 'utsavsetu_db'}
            </p>
            <p className="text-[11px] text-stone-500">
              Isolated collections for users, events, assignments, and RSVPs
            </p>
          </div>
        </div>
      </div>

      {/* Account Info */}
      {user && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold font-serif text-stone-900 border-b pb-4">
            Host Profile & Family Information
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold">Organizer Name</span>
              <p className="font-bold text-stone-900 mt-0.5">{user.name}</p>
            </div>
            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold">Account Email</span>
              <p className="font-bold text-stone-900 mt-0.5">{user.email}</p>
            </div>
            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold">Family / House Name</span>
              <p className="font-bold text-stone-900 mt-0.5">{user.family_name || 'Sharma Family'}</p>
            </div>
            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold">Phone Number</span>
              <p className="font-bold text-stone-900 mt-0.5">{user.phone || '+91 98765 43210'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

