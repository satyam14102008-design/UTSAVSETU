import React from 'react';
import { useEvent } from '../context/EventContext';
import {
  FileSpreadsheet,
  Download,
  FileText,
  UtensilsCrossed,
  Users,
  Wallet,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { activeEvent } = useEvent();

  if (!activeEvent) {
    return <div className="p-8 text-center text-stone-500">Please select an event.</div>;
  }

  const reports = [
    {
      title: 'Complete Guest Roster & RSVP Status',
      desc: 'Export complete family list, phone numbers, invited headcounts, confirmed adults/children, and meal choices.',
      format: 'CSV Spreadsheet',
      url: `/api/v1/reports/events/${activeEvent.id}/guests.csv`,
      icon: Users,
      btnColor: 'bg-[#800020] text-white hover:bg-[#580c1f]',
    },
    {
      title: 'Caterer Food Preparation Order Sheet',
      desc: 'Official PDF document for the catering vendor: specifies exact recommended veg, non-veg, and child plate counts with buffer applied.',
      format: 'Printable PDF Document',
      url: `/api/v1/reports/events/${activeEvent.id}/catering-sheet.pdf`,
      icon: UtensilsCrossed,
      btnColor: 'bg-emerald-700 text-white hover:bg-emerald-800',
    },
    {
      title: 'Formal Guest Roster PDF',
      desc: 'Formatted printable PDF for the reception welcome desk with guest check-in column and dietary preferences.',
      format: 'Printable PDF Document',
      url: `/api/v1/reports/events/${activeEvent.id}/guest-list.pdf`,
      icon: FileText,
      btnColor: 'bg-stone-900 text-white hover:bg-stone-800',
    },
    {
      title: 'Budget Transactions & Expense Ledger',
      desc: 'Itemized CSV of all recorded payments, vendor names, dates, amounts, and category balances.',
      format: 'CSV Spreadsheet',
      url: `/api/v1/reports/events/${activeEvent.id}/budget.csv`,
      icon: Wallet,
      btnColor: 'bg-[#800020] text-white hover:bg-[#580c1f]',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-[#D4AF37]/30 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider text-[#800020]">
            Reports & Document Generation
          </span>
          <span className="text-xs text-stone-400">• {activeEvent.title}</span>
        </div>
        <h1 className="text-xl font-bold font-serif text-stone-900 mt-0.5">
          Download Official Reports, Caterer Sheets & CSV Data
        </h1>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r, i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#D4AF37] transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#800020]/10 text-[#800020] flex items-center justify-center">
                  <r.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                  {r.format}
                </span>
              </div>
              <h3 className="font-bold text-sm text-stone-900">{r.title}</h3>
              <p className="text-xs text-stone-500 leading-relaxed">{r.desc}</p>
            </div>

            <a
              href={r.url}
              download
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition ${r.btnColor}`}
            >
              <Download className="w-4 h-4" /> Download Report
            </a>
          </div>
        ))}
      </div>

      {/* Privacy Notice */}
      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#800020] shrink-0" />
        <span>
          <b>Data Privacy Assurance:</b> Private guest phone numbers and contact details are restricted to authorized organizers and never exposed on public invitation pages.
        </span>
      </div>
    </div>
  );
};

