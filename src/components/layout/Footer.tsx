import { Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { env } from '../../config/env';
import logoEntreNos from '../../assets/logo-entre-nos-experience-transparent.png';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-page flex flex-col items-center gap-5 py-6 lg:flex-row lg:justify-between lg:gap-6">
        <Link to="/" className="shrink-0 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30">
          <img src={logoEntreNos} alt="Entre Nós Experience" className="h-12 w-40 object-contain" />
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] font-semibold text-muted" aria-label="Links do rodapé">
          <a className="inline-flex whitespace-nowrap items-center gap-2 transition hover:text-primary" href={`https://instagram.com/${env.instagramUsername}`} target="_blank" rel="noreferrer">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-600 via-pink-500 to-amber-400 text-white shadow-sm">
              <Instagram size={18} strokeWidth={2.2} />
            </span>
            @{env.instagramUsername}
          </a>
          <a className="inline-flex whitespace-nowrap items-center gap-2 transition hover:text-primary" href={`https://wa.me/${env.whatsappNumber}`} target="_blank" rel="noreferrer">
            <WhatsAppIcon className="h-8 w-8 shrink-0 rounded-lg object-cover shadow-[0_6px_16px_rgba(37,211,102,0.22)]" aria-hidden="true" />
            WhatsApp
          </a>
          <Link className="whitespace-nowrap transition hover:text-primary" to="/recuperar">
            Recuperar ingresso
          </Link>
          <Link className="whitespace-nowrap transition hover:text-primary" to="/privacidade">
            Privacidade
          </Link>
          <Link className="whitespace-nowrap transition hover:text-primary" to="/termos">
            Termos
          </Link>
        </nav>

        <p className="shrink-0 text-center text-xs leading-5 text-muted lg:text-right">
          © {new Date().getFullYear()} Entre Nós Experience
        </p>
      </div>
    </footer>
  );
}
