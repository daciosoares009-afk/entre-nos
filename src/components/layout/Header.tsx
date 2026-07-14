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
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link to="/" onClick={() => setOpen(false)} className="flex min-w-0 items-center rounded-md py-1 font-bold text-dark">
          <img
            src={logoEntreNos}
            alt="Entre Nós Experience"
            className="h-9 w-32 rounded-sm object-contain sm:h-10 sm:w-36"
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

        <button className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-dark transition hover:bg-background lg:hidden" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <div className="container-page grid gap-1 py-3">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-background hover:text-primary">
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
