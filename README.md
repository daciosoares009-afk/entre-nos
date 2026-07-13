# Entre Nós Experience

MVP em React + Vite para divulgação do evento, inscrição de participantes, captação de patrocinadores e ingresso digital com QR Code.

## Tecnologias

- React, Vite e TypeScript
- Tailwind CSS
- React Router
- React Hook Form + Zod
- Supabase
- qrcode.react
- Lucide React

## Rodar localmente

```bash
npm install
npm run dev
```

Crie um `.env` a partir do `.env.example`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PAYMENT_URL=
VITE_WHATSAPP_NUMBER=
VITE_PUBLIC_SITE_URL=
```

Os preços de camiseta e botton são provisórios e ficam em `src/data/products.ts`.

## Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Execute o arquivo `supabase/schema.sql`.
4. Copie `Project URL` para `VITE_SUPABASE_URL`.
5. Copie a chave `anon public` para `VITE_SUPABASE_ANON_KEY`.
6. Nunca use a chave `service_role` no frontend.

O RLS permite inserção pública em `registrations` e `sponsor_requests`, bloqueia leitura pública direta das tabelas e expõe somente a função `get_public_ticket(codigo)` para o ingresso digital.

## Confirmação manual de pagamento

Nesta versão, a equipe usa o painel do Supabase:

1. Abra a tabela `registrations`.
2. Localize a inscrição pelo número, nome, e-mail ou telefone.
3. Verifique o comprovante enviado pelo WhatsApp.
4. Altere `payment_status` de `pending` para `paid`.
5. O ingresso público passará a mostrar "Ingresso confirmado".

## Publicar na Vercel

1. Suba o projeto para um repositório Git.
2. Importe o repositório na Vercel.
3. Configure as variáveis de ambiente da produção.
4. Use o build padrão: `npm run build`.
5. Configure `VITE_PUBLIC_SITE_URL` com a URL pública final.

## Recursos deixados para a segunda versão

- Painel administrativo próprio
- Autenticação de administradores
- Webhook automático do Mercado Pago
- Check-in com leitor de QR Code
- Gestão completa de lotes, cupons e estoque
- Upload de imagens oficiais dos palestrantes e produtos
# entre-nos
# entre-nos
