import { AlertCircle, CheckCircle2, Download, Loader2, QrCode, ShieldCheck, ShieldX, UserRound } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { env } from '../config/env';
import { eventInfo } from '../data/event';
import { getTicketByCode } from '../services/registrationService';
import type { Ticket as TicketType } from '../types';
import { createTicketPdfBlob, downloadBlob, ticketPdfFileName } from '../utils/ticketPdf';
import { WhatsAppIcon } from '../components/ui/WhatsAppIcon';

export function TicketPage() {
  const { codigo } = useParams();
  const [ticket, setTicket] = useState<TicketType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    async function loadTicket() {
      if (!codigo) return;
      try {
        const data = await getTicketByCode(codigo);
        setTicket(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível carregar o ingresso.');
      } finally {
        setLoading(false);
      }
    }
    loadTicket();
  }, [codigo]);

  const ticketUrl = `${env.publicSiteUrl}/ingresso/${codigo ?? ''}`;
  const isPaid = ticket?.payment_status === 'paid';
  const isValid = Boolean(ticket && isPaid && !ticket.checked_in);

  async function createPdf() {
    if (!ticket) throw new Error('Ingresso não encontrado.');
    return createTicketPdfBlob({
      ticket,
      ticketUrl,
      eventName: eventInfo.name,
      eventDate: eventInfo.date,
      eventTime: eventInfo.time,
      eventLocation: eventInfo.location,
    });
  }

  async function handleDownloadPdf() {
    if (!ticket) return;
    setActionError('');
    setPdfLoading(true);
    try {
      const blob = await createPdf();
      downloadBlob(blob, ticketPdfFileName(ticket.ticket_code));
    } catch {
      setActionError('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleWhatsAppShare() {
    if (!ticket) return;
    setActionError('');
    setShareLoading(true);
    try {
      const blob = await createPdf();
      const file = new File([blob], ticketPdfFileName(ticket.ticket_code), { type: 'application/pdf' });
      const shareData = {
        title: `Ingresso ${eventInfo.name}`,
        text: `Ingresso de ${ticket.name} - ${eventInfo.name}`,
        files: [file],
      };

      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }

      const message = encodeURIComponent(`Meu ingresso do ${eventInfo.name}: ${ticketUrl}`);
      window.location.assign(`https://wa.me/?text=${message}`);
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === 'AbortError') return;
      setActionError('Não foi possível compartilhar. Baixe o PDF e anexe-o no WhatsApp.');
    } finally {
      setShareLoading(false);
    }
  }

  return (
    <section className="container-page py-8 sm:py-12">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-4 shadow-soft sm:p-8">
        {loading && (
          <div className="flex items-center gap-3 text-muted">
            <Loader2 className="animate-spin" /> Carregando ingresso...
          </div>
        )}

        {!loading && error && <div className="rounded-md border border-error/20 bg-error/5 p-4 text-error">{error}</div>}

        {!loading && !error && !ticket && (
          <div className="text-center">
            <QrCode className="mx-auto text-muted" size={44} />
            <h1 className="mt-4 text-2xl font-bold text-dark">Ingresso não encontrado</h1>
            <p className="mt-2 text-muted">Confira o código recebido após a inscrição.</p>
          </div>
        )}

        {ticket && (
          <>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase tracking-wide text-primary">Ingresso digital</p>
                <h1 className="mt-2 break-words text-2xl font-bold leading-tight text-dark sm:text-3xl">{eventInfo.name}</h1>
                <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
                    <UserRound size={16} /> Titular do ingresso
                  </p>
                  <p className="mt-1 break-words text-xl font-extrabold text-dark">{ticket.name}</p>
                </div>
              </div>
              <div className="w-fit max-w-full self-center rounded-md border border-slate-100 bg-white p-3 sm:self-auto">
                <QRCodeSVG value={ticketUrl} size={144} className="h-auto max-w-full" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 rounded-lg bg-background p-5 text-sm sm:grid-cols-2">
              <Info label="Inscrição" value={ticket.registration_number} />
              <Info label="Código" value={ticket.ticket_code} />
              <Info label="Data" value={eventInfo.date} />
              <Info label="Horário" value={eventInfo.time} />
              <Info label="Local" value={eventInfo.location} />
              <Info label="Entrada" value={ticket.checked_in ? 'Entrada registrada' : 'Não registrada'} />
            </div>

            <div
              className={`mt-6 rounded-lg border-2 p-5 text-center ${isValid ? 'border-success bg-success/10 text-success' : 'border-error bg-error/5 text-error'}`}
              role="status"
            >
              {isValid ? <ShieldCheck className="mx-auto" size={52} /> : <ShieldX className="mx-auto" size={52} />}
              <p className="mt-3 text-2xl font-extrabold sm:text-3xl">
                {isValid ? 'INGRESSO VÁLIDO' : ticket.checked_in ? 'INGRESSO JÁ UTILIZADO' : 'INGRESSO INVÁLIDO'}
              </p>
              <p className="mt-2 text-sm font-semibold">
                {isValid
                  ? 'Pagamento aprovado. Confira o nome do titular antes de autorizar a entrada.'
                  : ticket.checked_in
                    ? 'A entrada deste ingresso já foi registrada.'
                    : 'Pagamento ainda não aprovado. Entrada não autorizada.'}
              </p>
            </div>

            <div className={`mt-4 flex items-center gap-3 rounded-md p-4 ${isPaid ? 'bg-success/10 text-success' : 'bg-warning/10 text-text'}`}>
              {isPaid ? <CheckCircle2 /> : <AlertCircle />}
              <span className="font-semibold">{isPaid ? 'Pagamento confirmado' : 'Aguardando confirmação do pagamento'}</span>
            </div>

            {isPaid && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button type="button" className="btn-primary" onClick={handleDownloadPdf} disabled={pdfLoading || shareLoading}>
                  {pdfLoading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                  Baixar ingresso em PDF
                </button>
                <button type="button" className="btn-secondary" onClick={handleWhatsAppShare} disabled={pdfLoading || shareLoading}>
                  {shareLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-sm">
                      <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                  Enviar pelo WhatsApp
                </button>
              </div>
            )}

            {actionError && <div className="mt-4 rounded-md border border-error/20 bg-error/5 p-3 text-sm text-error">{actionError}</div>}
          </>
        )}
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-muted">{label}</p>
      <p className="break-words font-semibold text-dark">{value}</p>
    </div>
  );
}
