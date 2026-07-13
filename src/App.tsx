import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { RegistrationPage } from './pages/RegistrationPage';
import { SponsorPage } from './pages/SponsorPage';
import { SuccessPage } from './pages/SuccessPage';
import { TicketPage } from './pages/TicketPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/inscricao" element={<RegistrationPage />} />
        <Route path="/sucesso" element={<SuccessPage />} />
        <Route path="/patrocinador" element={<SponsorPage />} />
        <Route path="/ingresso/:codigo" element={<TicketPage />} />
        <Route path="/privacidade" element={<PrivacyPage />} />
        <Route path="/termos" element={<TermsPage />} />
      </Routes>
    </Layout>
  );
}
