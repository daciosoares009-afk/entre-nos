function secureInteger(maxExclusive: number) {
  const maximumAccepted = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= maximumAccepted);
  return buffer[0] % maxExclusive;
}

export function createRegistrationNumber() {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const random = 1000 + secureInteger(9000);
  return `EN-${stamp}-${random}`;
}

export function createTicketCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const code = Array.from({ length: 6 }, () => chars[secureInteger(chars.length)]).join('');
  return `EN-${code}`;
}
