import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormError } from '../components/ui/FormError';
import { sponsorSchema, type SponsorFormData } from '../schemas/sponsorSchema';
import { createSponsorRequest } from '../services/sponsorService';
import { maskPhone } from '../utils/format';

export function SponsorPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SponsorFormData>({ resolver: zodResolver(sponsorSchema) });

  async function onSubmit(data: SponsorFormData) {
    setError('');
    try {
      await createSponsorRequest(data);
      setSubmitted(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a solicitação.');
    }
  }

  return (
    <section className="container-page py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Patrocínio</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-dark sm:text-4xl">Apoie o Entre Nós Experience</h1>
        <p className="mt-3 text-sm leading-6 text-muted sm:text-base">Envie sua proposta de apoio. A equipe entrará em contato para alinhar os próximos passos.</p>

        {submitted && <div className="mt-6 rounded-md border border-success/20 bg-success/10 p-4 text-success">Solicitação registrada. Nossa equipe entrará em contato.</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-5 rounded-lg bg-white p-4 shadow-soft sm:mt-8 sm:p-8">
          {error && <div className="rounded-md border border-error/20 bg-error/5 p-3 text-sm text-error">{error}</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome da empresa" error={errors.companyName?.message}>
              <input className="field" {...register('companyName')} />
            </Field>
            <Field label="Responsável" error={errors.responsibleName?.message}>
              <input className="field" {...register('responsibleName')} />
            </Field>
            <Field label="E-mail" error={errors.email?.message}>
              <input className="field" type="email" {...register('email')} />
            </Field>
            <Field label="Telefone" error={errors.phone?.message}>
              <input className="field" {...register('phone')} onChange={(event) => setValue('phone', maskPhone(event.target.value), { shouldValidate: true })} />
            </Field>
            <Field label="Cidade" error={errors.city?.message}>
              <input className="field" {...register('city')} />
            </Field>
            <Field label="CNPJ opcional" error={errors.cnpj?.message}>
              <input className="field" {...register('cnpj')} />
            </Field>
          </div>
          <Field label="Tipo de apoio" error={errors.supportType?.message}>
            <select className="field" {...register('supportType')}>
              <option value="">Selecione</option>
              <option value="financeiro">Financeiro</option>
              <option value="produto">Produto ou brinde</option>
              <option value="servico">Serviço</option>
              <option value="divulgacao">Divulgação</option>
              <option value="outro">Outro</option>
            </select>
          </Field>
          <Field label="Como pretende apoiar o evento" error={errors.message?.message}>
            <textarea className="field min-h-32" {...register('message')} />
          </Field>
          <label className="text-sm text-text">
            <span className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" {...register('acceptedTerms')} />
              <span>Aceito os termos de contato e tratamento dos dados informados.</span>
            </span>
            <FormError message={errors.acceptedTerms?.message} />
          </label>
          <button className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" size={18} />}
            Enviar proposta
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <span className="mt-1 block">{children}</span>
      <FormError message={error} />
    </label>
  );
}
