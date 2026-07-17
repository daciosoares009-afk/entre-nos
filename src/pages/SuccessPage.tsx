import { Check, Copy, CreditCard, Loader2, Receipt, Ticket } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { env } from '../config/env';
import { calculateTotal } from '../data/products';
import logoPix from '../assets/logo-pix.png';
import type { RegistrationSummary } from '../types';
import { createMercadoPagoCheckout, createMercadoPagoPix, type MercadoPagoPix } from '../services/paymentService';
import { formatCurrency } from '../utils/format';
import { WhatsAppIcon } from '../components/ui/WhatsAppIcon';

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
  const [pixLoading, setPixLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [pix, setPix] = useState<MercadoPagoPix | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
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

  async function handlePix() {
    if (!summary) return;
    setPaymentError('');
    setPixLoading(true);
    try {
      setPix(await createMercadoPagoPix(summary.registrationNumber, summary.ticketCode));
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Não foi possível gerar o Pix.');
    } finally {
      setPixLoading(false);
    }
  }

  async function copyPixCode() {
    if (!pix?.qrCode) return;
    await navigator.clipboard.writeText(pix.qrCode);
    setPixCopied(true);
    window.setTimeout(() => setPixCopied(false), 2500);
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
  const tickets = summary.tickets?.length
    ? summary.tickets
    : [{ registrationNumber: summary.registrationNumber, ticketCode: summary.ticketCode, name: summary.name }];
  const currentTotal = calculateTotal({ ...summary, ticketQuantity: summary.ticketQuantity ?? tickets.length });

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
            <span>Ingressos: {tickets.length}</span>
            <span>Camiseta: {summary.wantsShirt ? `${summary.shirtQuantity} ${summary.shirtColor} ${summary.shirtSize}` : 'Não selecionada'}</span>
            <span>Copo acrílico: {summary.wantsCup ? `${summary.cupQuantity} unidade(s)` : 'Não selecionado'}</span>
            <span>Caneca: {summary.wantsMug ? `${summary.mugQuantity} unidade(s)` : 'Não selecionada'}</span>
            <span className="font-bold text-dark">Valor total: {formatCurrency(currentTotal)}</span>
          </div>
          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="text-sm font-bold text-dark">Titulares</p>
            <ol className="mt-2 grid gap-1.5 text-sm text-muted sm:grid-cols-2">
              {tickets.map((ticket, index) => <li key={ticket.ticketCode}>{index + 1}. {ticket.name}</li>)}
            </ol>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={handlePix} disabled={pixLoading} className="btn-primary">
            {pixLoading ? <Loader2 className="animate-spin" size={18} /> : (
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white shadow-sm">
                <img src={logoPix} alt="" className="h-[18px] w-[18px] object-contain" />
              </span>
            )}
            Pagar com Pix
          </button>
          <button type="button" onClick={handlePayment} disabled={paymentLoading} className="btn-primary">
            {paymentLoading && <Loader2 className="animate-spin" size={18} />}
            {!paymentLoading && <CreditCard size={19} />}
            Realizar pagamentos
          </button>
          <a href={`https://wa.me/${env.whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="btn-secondary sm:col-span-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-sm">
              <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            Enviar comprovante
          </a>
        </div>

        {paymentError && <div className="mt-4 rounded-md border border-error/20 bg-error/5 p-3 text-sm text-error">{paymentError}</div>}

        {pix && (
          <div className="mt-5 rounded-lg border border-primary/15 bg-background p-4 text-center sm:p-6">
            <h2 className="text-xl font-bold text-dark">Pix gerado</h2>
            <p className="mt-1 text-sm text-muted">Pague {formatCurrency(pix.amount)} em qualquer banco. Não é necessário ter conta Mercado Pago.</p>
            <div className="mx-auto mt-5 w-fit rounded-lg bg-white p-3 shadow-sm">
              <QRCodeSVG value={pix.qrCode} size={220} level="M" includeMargin />
            </div>
            <button type="button" onClick={copyPixCode} className="btn-primary mx-auto mt-5 w-full sm:max-w-sm">
              {pixCopied ? <Check size={18} /> : <Copy size={18} />}
              {pixCopied ? 'Código Pix copiado' : 'Copiar código Pix'}
            </button>
            <p className="mt-3 text-xs text-muted">Abra o aplicativo do seu banco e escolha Pix Copia e Cola. Válido por {pix.expiresIn}.</p>
          </div>
        )}

        <div className="mt-6 rounded-md bg-warning/10 p-4 text-sm text-text">
          Guarde o número da inscrição. O status será atualizado automaticamente após a confirmação do Mercado Pago.
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {tickets.map((ticket, index) => (
            <Link key={ticket.ticketCode} to={`/ingresso/${ticket.ticketCode}`} className="btn-secondary w-full">
              <Ticket size={18} /> Ver ingresso {index + 1} - {ticket.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
