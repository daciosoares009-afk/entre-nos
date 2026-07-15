import type { Ticket } from '../types';

type TicketPdfInput = {
  ticket: Ticket;
  ticketUrl: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
};

export async function createTicketPdfBlob(input: TicketPdfInput) {
  const [{ jsPDF }, QRCode] = await Promise.all([import('jspdf'), import('qrcode')]);
  const document = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const qrCode = await QRCode.toDataURL(input.ticketUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 720,
    color: { dark: '#080B25', light: '#FFFFFF' },
  });

  document.setProperties({
    title: `Ingresso ${input.eventName}`,
    subject: `Ingresso de ${input.ticket.name}`,
    author: 'Entre Nós Experience',
    creator: 'Entre Nós Experience',
  });

  document.setFillColor(46, 16, 101);
  document.roundedRect(14, 14, 182, 44, 4, 4, 'F');
  document.setTextColor(255, 255, 255);
  document.setFont('helvetica', 'bold');
  document.setFontSize(12);
  document.text('ENTRE NÓS EXPERIENCE', 24, 29);
  document.setFontSize(25);
  document.text('INGRESSO DIGITAL', 24, 43);
  document.setFont('helvetica', 'normal');
  document.setFontSize(10);
  document.text('Apresente este QR Code na entrada do evento.', 24, 51);

  document.setFillColor(220, 252, 231);
  document.setDrawColor(22, 163, 74);
  document.roundedRect(14, 66, 182, 21, 3, 3, 'FD');
  document.setTextColor(22, 101, 52);
  document.setFont('helvetica', 'bold');
  document.setFontSize(17);
  document.text('PAGAMENTO CONFIRMADO', 105, 79.5, { align: 'center' });

  document.setTextColor(8, 11, 37);
  document.setFontSize(9);
  document.setFont('helvetica', 'bold');
  document.text('TITULAR DO INGRESSO', 20, 103);
  let nameFontSize = 19;
  let nameLines = document.splitTextToSize(input.ticket.name, 170) as string[];
  while (nameLines.length > 2 && nameFontSize > 11) {
    nameFontSize -= 1;
    document.setFontSize(nameFontSize);
    nameLines = document.splitTextToSize(input.ticket.name, 170) as string[];
  }
  document.setFontSize(nameFontSize);
  document.text(nameLines, 20, 114);

  document.setDrawColor(226, 232, 240);
  document.roundedRect(14, 124, 94, 75, 3, 3, 'S');
  document.setFontSize(9);
  document.setTextColor(104, 100, 119);
  document.text('Número da inscrição', 20, 137);
  document.text('Código do ingresso', 20, 158);
  document.text('Data e horário', 20, 179);
  document.setFont('helvetica', 'bold');
  document.setFontSize(12);
  document.setTextColor(8, 11, 37);
  document.text(input.ticket.registration_number, 20, 145);
  document.text(input.ticket.ticket_code, 20, 166);
  document.text(`${input.eventDate}, ${input.eventTime}`, 20, 187);

  document.addImage(qrCode, 'PNG', 124, 124, 58, 58);
  document.setFont('helvetica', 'normal');
  document.setFontSize(8);
  document.setTextColor(104, 100, 119);
  document.text('Escaneie para validar', 153, 190, { align: 'center' });

  document.setFillColor(248, 247, 252);
  document.roundedRect(14, 208, 182, 32, 3, 3, 'F');
  document.setFont('helvetica', 'bold');
  document.setTextColor(8, 11, 37);
  document.setFontSize(10);
  document.text('LOCAL DO EVENTO', 20, 220);
  document.setFont('helvetica', 'normal');
  document.setFontSize(12);
  document.text(input.eventLocation, 20, 230, { maxWidth: 170 });

  document.setTextColor(104, 100, 119);
  document.setFontSize(8);
  document.text('O ingresso é pessoal. A equipe poderá solicitar documento do titular.', 105, 258, { align: 'center' });
  document.text('A validade e o uso são consultados online no momento da entrada.', 105, 264, { align: 'center' });
  document.setTextColor(109, 40, 217);
  document.text(input.ticketUrl, 105, 274, { align: 'center', maxWidth: 176 });
  document.setTextColor(148, 143, 160);
  document.text('Página 1 de 1', 105, 287, { align: 'center' });

  return document.output('blob');
}

export function ticketPdfFileName(ticketCode: string) {
  return `ingresso-entre-nos-${ticketCode.replace(/[^a-zA-Z0-9-]/g, '')}.pdf`;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
