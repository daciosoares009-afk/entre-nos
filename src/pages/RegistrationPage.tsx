import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import productCaneca from '../assets/product-caneca.jpeg';
import productCopoAcrilico from '../assets/product-copo-acrilico.jpeg';
import { FormError } from '../components/ui/FormError';
import { productConfig } from '../data/products';
import { registrationSchema, type RegistrationFormData } from '../schemas/registrationSchema';
import { createRegistration } from '../services/registrationService';
import { formatCurrency, maskPhone } from '../utils/format';

export function RegistrationPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      wantsShirt: false,
      shirtColor: '',
      shirtSize: '',
      shirtQuantity: 1,
      wantsButton: false,
      buttonQuantity: 1,
      wantsCup: false,
      cupQuantity: 1,
      wantsMug: false,
      mugQuantity: 1,
      imageAuthorization: false,
      ticketQuantity: 1,
      additionalTicketNames: [],
    },
  });

  const wantsShirt = watch('wantsShirt');
  const wantsCup = watch('wantsCup');
  const wantsMug = watch('wantsMug');
  const ticketQuantity = watch('ticketQuantity') ?? 1;

  useEffect(() => {
    const expectedNames = Math.max(0, ticketQuantity - 1);
    const currentNames = getValues('additionalTicketNames') ?? [];
    if (currentNames.length !== expectedNames) {
      setValue(
        'additionalTicketNames',
        Array.from({ length: expectedNames }, (_, index) => currentNames[index] ?? ''),
        { shouldValidate: false },
      );
    }
  }, [getValues, setValue, ticketQuantity]);

  async function onSubmit(data: RegistrationFormData) {
    setError('');
    try {
      const summary = await createRegistration(data);
      sessionStorage.setItem('entre-nos-registration', JSON.stringify(summary));
      localStorage.setItem('entre-nos-registration', JSON.stringify(summary));
      navigate('/sucesso');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir a inscrição.');
    }
  }

  return (
    <section className="container-page py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Inscrição</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-dark sm:text-4xl">Participar do Entre Nós Experience</h1>
        <p className="mt-3 text-sm leading-6 text-muted sm:text-base">Preencha os dados abaixo. Após a inscrição, você poderá pagar com segurança pelo Mercado Pago.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-5 rounded-lg bg-white p-4 shadow-soft sm:mt-8 sm:p-8">
          {error && <div className="rounded-md border border-error/20 bg-error/5 p-3 text-sm text-error">{error}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo (titular 1)" error={errors.name?.message}>
              <input className="field" {...register('name')} autoComplete="name" />
            </Field>
            <Field label="E-mail" error={errors.email?.message}>
              <input className="field" type="email" {...register('email')} autoComplete="email" />
            </Field>
            <Field label="Telefone" error={errors.phone?.message}>
              <input
                className="field"
                {...register('phone')}
                onChange={(event) => setValue('phone', maskPhone(event.target.value), { shouldValidate: true })}
                autoComplete="tel"
              />
            </Field>
            <Field label="Idade" error={errors.age?.message}>
              <input className="field" type="number" min={18} {...register('age')} />
            </Field>
            <Field label="Cidade" error={errors.city?.message}>
              <input className="field" {...register('city')} />
            </Field>
            <Field label="Estado" error={errors.state?.message}>
              <input className="field uppercase" maxLength={2} {...register('state')} placeholder="CE" />
            </Field>
          </div>

          <div className="grid gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:grid-cols-[1fr_180px] sm:items-end">
            <div className="min-w-0">
              <h2 className="font-bold text-dark">Ingresso do evento</h2>
              <p className="mt-1 text-sm leading-6 text-muted">Escolha até 10 ingressos. Cada um terá nome, QR Code e PDF próprios.</p>
              <p className="mt-2 text-xl font-extrabold text-primary">{formatCurrency(ticketQuantity * productConfig.ticketPrice)}</p>
              <p className="mt-1 text-xs font-semibold text-muted">{ticketQuantity} × {formatCurrency(productConfig.ticketPrice)}</p>
            </div>
            <Field label="Quantidade" error={errors.ticketQuantity?.message}>
              <select className="field" {...register('ticketQuantity')}>
                {Array.from({ length: 10 }, (_, index) => index + 1).map((quantity) => (
                  <option key={quantity} value={quantity}>{quantity}</option>
                ))}
              </select>
            </Field>
          </div>

          {ticketQuantity > 1 && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
              <h2 className="text-lg font-bold text-dark">Titulares dos demais ingressos</h2>
              <p className="mt-1 text-sm leading-6 text-muted">Os nomes devem ser completos e diferentes do comprador e entre si.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {Array.from({ length: ticketQuantity - 1 }, (_, index) => (
                  <Field key={index} label={`Nome completo (titular ${index + 2})`} error={errors.additionalTicketNames?.[index]?.message}>
                    <input className="field" {...register(`additionalTicketNames.${index}` as const)} autoComplete="off" />
                  </Field>
                ))}
              </div>
              <FormError message={typeof errors.additionalTicketNames?.message === 'string' ? errors.additionalTicketNames.message : undefined} />
            </div>
          )}

          <div className="rounded-lg border border-slate-100 bg-background p-4">
            <label className="flex items-start gap-3 font-semibold leading-6 text-dark">
              <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-primary" {...register('wantsShirt')} />
              Deseja comprar camiseta oficial?
            </label>
            {wantsShirt && (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Field label="Cor" error={errors.shirtColor?.message}>
                  <select className="field" {...register('shirtColor')}>
                    <option value="">Selecione</option>
                    {productConfig.shirtColors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Tamanho" error={errors.shirtSize?.message}>
                  <select className="field" {...register('shirtSize')}>
                    <option value="">Selecione</option>
                    {productConfig.shirtSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Quantidade" error={errors.shirtQuantity?.message}>
                  <input className="field" type="number" min={1} max={10} {...register('shirtQuantity')} />
                </Field>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-dark">Demais produtos oficiais</h2>
            <p className="mt-1 text-sm leading-6 text-muted">Selecione os produtos desejados. Os valores serão incluídos no total da inscrição.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <ProductInterest
                title="Copo acrílico"
                description="Resistente, leve e exclusivo do evento."
                image={productCopoAcrilico}
                checked={wantsCup}
                checkbox={register('wantsCup')}
                quantity={register('cupQuantity')}
                quantityError={errors.cupQuantity?.message}
                price={productConfig.cupPrice}
              />
              <ProductInterest
                title="Caneca oficial"
                description="Cerâmica premium com design Entre Nós."
                image={productCaneca}
                checked={wantsMug}
                checkbox={register('wantsMug')}
                quantity={register('mugQuantity')}
                quantityError={errors.mugQuantity?.message}
                price={productConfig.mugPrice}
              />
            </div>
          </div>

          <div className="grid gap-3 text-sm">
            <Checkbox error={errors.acceptedTerms?.message} register={register('acceptedTerms')}>
              Aceito os <Link className="font-semibold text-primary underline underline-offset-2" to="/termos" target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>Termos de Uso</Link>.
            </Checkbox>
            <Checkbox label="Autorizo o uso de imagem em registros do evento." register={register('imageAuthorization')} />
            <Checkbox error={errors.privacyConsent?.message} register={register('privacyConsent')}>
              Declaro que li a <Link className="font-semibold text-primary underline underline-offset-2" to="/privacidade" target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>Política de Privacidade e as informações sobre a LGPD</Link>.
            </Checkbox>
          </div>

          <button className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" size={18} />}
            Enviar inscrição
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

function ProductInterest({ title, description, image, price, checked, checkbox, quantity, quantityError }: { title: string; description: string; image: string; price: number; checked: boolean; checkbox: UseFormRegisterReturn; quantity: UseFormRegisterReturn; quantityError?: string }) {
  return (
    <article className="isolate overflow-hidden rounded-lg border border-slate-200 bg-background">
      <div className="relative z-0 aspect-[4/3] overflow-hidden bg-white">
        <img src={image} alt={title} loading="lazy" decoding="async" className="block h-full w-full object-cover" />
      </div>
      <div className="relative z-10 bg-background p-4">
        <label className="flex cursor-pointer items-start gap-3 font-semibold text-dark">
          <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-primary" {...checkbox} />
          <span>{title}</span>
        </label>
        <p className="mt-2 text-sm leading-5 text-muted">{description}</p>
        <p className="mt-2 text-lg font-bold text-primary">{formatCurrency(price)}</p>
        {checked && (
          <div className="mt-3 max-w-32">
            <label className="label" htmlFor={`${quantity.name}-field`}>Quantidade</label>
            <input id={`${quantity.name}-field`} className="field mt-1" type="number" min={1} max={20} {...quantity} />
            <FormError message={quantityError} />
          </div>
        )}
      </div>
    </article>
  );
}

function Checkbox({ label, children, error, register }: { label?: string; children?: ReactNode; error?: string; register: UseFormRegisterReturn }) {
  return (
    <label>
      <span className="flex items-start gap-3 text-text">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" {...register} />
        <span>{children ?? label}</span>
      </span>
      <FormError message={error} />
    </label>
  );
}
