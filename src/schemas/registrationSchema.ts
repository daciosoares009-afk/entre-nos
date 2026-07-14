import { z } from 'zod';
import { productConfig } from '../data/products';

export const registrationSchema = z
  .object({
    name: z.string().min(3, 'Informe seu nome completo.').max(120),
    email: z.string().email('Informe um e-mail válido.'),
    phone: z.string().min(14, 'Informe um telefone válido.'),
    age: z.coerce.number().int().min(12, 'Idade mínima: 12 anos.').max(120),
    city: z.string().min(2, 'Informe sua cidade.').max(80),
    state: z.string().min(2, 'Informe seu estado.').max(2, 'Use a sigla do estado.'),
    wantsShirt: z.boolean().default(false),
    shirtColor: z.enum(productConfig.shirtColors).optional().or(z.literal('')),
    shirtSize: z.enum(productConfig.shirtSizes).optional().or(z.literal('')),
    shirtQuantity: z.coerce.number().int().min(1).max(10).default(1),
    wantsButton: z.boolean().default(false),
    buttonQuantity: z.coerce.number().int().min(1).max(20).default(1),
    wantsCup: z.boolean().default(false),
    cupQuantity: z.coerce.number().int().min(1).max(20).default(1),
    wantsMug: z.boolean().default(false),
    mugQuantity: z.coerce.number().int().min(1).max(20).default(1),
    acceptedTerms: z.literal(true, { errorMap: () => ({ message: 'Você precisa aceitar os termos.' }) }),
    imageAuthorization: z.boolean().default(false),
    privacyConsent: z.literal(true, { errorMap: () => ({ message: 'O consentimento LGPD é obrigatório.' }) }),
  })
  .superRefine((data, ctx) => {
    if (data.wantsShirt && !data.shirtColor) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['shirtColor'], message: 'Escolha a cor da camiseta.' });
    }
    if (data.wantsShirt && !data.shirtSize) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['shirtSize'], message: 'Escolha o tamanho da camiseta.' });
    }
  });

export type RegistrationFormData = z.infer<typeof registrationSchema>;
