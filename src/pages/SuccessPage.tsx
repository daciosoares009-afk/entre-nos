import { MessageCircle, Receipt, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { env } from '../config/env';
import type { RegistrationSummary } from '../types';
import { formatCurrency } from '../utils/format';

function getSummary(): RegistrationSummary | null {
  const raw = sessionStorage.getItem('entre-nos-registration');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RegistrationSummary;
  } catch {
    return null;
  }
}

export function SuccessPage() {
  const summary = getSummary();

  if (!summary) {
    return (
      <section className="container-page py-16">
        <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 text-center shadow-soft">
          <h1 className="text-3xl font-bold text-dark">Inscrição não encontrada nesta sessão</h1>
          <p className="mt-3 text-muted">Conclua o formulário de inscrição para ver o resumo e as orientações de pagamento.</p>
          <Link to="/inscricao" className="btn-primary mt-6">
            Fazer inscrição
          </Link>
        </div>
      </section>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Olá! Enviei o comprovante do Entre Nós Experience. Inscrição: ${summary.registrationNumber}`,
  );

  return (
    <section className="container-page py-12">
      <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-soft sm:p-8">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success">
          <Receipt size={30} />
        </div>
        <h1 className="mt-5 text-3xl font-bold text-dark">Inscrição registrada</h1>
        <p className="mt-3 text-muted">Seu ingresso será liberado após confirmação manual do pagamento pela equipe.</p>

        <div className="mt-6 rounded-lg border border-slate-100 bg-background p-5">
          <p className="text-sm text-muted">Número da inscrição</p>
          <p className="text-2xl font-bold text-primary">{summary.registrationNumber}</p>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <span>Camiseta: {summary.wantsShirt ? `${summary.shirtQuantity} ${summary.shirtColor} ${summary.shirtSize}` : 'Não selecionada'}</span>
            <span>Botton: {summary.wantsButton ? `${summary.buttonQuantity} unidade(s)` : 'Não selecionado'}</span>
            <span className="font-bold text-dark">Valor total: {formatCurrency(summary.totalAmount)}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a href={env.paymentUrl} target="_blank" rel="noreferrer" className="btn-primary">
            Acessar pagamento
          </a>
          <a href={`https://wa.me/${env.whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="btn-secondary">
            <MessageCircle size={18} /> Enviar comprovante
          </a>
        </div>

        <div className="mt-6 rounded-md bg-warning/10 p-4 text-sm text-text">
          Guarde o número da inscrição. Após a confirmação do pagamento, a equipe poderá validar seu ingresso digital.
        </div>

        <Link to={`/ingresso/${summary.ticketCode}`} className="btn-secondary mt-6">
          <Ticket size={18} /> Ver ingresso digital
        </Link>
      </div>
    </section>
  );
}
