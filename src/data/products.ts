export const productConfig = {
  provisional: false,
  shirtPrice: 45,
  cupPrice: 12,
  mugPrice: 40,
  buttonPrice: 8.9,
  shirtColors: ['branca', 'preta'] as const,
  shirtSizes: ['PP', 'P', 'M', 'G', 'GG', 'XGG'] as const,
};

export function calculateTotal(input: {
  wantsShirt?: boolean;
  shirtQuantity?: number;
  wantsButton?: boolean;
  buttonQuantity?: number;
  wantsCup?: boolean;
  cupQuantity?: number;
  wantsMug?: boolean;
  mugQuantity?: number;
}) {
  const shirtTotal = input.wantsShirt ? (input.shirtQuantity ?? 1) * productConfig.shirtPrice : 0;
  const buttonTotal = input.wantsButton ? (input.buttonQuantity ?? 1) * productConfig.buttonPrice : 0;
  const cupTotal = input.wantsCup ? (input.cupQuantity ?? 1) * productConfig.cupPrice : 0;
  const mugTotal = input.wantsMug ? (input.mugQuantity ?? 1) * productConfig.mugPrice : 0;
  return Number((shirtTotal + buttonTotal + cupTotal + mugTotal).toFixed(2));
}
