# Mercado Pago Checkout Pro

## Componentes implementados

- `create-mercado-pago-preference`: recria os itens e preços no servidor e retorna a URL segura do Checkout Pro.
- `mercado-pago-webhook`: valida a assinatura HMAC, consulta o pagamento no Mercado Pago e atualiza o ingresso.
- Botão `Pagar com Mercado Pago` na página de sucesso.
- Retornos para pagamentos aprovados, pendentes ou não concluídos.

## 1. Atualizar o banco

No Supabase, abra **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e execute. Os comandos `add column if not exists` preservam os registros existentes.

## 2. Conferir os segredos

Em **Edge Functions > Secrets**, devem existir:

```text
MERCADO_PAGO_ACCESS_TOKEN
MERCADO_PAGO_WEBHOOK_SECRET
PUBLIC_SITE_URL=https://entre-nos-eta.vercel.app
```

Nunca use o prefixo `VITE_` para credenciais privadas.

## 3. Publicar as funções

Com o Supabase CLI autenticado e o projeto vinculado:

```bash
supabase functions deploy create-mercado-pago-preference
supabase functions deploy mercado-pago-webhook --no-verify-jwt
```

## 4. Configurar o webhook no Mercado Pago

Em **Suas integrações > Entre Nós Experience > Webhooks**, adicione:

```text
https://nfsqbszrmrjjgnxzagig.supabase.co/functions/v1/mercado-pago-webhook
```

Ative o evento **Pagamentos**. A assinatura secreta exibida nessa configuração deve ser igual ao valor salvo em `MERCADO_PAGO_WEBHOOK_SECRET` no Supabase.

## 5. Validar antes de divulgar

1. Faça uma nova inscrição selecionando ao menos um produto.
2. Clique em **Pagar com Mercado Pago**.
3. Conclua o pagamento.
4. Aguarde a notificação e abra o ingresso digital.
5. Confirme no Supabase que `payment_status` mudou para `paid` e que `mercado_pago_payment_id` foi preenchido.

Com credenciais de produção, todas as cobranças são reais.
