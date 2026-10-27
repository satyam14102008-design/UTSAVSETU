import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { EventsListPage } from './pages/EventsListPage';
import { CreateEventWizard } from './pages/CreateEventWizard';
import { InvitationStudioPage } from './pages/InvitationStudioPage';
import { GuestsPage } from './pages/GuestsPage';
import { InvitationsWhatsAppPage } from './pages/InvitationsWhatsAppPage';
import { RSVPTrackingPage } from './pages/RSVPTrackingPage';
import { BudgetPlanningPage } from './pages/BudgetPlanningPage';
import { AttendanceCheckInPage } from './pages/AttendanceCheckInPage';
import { SmartAssistPage } from './pages/SmartAssistPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PublicRSVPPage } from './pages/PublicRSVPPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2]">
        <div className="w-16 h-16 rounded-3xl bg-[#800020] text-[#D4AF37] flex items-center justify-center text-3xl font-serif shadow-2xl animate-bounce">
          ॐ
        </div>
        <p className="mt-4 font-serif font-bold text-[#800020] tracking-widest text-sm uppercase">
          Loading UtsavSetu...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Main Authenticated Dashboard Shell Layout
const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 overflow-x-hidden p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/events" element={<EventsListPage />} />
              <Route path="/events/create" element={<CreateEventWizard />} />
              <Route path="/invitation-studio" element={<InvitationStudioPage />} />
              <Route path="/guests" element={<GuestsPage />} />
              <Route path="/whatsapp" element={<InvitationsWhatsAppPage />} />
              <Route path="/rsvp-tracking" element={<RSVPTrackingPage />} />
              <Route path="/budget" element={<BudgetPlanningPage />} />
              <Route path="/attendance" element={<AttendanceCheckInPage />} />
              <Route path="/smart-assist" element={<SmartAssistPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/rsvp/:token" element={<PublicRSVPPage />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invitation-studio"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guests"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/whatsapp"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rsvp-tracking"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/budget"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/smart-assist"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

