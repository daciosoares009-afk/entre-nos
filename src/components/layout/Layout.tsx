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
