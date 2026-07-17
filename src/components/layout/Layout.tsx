import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import { env } from '../../config/env';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const routeTitles: Record<string, string> = {
  '/': 'Entre Nós Experience',
  '/inscricao': 'Inscrição | Entre Nós Experience',
  '/sucesso': 'Pagamento e ingresso | Entre Nós Experience',
  '/patrocinador': 'Seja patrocinador | Entre Nós Experience',
  '/privacidade': 'Privacidade | Entre Nós Experience',
  '/termos': 'Termos de uso | Entre Nós Experience',
  '/equipe/login': 'Login da equipe | Entre Nós Experience',
  '/equipe/check-in': 'Validar ingresso | Entre Nós Experience',
  '/recuperar': 'Recuperar inscrição | Entre Nós Experience',
};

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    document.title = location.pathname.startsWith('/ingresso/')
      ? 'Ingresso digital | Entre Nós Experience'
      : routeTitles[location.pathname] ?? 'Página não encontrada | Entre Nós Experience';
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="sr-only z-[100] rounded-md bg-white px-4 py-3 font-bold text-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="main-content" tabIndex={-1}>{children}</main>

      <a
        className="fixed bottom-5 right-5 z-50 hidden h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white p-0 shadow-[0_12px_30px_rgba(37,211,102,0.3)] transition hover:-translate-y-0.5 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 sm:flex"
        href={`https://wa.me/${env.whatsappNumber}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Abrir suporte via WhatsApp"
      >
        <WhatsAppIcon className="h-full w-full object-cover" aria-hidden="true" />
      </a>

      <Footer />
    </div>
  );
}
