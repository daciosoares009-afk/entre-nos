import { ArrowRight, BadgeCheck, CalendarDays, Check, Handshake, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoExperience from '../assets/logo-entre-nos-experience-transparent.png';
import eventPromo from '../assets/event-promo.MOV';
import shirtBlack from '../assets/shirt-black.jpeg';
import shirtWhite from '../assets/shirt-white.jpeg';
import { eventCards, eventInfo, schedule, speakers } from '../data/event';
import { productConfig } from '../data/products';
import { formatCurrency } from '../utils/format';
import { SectionTitle } from '../components/ui/SectionTitle';

export function HomePage() {
  return (
    <>
      <section id="evento" className="bg-white">
        <div className="container-page grid min-h-[calc(100vh-4rem)] items-center gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-semibold text-primary">
              <CalendarDays size={16} /> 22 de agosto, 19h
            </div>
            <h1 className="text-4xl font-extrabold leading-tight text-dark sm:text-5xl lg:text-6xl">{eventInfo.name}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{eventInfo.description}</p>
            <div className="mt-6 grid gap-3 text-sm font-semibold text-text sm:grid-cols-3">
              <span>Data: {eventInfo.date}</span>
              <span>Horário: {eventInfo.time}</span>
              <span>Local: {eventInfo.location}</span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/inscricao" className="btn-primary">
                Participar do evento <ArrowRight size={18} />
              </Link>
              <Link to="/patrocinador" className="btn-secondary">
                Seja um patrocinador
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-lg bg-dark p-6 text-white shadow-soft">
              <div className="mb-6 rounded-md bg-white p-4">
                <img src={logoExperience} alt="Entre Nós Experience" className="mx-auto h-48 w-full object-contain" />
              </div>
              <div className="rounded-md bg-white/10 p-5">
                <p className="text-sm text-violet-200">Experiência oficial</p>
                <h2 className="mt-2 text-3xl font-bold">Conteúdo, negócios e conexões</h2>
              </div>
              <div className="mt-6 grid gap-3">
                {['Palestras com especialistas', 'Networking orientado', 'Lançamentos do Entre Nós'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-md bg-white p-4 text-dark">
                    <BadgeCheck className="text-primary" size={22} />
                    <span className="font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="video" className="bg-background py-16">
        <div className="container-page grid items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionTitle
              eyebrow="Viva a experiência"
              title="Um encontro para conectar ideias e pessoas"
              description="Assista ao vídeo oficial e conheça o clima do Entre Nós Experience antes de fazer sua inscrição."
            />
            <Link to="/inscricao" className="btn-primary mt-6">
              Quero participar <ArrowRight size={18} />
            </Link>
          </div>
          <div className="overflow-hidden rounded-lg bg-dark p-2 shadow-soft">
            <video className="aspect-video w-full rounded-md object-cover" controls playsInline preload="metadata">
              <source src={eventPromo} type="video/quicktime" />
              Seu navegador não consegue reproduzir este vídeo. Abra o arquivo pelo dispositivo para assistir.
            </video>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {eventCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="rounded-lg border border-slate-100 bg-white p-6 shadow-soft">
                <Icon className="mb-5 text-primary" size={28} />
                <p className="text-sm font-semibold text-muted">{card.title}</p>
                <h3 className="mt-1 text-xl font-bold text-dark">{card.value}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="palestrantes" className="bg-white py-16">
        <div className="container-page">
          <SectionTitle eyebrow="Palestrantes" title="Especialistas convidados" description="Dados centralizados para facilitar alterações futuras." />
          <div className="grid gap-5 md:grid-cols-3">
            {speakers.map((speaker) => (
              <article key={speaker.name} className="overflow-hidden rounded-lg border border-slate-100 bg-background text-center">
                <div className="aspect-[4/5] bg-slate-100">
                  <img src={speaker.image} alt={speaker.name} className="h-full w-full object-cover object-top" />
                </div>
                <div className="p-6">
                <h3 className="mt-5 text-xl font-bold text-dark">{speaker.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted">{speaker.role || 'Palestrante a confirmar'}</p>
                <span className="mt-4 inline-flex rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">{speaker.status}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="programacao" className="container-page py-16">
        <SectionTitle eyebrow="Programação" title="Linha do tempo do evento" />
        <div className="mx-auto max-w-3xl">
          {schedule.map((item, index) => (
            <div key={item.time} className="grid grid-cols-[88px_1fr] gap-4 sm:grid-cols-[150px_1fr]">
              <div className="text-right text-sm font-bold text-primary">{item.time}</div>
              <div className="relative border-l border-primary/20 pb-8 pl-6">
                <span className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary" />
                <h3 className="font-semibold text-dark">{item.title}</h3>
                {index === schedule.length - 1 && <div className="absolute -left-px top-4 h-full w-px bg-background" />}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="produtos" className="bg-white py-16">
        <div className="container-page">
          <SectionTitle eyebrow="Produtos oficiais" title="Reserve durante a inscrição" description="Preços provisórios em arquivo de configuração até confirmação oficial." />
          <div className="grid gap-5 lg:grid-cols-3">
            <ProductCard title="Camiseta branca" image={shirtWhite} price={productConfig.shirtPrice} />
            <ProductCard title="Camiseta preta" image={shirtBlack} price={productConfig.shirtPrice} />
            <article className="rounded-lg border border-slate-100 bg-background p-6">
              <div className="grid h-36 place-items-center rounded-md bg-white">
                <Ticket size={54} className="text-primary" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-dark">Botton oficial</h3>
              <p className="mt-2 text-sm text-muted">Item complementar disponível na inscrição.</p>
              <p className="mt-4 text-2xl font-bold text-primary">{formatCurrency(productConfig.buttonPrice)}</p>
            </article>
          </div>
          <div className="mt-8 flex justify-center">
            <Link to="/inscricao" className="btn-primary">
              Selecionar produtos
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid items-center gap-8 rounded-lg bg-dark p-8 text-white md:grid-cols-[1fr_auto]">
          <div>
            <Handshake className="mb-5 text-primary-light" size={34} />
            <h2 className="text-3xl font-bold">Sua empresa no Entre Nós Experience</h2>
            <p className="mt-3 max-w-2xl text-violet-100">
              Apoie uma noite de conteúdo, negócios e relacionamento com uma comunidade em crescimento.
            </p>
          </div>
          <Link to="/patrocinador" className="btn-primary bg-white text-primary hover:bg-violet-50">
            Quero patrocinar
          </Link>
        </div>
      </section>
    </>
  );
}

function ProductCard({ title, image, price }: { title: string; image: string; price: number }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-100 bg-background">
      <div className="grid h-56 place-items-center bg-white p-3">
        <img src={image} alt={title} className="h-full w-full rounded-md object-contain" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-dark">{title}</h3>
        <p className="mt-2 text-sm text-muted">Tamanhos PP, P, M, G, GG e XGG.</p>
        <p className="mt-4 text-2xl font-bold text-primary">{formatCurrency(price)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {productConfig.shirtSizes.map((size) => (
            <span key={size} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-muted">
              <Check size={12} className="mr-1 inline" /> {size}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
