import type { ReactNode } from 'react';
import logoWhatsApp from '../../assets/logo-whatsapp.png';
import { Footer } from './Footer';
import { Header } from './Header';
import { env } from '../../config/env';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{children}</main>

      <a
        className="fixed bottom-6 right-6 z-50 hidden items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1ebe5d] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 sm:flex"
        href={`https://wa.me/${env.whatsappNumber}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Abrir suporte via WhatsApp"
      >
        <img src={logoWhatsApp} alt="" className="h-5 w-5 shrink-0 rounded-sm object-cover" />
        Suporte WhatsApp
      </a>

      <Footer />
    </div>
  );
}
