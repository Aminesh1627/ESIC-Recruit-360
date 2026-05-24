import React from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from '@/lib/store';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { Toaster } from '@/components/ui/sonner';
import { AppShell } from '@/components/layout/AppShell';

import LoginPage from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Vacancies from '@/pages/Vacancies';
import VacancyCreate from '@/pages/VacancyCreate';
import Advertisements from '@/pages/Advertisements';
import Applications from '@/pages/Applications';
import Screening from '@/pages/Screening';
import DocumentVerification from '@/pages/DocumentVerification';
import Interviews from '@/pages/Interviews';
import MeritList from '@/pages/MeritList';
import Results from '@/pages/Results';
import Offers from '@/pages/Offers';
import Grievances from '@/pages/Grievances';
import AuditLedger from '@/pages/AuditLedger';
import Reports from '@/pages/Reports';
import SuperAdmin from '@/pages/SuperAdmin';
import CandidatePortal from '@/pages/CandidatePortal';

function RootRedirect() {
  const { user } = useStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'candidate') return <Navigate to="/portal" replace />;
  if (user.role === 'super_admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="font-display text-5xl font-semibold text-primary">404</div>
      <p className="mt-2 text-muted-foreground">The page you're looking for doesn't exist on the ESIC chain.</p>
      <a href="/" className="mt-6 text-sm text-primary font-medium hover:underline" data-testid="404-home-link">Return home →</a>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated shell */}
            <Route element={<AppShell />}>
              {/* Recruitment workspace */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vacancies" element={<Vacancies />} />
              <Route path="/vacancies/new" element={<VacancyCreate />} />
              <Route path="/advertisements" element={<Advertisements />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/screening" element={<Screening />} />
              <Route path="/dv" element={<DocumentVerification />} />
              <Route path="/interviews" element={<Interviews />} />
              <Route path="/merit" element={<MeritList />} />
              <Route path="/results" element={<Results />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/grievances" element={<Grievances />} />
              <Route path="/audit" element={<AuditLedger />} />
              <Route path="/reports" element={<Reports />} />

              {/* Super Admin */}
              <Route path="/admin" element={<SuperAdmin />} />
              <Route path="/admin/:section" element={<SuperAdmin />} />

              {/* Candidate Portal */}
              <Route path="/portal" element={<CandidatePortal />} />
              <Route path="/portal/:section" element={<CandidatePortal />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-right" richColors closeButton />
        </BrowserRouter>
      </StoreProvider>
    </LanguageProvider>
  );
}

export default App;
