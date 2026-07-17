import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="container-page flex min-h-[55vh] items-center justify-center py-12 text-center">
      <div className="max-w-lg rounded-lg bg-white p-8 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Erro 404</p>
        <h1 className="mt-2 text-3xl font-extrabold text-dark">Página não encontrada</h1>
        <p className="mt-3 leading-7 text-muted">O endereço pode ter sido digitado incorretamente ou a página não está mais disponível.</p>
        <Link to="/" className="btn-primary mt-6"><Home size={18} /> Voltar ao início</Link>
      </div>
    </section>
  );
}
