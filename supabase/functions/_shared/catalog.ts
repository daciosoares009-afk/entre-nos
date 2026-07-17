export const catalog = Object.freeze({ ticket: 15, shirt: 45, button: 8.9, cup: 12, mug: 40 });

export function calculateServerTotal(input: {
  ticketQuantity: number; wantsShirt: boolean; shirtQuantity: number; wantsButton: boolean; buttonQuantity: number;
  wantsCup: boolean; cupQuantity: number; wantsMug: boolean; mugQuantity: number;
}) {
  return Number((input.ticketQuantity * catalog.ticket +
    (input.wantsShirt ? input.shirtQuantity * catalog.shirt : 0) +
    (input.wantsButton ? input.buttonQuantity * catalog.button : 0) +
    (input.wantsCup ? input.cupQuantity * catalog.cup : 0) +
    (input.wantsMug ? input.mugQuantity * catalog.mug : 0)).toFixed(2));
}
