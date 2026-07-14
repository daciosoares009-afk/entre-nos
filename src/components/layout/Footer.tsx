import { Instagram, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { env } from '../../config/env';
import logoEntreNos from '../../assets/logo-entre-nos-experience-transparent.png';

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1fr_auto]">
        <div>
          <div className="mb-3 inline-flex rounded-md p-3 font-bold text-dark">
            <img
              src={logoEntreNos}
              alt="Entre Nós Experience"
              className="h-20 w-56 rounded-sm object-contain"
            />
          </div>
          <p className="max-w-xl text-sm text-muted">
            MVP para divulgação do evento, inscrições, produtos oficiais e captação de patrocinadores.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <a className="inline-flex items-center gap-2 text-muted hover:text-primary" href="https://instagram.com" target="_blank" rel="noreferrer">
            <Instagram size={18} /> Instagram
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
      <div className="border-t border-slate-100 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Entre Nós Experience. Todos os direitos reservados.
      </div>
    </footer>
  );
}
