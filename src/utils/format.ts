export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function maskPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{0,2})(\d{0,4})(\d{0,4})/, (_, ddd, first, last) =>
      [ddd && `(${ddd}`, ddd?.length === 2 && ') ', first, last && `-${last}`].filter(Boolean).join(''),
    );
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

export function sanitizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}
