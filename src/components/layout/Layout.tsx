import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import { env } from '../../config/env';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{children}</main>

      <a
        className="fixed bottom-5 right-5 z-50 hidden min-h-11 items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-2.5 text-[13px] font-bold tracking-[0.01em] text-white shadow-[0_12px_30px_rgba(37,211,102,0.28)] transition hover:-translate-y-0.5 hover:bg-[#1ebe5d] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 sm:flex"
        href={`https://wa.me/${env.whatsappNumber}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Abrir suporte via WhatsApp"
      >
        <WhatsAppIcon className="h-[22px] w-[22px] shrink-0" aria-hidden="true" />
        Suporte WhatsApp
      </a>

      <Footer />
    </div>
  );
}
