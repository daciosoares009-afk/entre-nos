import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logoEntreNos from '../../assets/logo-entre-nos-experience-transparent.png';

const navItems = [
  { label: 'Evento', href: '/#evento' },
  { label: 'Palestrantes', href: '/#palestrantes' },
  { label: 'Programação', href: '/#programacao' },
  { label: 'Produtos', href: '/#produtos' },
  { label: 'Patrocínio', href: '/patrocinador' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 rounded-md bg-dark px-2 py-1 font-bold text-dark">
          <img
            src={logoEntreNos}
            alt="Entre Nós Experience"
            className="h-10 w-36 rounded-sm object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) =>
            item.href.startsWith('/#') ? (
              <a key={item.label} href={item.href} className="text-sm font-medium text-muted hover:text-primary">
                {item.label}
              </a>
            ) : (
              <NavLink key={item.label} to={item.href} className="text-sm font-medium text-muted hover:text-primary">
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden lg:block">
          <Link to="/inscricao" className="btn-primary py-2.5">
            Participar do evento
          </Link>
        </div>

        <button className="rounded-md p-2 text-dark lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <div className="container-page grid gap-2 py-4">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setOpen(false)} className="rounded-md px-2 py-2 text-sm font-medium text-muted hover:bg-background hover:text-primary">
                {item.label}
              </a>
            ))}
            <Link to="/inscricao" onClick={() => setOpen(false)} className="btn-primary mt-2">
              Participar do evento
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
