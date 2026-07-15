import { Loader2, MessageCircle, Receipt, Ticket } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { env } from '../config/env';
import { calculateTotal } from '../data/products';
import logoPix from '../assets/logo-pix.png';
import type { RegistrationSummary } from '../types';
import { createMercadoPagoCheckout } from '../services/paymentService';
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
  const [searchParams] = useSearchParams();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const paymentReturn = searchParams.get('payment');

  async function handlePayment() {
    if (!summary) return;
    setPaymentError('');
    setPaymentLoading(true);
    try {
      const checkoutUrl = await createMercadoPagoCheckout(summary.registrationNumber, summary.ticketCode);
      window.location.assign(checkoutUrl);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Não foi possível iniciar o pagamento.');
      setPaymentLoading(false);
    }
  }

  if (!summary) {
    return (
      <section className="container-page py-10 sm:py-16">
        <div className="mx-auto max-w-2xl rounded-lg bg-white p-5 text-center shadow-soft sm:p-8">
          <h1 className="text-2xl font-bold leading-tight text-dark sm:text-3xl">Inscrição não encontrada nesta sessão</h1>
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
  const currentTotal = calculateTotal(summary);

  return (
    <section className="container-page py-8 sm:py-12">
      <div className="mx-auto max-w-3xl rounded-lg bg-white p-4 shadow-soft sm:p-8">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success">
          <Receipt size={30} />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-dark sm:text-3xl">Inscrição registrada</h1>
        <p className="mt-3 text-muted">Seu ingresso será liberado automaticamente após a confirmação do pagamento pelo Mercado Pago.</p>

        {paymentReturn === 'approved' && <div className="mt-5 rounded-md border border-success/20 bg-success/10 p-4 text-sm font-semibold text-success">Pagamento recebido. A confirmação automática pode levar alguns instantes.</div>}
        {paymentReturn === 'pending' && <div className="mt-5 rounded-md bg-warning/10 p-4 text-sm text-text">Pagamento pendente. O ingresso será atualizado assim que o Mercado Pago confirmar.</div>}
        {paymentReturn === 'failure' && <div className="mt-5 rounded-md border border-error/20 bg-error/5 p-4 text-sm text-error">O pagamento não foi concluído. Você pode tentar novamente.</div>}

        <div className="mt-6 rounded-lg border border-slate-100 bg-background p-5">
          <p className="text-sm text-muted">Número da inscrição</p>
          <p className="break-words text-xl font-bold text-primary sm:text-2xl">{summary.registrationNumber}</p>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <span>Camiseta: {summary.wantsShirt ? `${summary.shirtQuantity} ${summary.shirtColor} ${summary.shirtSize}` : 'Não selecionada'}</span>
            <span>Copo acrílico: {summary.wantsCup ? `${summary.cupQuantity} unidade(s)` : 'Não selecionado'}</span>
            <span>Caneca: {summary.wantsMug ? `${summary.mugQuantity} unidade(s)` : 'Não selecionada'}</span>
            <span className="font-bold text-dark">Valor total: {formatCurrency(currentTotal)}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={handlePayment} disabled={paymentLoading} className="btn-primary">
            {paymentLoading && <Loader2 className="animate-spin" size={18} />}
            {!paymentLoading && (
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white shadow-sm">
                <img src={logoPix} alt="" className="h-[18px] w-[18px] object-contain" />
              </span>
            )}
            Pagar com Pix
          </button>
          <a href={`https://wa.me/${env.whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="btn-secondary">
            <MessageCircle size={18} /> Enviar comprovante
          </a>
        </div>

        {paymentError && <div className="mt-4 rounded-md border border-error/20 bg-error/5 p-3 text-sm text-error">{paymentError}</div>}

        <div className="mt-6 rounded-md bg-warning/10 p-4 text-sm text-text">
          Guarde o número da inscrição. O status será atualizado automaticamente após a confirmação do Mercado Pago.
        </div>

        <Link to={`/ingresso/${summary.ticketCode}`} className="btn-secondary mt-6 w-full sm:w-auto">
          <Ticket size={18} /> Ver ingresso digital
        </Link>
      </div>
    </section>
  );
}
