import { describe, expect, it } from 'vitest';
import { calculateTotal, productConfig } from './products';

describe('calculateTotal', () => {
  it('sempre cobra pelo menos um ingresso', () => {
    expect(calculateTotal({})).toBe(15);
  });

  it('calcula vários ingressos e todos os produtos', () => {
    expect(calculateTotal({
      ticketQuantity: 3,
      wantsShirt: true, shirtQuantity: 2,
      wantsButton: true, buttonQuantity: 2,
      wantsCup: true, cupQuantity: 1,
      wantsMug: true, mugQuantity: 1,
    })).toBe(204.8);
  });

  it('mantém os preços oficiais esperados', () => {
    expect(productConfig).toMatchObject({ ticketPrice: 15, shirtPrice: 45, cupPrice: 12, mugPrice: 40, buttonPrice: 8.9 });
  });
});
