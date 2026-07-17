export const catalog = Object.freeze({ ticket: 15, shirt: 45, cup: 12, mug: 40 });

export function calculateServerTotal(input: {
  ticketQuantity: number; wantsShirt: boolean; shirtQuantity: number;
  wantsCup: boolean; cupQuantity: number; wantsMug: boolean; mugQuantity: number;
}) {
  return Number((input.ticketQuantity * catalog.ticket +
    (input.wantsShirt ? input.shirtQuantity * catalog.shirt : 0) +
    (input.wantsCup ? input.cupQuantity * catalog.cup : 0) +
    (input.wantsMug ? input.mugQuantity * catalog.mug : 0)).toFixed(2));
}
