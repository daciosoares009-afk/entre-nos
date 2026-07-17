import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const RegistrationPage = lazy(() => import('./pages/RegistrationPage').then((module) => ({ default: module.RegistrationPage })));
const SponsorPage = lazy(() => import('./pages/SponsorPage').then((module) => ({ default: module.SponsorPage })));
const SuccessPage = lazy(() => import('./pages/SuccessPage').then((module) => ({ default: module.SuccessPage })));
const TicketPage = lazy(() => import('./pages/TicketPage').then((module) => ({ default: module.TicketPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((module) => ({ default: module.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then((module) => ({ default: module.TermsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));
const StaffLoginPage = lazy(() => import('./pages/StaffLoginPage').then((module) => ({ default: module.StaffLoginPage })));
const StaffCheckInPage = lazy(() => import('./pages/StaffCheckInPage').then((module) => ({ default: module.StaffCheckInPage })));
const RecoveryPage = lazy(() => import('./pages/RecoveryPage').then((module) => ({ default: module.RecoveryPage })));

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<div className="container-page flex min-h-[45vh] items-center justify-center gap-3 text-muted" role="status"><Loader2 className="animate-spin" /> Carregando...</div>}>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/inscricao" element={<RegistrationPage />} />
        <Route path="/sucesso" element={<SuccessPage />} />
        <Route path="/patrocinador" element={<SponsorPage />} />
        <Route path="/ingresso/:codigo" element={<TicketPage />} />
        <Route path="/privacidade" element={<PrivacyPage />} />
          <Route path="/termos" element={<TermsPage />} />
          <Route path="/equipe/login" element={<StaffLoginPage />} />
          <Route path="/equipe/check-in" element={<StaffCheckInPage />} />
          <Route path="/recuperar" element={<RecoveryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
