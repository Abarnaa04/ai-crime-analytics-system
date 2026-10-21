import React, { useState } from 'react';
import { CrimeIncident, UserAccount } from './types';
import { INITIAL_CRIME_INCIDENTS } from './data/crimeDataset';
import { authStore } from './utils/authStore';
import { triggerPrintReport } from './utils/reportGenerator';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { PredictionView } from './components/PredictionView';
import { HotspotsView } from './components/HotspotsView';
import { AnalyticsView } from './components/AnalyticsView';
import { IncidentsView } from './components/IncidentsView';
import { HistoryView } from './components/HistoryView';
import { ModelEvaluationView } from './components/ModelEvaluationView';
import { DataQualityView } from './components/DataQualityView';
import { ReportsView } from './components/ReportsView';
import { ProfileView } from './components/ProfileView';
import { AdminView } from './components/AdminView';
import { AboutHelpView } from './components/AboutHelpView';
import { AuthView } from './components/AuthView';
import { AuthModal } from './components/AuthModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';

export default function App() {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [historyStack, setHistoryStack] = useState<string[]>(['dashboard']);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => authStore.getCurrentUser());

  // Incident state
  const [incidents] = useState<CrimeIncident[]>(INITIAL_CRIME_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<CrimeIncident | null>(null);

  // Auth modal & view state
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Navigation with robust history stack tracking
  const navigateTo = (view: string) => {
    if (view === activeView) return;
    setHistoryStack(prev => {
      if (prev[prev.length - 1] === view) return prev;
      return [...prev, view];
    });
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Visible Back button handler on every page
  const handleBack = () => {
    setHistoryStack(prev => {
      if (prev.length > 1) {
        const next = [...prev];
        next.pop(); // Remove current view
        const targetView = next[next.length - 1];
        setActiveView(targetView);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return next;
      } else {
        // Safe fallback: if logged in navigate to dashboard, otherwise landing
        const fallback = currentUser ? 'dashboard' : 'landing';
        if (activeView !== fallback) {
          setActiveView(fallback);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return [fallback];
        }
        return prev;
      }
    });
  };

  const handleOpenAuth = (mode: 'login' | 'register' | 'forgot') => {
    setAuthMode(mode);
    setAuthModalMode(mode === 'forgot' ? 'login' : mode);
    navigateTo('auth');
  };

  const handleLogout = () => {
    authStore.logout();
    setCurrentUser(null);
    navigateTo('landing');
  };

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={navigateTo}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        toggleSidebar={() => setSidebarOpen(prev => !prev)}
        onPrintReport={triggerPrintReport}
      />

      {/* Slide-out Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        setActiveView={navigateTo}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1. Public Landing View */}
        {activeView === 'landing' && (
          <LandingView
            onExploreDashboard={() => navigateTo('dashboard')}
            onTryPrediction={() => navigateTo('prediction')}
            onOpenHotspots={() => navigateTo('hotspots')}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* 2. Professional Split-Screen Login & Registration View */}
        {activeView === 'auth' && (
          <AuthView
            initialMode={authMode}
            currentUser={currentUser}
            onSuccess={(user) => {
              handleAuthSuccess(user);
              navigateTo('dashboard');
            }}
            onBackToLanding={() => navigateTo('landing')}
            onBackToDashboard={() => navigateTo('dashboard')}
          />
        )}

        {/* 3. Operational Dashboard with Back Button */}
        {activeView === 'dashboard' && (
          <DashboardView
            incidents={incidents}
            onSelectIncident={setSelectedIncident}
            onNavigateToPrediction={() => navigateTo('prediction')}
            onNavigateToHotspots={() => navigateTo('hotspots')}
            onBack={handleBack}
            onNavigate={navigateTo}
          />
        )}

        {/* 4. Predictive Modeling View with Back Button */}
        {activeView === 'prediction' && (
          <PredictionView
            onNavigateToHistory={() => navigateTo('history')}
            onBack={handleBack}
            onNavigate={navigateTo}
          />
        )}

        {/* 5. Interactive Crime Map (Hotspots) with Back Button and Real OSM Tiles */}
        {activeView === 'hotspots' && (
          <HotspotsView
            incidents={incidents}
            onSelectIncident={setSelectedIncident}
            currentUser={currentUser}
            onBack={handleBack}
            onNavigateToDashboard={() => navigateTo('dashboard')}
            onUpdateUserAvatar={(avatar) => {
              if (currentUser) {
                const updated = authStore.updateAvatar(currentUser.id, avatar);
                if (updated) setCurrentUser(updated);
              }
            }}
          />
        )}

        {/* 6. Advanced Analytics & Crime Trends with Back Button */}
        {activeView === 'analytics' && (
          <AnalyticsView
            incidents={incidents}
            onBack={handleBack}
            onNavigate={navigateTo}
          />
        )}

        {/* 7. Incidents Explorer with Back Button */}
        {activeView === 'incidents' && (
          <IncidentsView
            incidents={incidents}
            onSelectIncident={setSelectedIncident}
            onBack={handleBack}
            onNavigate={navigateTo}
          />
        )}

        {/* 8. Prediction History Log with Back Button */}
        {activeView === 'history' && (
          <HistoryView
            onBack={handleBack}
            onNavigate={navigateTo}
            onRerunPrediction={() => navigateTo('prediction')}
          />
        )}

        {/* 9. Model Evaluation Metrics with Back Button */}
        {activeView === 'evaluation' && (
          <ModelEvaluationView
            onBack={handleBack}
            onNavigate={navigateTo}
          />
        )}

        {/* 10. Data Quality Audit with Back Button */}
        {activeView === 'dataquality' && (
          <DataQualityView
            incidents={incidents}
            onBack={handleBack}
            onNavigate={navigateTo}
          />
        )}

        {/* 11. Intelligence Reports with Back Button */}
        {activeView === 'reports' && (
          <ReportsView
            incidents={incidents}
            onBack={handleBack}
            onNavigate={navigateTo}
          />
        )}

        {/* 12. User Profile with Back Button */}
        {activeView === 'profile' && currentUser && (
          <ProfileView
            currentUser={currentUser}
            onUserUpdated={setCurrentUser}
            onNavigateToMap={() => navigateTo('hotspots')}
            onBack={handleBack}
            onNavigate={navigateTo}
          />
        )}

        {/* 13. System Administration Console with Back Button */}
        {activeView === 'admin' && (
          <AdminView
            currentUser={currentUser || authStore.getAllUsers()[2]}
            onBack={handleBack}
            onNavigate={navigateTo}
          />
        )}

        {/* 14. Project Review Documentation with Back Button */}
        {activeView === 'about' && (
          <AboutHelpView
            onNavigateToView={navigateTo}
            onBack={handleBack}
          />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />

      {/* Professional Footer */}
      <footer className="no-print border-t border-slate-900 bg-slate-950 py-10 mt-auto text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="font-bold text-slate-200 block text-sm">
                AI Crime Analytics & Predictive Modeling System
              </span>
              <span className="text-slate-400 block mt-0.5">
                Data Analytics · Artificial Intelligence · Predictive Policing Research · Academic Project Review Edition
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button type="button" onClick={() => navigateTo('dashboard')} className="hover:text-white transition-colors">
                Dashboard
              </button>
              <button type="button" onClick={() => navigateTo('prediction')} className="hover:text-white transition-colors">
                Prediction AI
              </button>
              <button type="button" onClick={() => navigateTo('hotspots')} className="hover:text-white transition-colors">
                Hotspots GIS
              </button>
              <button type="button" onClick={() => navigateTo('reports')} className="hover:text-white transition-colors">
                Intelligence Reports
              </button>
              <button type="button" onClick={() => navigateTo('about')} className="hover:text-white transition-colors">
                Review Walkthrough
              </button>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>
              © 2026 AI Crime Analytics Research Group. All models and spatial hotspot polygons are calibrated for academic evaluation.
            </p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-emerald-400">Dataset: 380 Verified Cases</span>
              <span>·</span>
              <span className="font-mono text-blue-400">Model F1: 86.4%</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
