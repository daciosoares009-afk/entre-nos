export const productConfig = {
  provisional: true,
  shirtPrice: 49.9,
  buttonPrice: 8.9,
  shirtColors: ['branca', 'preta'] as const,
  shirtSizes: ['PP', 'P', 'M', 'G', 'GG', 'XGG'] as const,
};

export function calculateTotal(input: {
  wantsShirt?: boolean;
  shirtQuantity?: number;
  wantsButton?: boolean;
  buttonQuantity?: number;
}) {
  const shirtTotal = input.wantsShirt ? (input.shirtQuantity ?? 1) * productConfig.shirtPrice : 0;
  const buttonTotal = input.wantsButton ? (input.buttonQuantity ?? 1) * productConfig.buttonPrice : 0;
  return Number((shirtTotal + buttonTotal).toFixed(2));
}
