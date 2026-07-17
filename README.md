# Entre Nós Experience

Site responsivo do evento, com inscrições de múltiplos titulares, produtos, Pix/Checkout Mercado Pago, ingresso digital em PDF, recuperação segura e check-in autenticado.

## Desenvolvimento

```bash
npm install
npm run dev
npm run check
```

Variáveis públicas do frontend:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_WHATSAPP_NUMBER=
VITE_INSTAGRAM_USERNAME=
VITE_PUBLIC_SITE_URL=
```

Nunca coloque Access Token, `service_role`, segredo de webhook ou senha em variável `VITE_`.

## Arquitetura de segurança

- Inscrições e propostas de patrocínio são criadas por Edge Functions, nunca por inserção anônima direta.
- Números de inscrição, códigos dos ingressos e códigos de recuperação usam aleatoriedade criptográfica.
- Valores são recalculados no servidor a partir do catálogo em `supabase/functions/_shared/catalog.ts`.
- O webhook valida a assinatura do Mercado Pago; uma conciliação agendada cobre notificações perdidas e reembolsos.
- O check-in exige autenticação da equipe e usa uma operação atômica no banco.
- A leitura pública do ingresso expõe apenas nome, código, pagamento e situação da entrada.

## Banco e funções

Para uma instalação nova, execute `supabase/schema.sql` e depois as migrations em ordem. Em ambiente existente, aplique somente as migrations ainda não executadas.

Segredos necessários nas Edge Functions:

```text
MERCADO_PAGO_ACCESS_TOKEN
MERCADO_PAGO_WEBHOOK_SECRET
PUBLIC_SITE_URL=https://entre-nos-eta.vercel.app
RATE_LIMIT_SALT=<valor aleatório longo>
CRON_SECRET=<valor aleatório longo>
CHECKIN_STAFF_EMAILS=equipe1@exemplo.com,equipe2@exemplo.com
```

Crie os usuários da equipe em Supabase Auth e inclua os mesmos e-mails em `CHECKIN_STAFF_EMAILS`.

## Publicação segura

1. Faça backup do banco.
2. Aplique as migrations.
3. Cadastre os segredos.
4. Publique todas as Edge Functions.
5. Configure os eventos `payment` e `order` no webhook do Mercado Pago.
6. Agende `reconcile-mercado-pago` no Supabase Cron com `Authorization: Bearer <CRON_SECRET>` a cada 5 minutos.
7. Publique o frontend somente depois de validar inscrição, Pix, aprovação, PDF, recuperação e check-in em um pedido controlado.

## Operação no evento

1. A equipe acessa `/equipe/login` no celular.
2. Faz login com uma conta autorizada.
3. Escaneia o QR Code com a câmera normal do celular; o link abre o ingresso.
4. Toca em **Registrar entrada agora**.
5. O primeiro uso é aceito; tentativas seguintes aparecem como ingresso já utilizado.
