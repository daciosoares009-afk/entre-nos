export function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-primary">{eyebrow}</p>
      <h2 className="text-2xl font-bold leading-tight text-dark sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-sm leading-6 text-muted sm:text-base">{description}</p>}
    </div>
  );
}
