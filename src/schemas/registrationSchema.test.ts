import { describe, expect, it } from 'vitest';
import { registrationSchema } from './registrationSchema';

const valid = {
  name: 'Maria da Silva', email: 'maria@example.com', phone: '(61) 99999-9999', age: 25, city: 'Brasília', state: 'DF',
  ticketQuantity: 2, additionalTicketNames: ['Joana da Silva'], wantsShirt: false, shirtQuantity: 1,
  wantsCup: false, cupQuantity: 1, wantsMug: false, mugQuantity: 1,
  acceptedTerms: true, imageAuthorization: false, privacyConsent: true,
};

describe('registrationSchema', () => {
  it('aceita titulares diferentes', () => expect(registrationSchema.safeParse(valid).success).toBe(true));
  it('rejeita titulares repetidos', () => expect(registrationSchema.safeParse({ ...valid, additionalTicketNames: ['  MARIA DA SILVA '] }).success).toBe(false));
  it('exige um nome para cada ingresso', () => expect(registrationSchema.safeParse({ ...valid, ticketQuantity: 3 }).success).toBe(false));
});
