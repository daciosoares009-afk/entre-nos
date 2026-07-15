export function TermsPage() {
  return (
    <section className="container-page py-12">
      <article className="mx-auto max-w-3xl rounded-lg bg-white p-6 leading-7 shadow-soft sm:p-8">
        <h1 className="text-3xl font-bold text-dark">Termos de Uso</h1>
        <p className="mt-4 text-muted">
          A inscrição no Entre Nós Experience inclui obrigatoriamente um ingresso no valor de R$ 15,00. A confirmação da participação ocorre após a aprovação do pagamento.
        </p>
        <p className="mt-4 text-muted">
          Informações como local, produtos e preços podem ser ajustadas até a publicação oficial final. Valores provisórios estão identificados no arquivo de configuração do projeto.
        </p>
        <h2 className="mt-6 text-xl font-bold text-dark">Inscrição e pagamento</h2>
        <p className="mt-3 text-muted">
          O envio do formulário não confirma automaticamente a entrada. Quando houver valor a pagar, a participação será confirmada após a validação do pagamento pelo Mercado Pago. O participante é responsável pela veracidade dos dados informados.
        </p>
        <h2 className="mt-6 text-xl font-bold text-dark">Produtos e reservas</h2>
        <p className="mt-3 text-muted">
          Os produtos selecionados e suas quantidades integram o valor total informado ao final da inscrição. A disponibilidade será confirmada pela organização após a validação do pagamento.
        </p>
        <h2 className="mt-6 text-xl font-bold text-dark">Privacidade e imagem</h2>
        <p className="mt-3 text-muted">
          Os dados pessoais são tratados conforme a Política de Privacidade e a LGPD. A autorização de uso de imagem é opcional e pode ser tratada pelos canais oficiais da organização.
        </p>
      </article>
    </section>
  );
}
