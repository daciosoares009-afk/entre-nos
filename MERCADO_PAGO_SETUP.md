# Mercado Pago — configuração de produção

## Credenciais

Use o Access Token de produção do vendedor no segredo `MERCADO_PAGO_ACCESS_TOKEN`. Não use Public Key, token do comprador, credencial de teste, `Bearer`, aspas ou espaços extras.

## Webhook

URL:

```text
https://nfsqbszrmrjjgnxzagig.supabase.co/functions/v1/mercado-pago-webhook
```

Cadastre os eventos de **Pagamentos** e **Orders**. Copie o segredo da assinatura da configuração atual para `MERCADO_PAGO_WEBHOOK_SECRET`; ao criar uma aplicação nova, o segredo antigo não serve.

## Fluxos disponíveis

- `create-mercado-pago-pix`: cria Pix Copia e Cola/QR Code para qualquer banco.
- `create-mercado-pago-preference`: mantém as demais formas permitidas pelo Checkout Pro.
- `mercado-pago-webhook`: recebe notificações assinadas.
- `sync-mercado-pago-payment`: consulta um pedido quando o comprador está na página.
- `reconcile-mercado-pago`: verifica periodicamente pagamentos, estornos e reembolsos sem depender do navegador do comprador.

## Conciliação automática

Agende uma chamada POST a cada 5 minutos para:

```text
https://nfsqbszrmrjjgnxzagig.supabase.co/functions/v1/reconcile-mercado-pago
```

Cabeçalho:

```text
Authorization: Bearer <CRON_SECRET>
```

O resultado informa `checked`, `updated` e `failed`. Mudanças de estado ficam em `payment_audit_log`.

## Checklist

1. Criar uma inscrição de teste operacional com e-mail real.
2. Confirmar que o total inclui ingressos e produtos.
3. Gerar Pix e pagar por uma conta diferente da conta vendedora.
4. Confirmar `payment_status = paid` sem manter a página aberta.
5. Baixar o PDF e abrir o QR Code.
6. Fazer o primeiro check-in e tentar novamente para confirmar o bloqueio de duplicidade.
