import { Instagram, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { env } from '../../config/env';
import logoEntreNos from '../../assets/logo-entre-nos-experience-transparent.png';

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="container-page grid gap-7 py-8 sm:py-10 md:grid-cols-[1fr_auto]">
        <div>
          <div className="mb-3 inline-flex max-w-full rounded-md py-2 font-bold text-dark sm:p-3">
            <img
              src={logoEntreNos}
              alt="Entre Nós Experience"
              className="h-16 w-48 rounded-sm object-contain sm:h-20 sm:w-56"
            />
          </div>
          <p className="max-w-xl text-sm text-muted">
            MVP para divulgação do evento, inscrições, produtos oficiais e captação de patrocinadores.
          </p>
        </div>
        <div className="grid grid-cols-2 items-center gap-4 text-sm sm:flex sm:flex-wrap md:max-w-sm md:justify-end">
          <a className="inline-flex items-center gap-2 text-muted hover:text-primary" href={`https://instagram.com/${env.instagramUsername}`} target="_blank" rel="noreferrer">
            <Instagram size={18} /> @{env.instagramUsername}
          </a>
          <a className="inline-flex items-center gap-2 text-muted hover:text-primary" href={`https://wa.me/${env.whatsappNumber}`} target="_blank" rel="noreferrer">
            <MessageCircle size={18} /> WhatsApp
          </a>
          <Link className="text-muted hover:text-primary" to="/privacidade">
            Privacidade
          </Link>
          <Link className="text-muted hover:text-primary" to="/termos">
            Termos
          </Link>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-4 text-center text-xs leading-5 text-muted">
        © {new Date().getFullYear()} Entre Nós Experience. Todos os direitos reservados.
      </div>
    </footer>
  );
}
