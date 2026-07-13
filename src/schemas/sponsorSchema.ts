import { z } from 'zod';

export const sponsorSchema = z.object({
  companyName: z.string().min(2, 'Informe o nome da empresa.').max(120),
  responsibleName: z.string().min(3, 'Informe o responsável.').max(120),
  email: z.string().email('Informe um e-mail válido.'),
  phone: z.string().min(14, 'Informe um telefone válido.'),
  city: z.string().min(2, 'Informe a cidade.').max(80),
  cnpj: z.string().max(20).optional(),
  supportType: z.string().min(2, 'Informe o tipo de apoio.').max(80),
  message: z.string().min(10, 'Conte como pretende apoiar o evento.').max(1000),
  acceptedTerms: z.literal(true, { errorMap: () => ({ message: 'Você precisa aceitar os termos.' }) }),
});

export type SponsorFormData = z.infer<typeof sponsorSchema>;
