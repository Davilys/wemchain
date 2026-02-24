

# Correcao: Sincronizacao de Pagamentos Asaas com Creditos

## Problema Identificado

O webhook do Asaas NAO esta chegando na edge function (tabela `asaas_webhook_logs` esta completamente vazia). Isso significa que quando o cliente paga, o Asaas confirma o pagamento, mas o sistema nunca recebe essa confirmacao para liberar os creditos.

A funcao `check-asaas-payment` faz polling na API do Asaas e VE que o pagamento esta confirmado, mas apenas retorna essa informacao -- nao atualiza o banco de dados nem libera os creditos.

## Causa Raiz

```text
Cliente paga via Pix
       |
       v
Asaas confirma pagamento (status: CONFIRMED)
       |
       v
Webhook deveria chamar edge function --> NAO CHEGA (webhook nao configurado ou URL errada)
       |
       v
Polling via check-asaas-payment --> LE status CONFIRMED da API do Asaas
       |
       v
Retorna ao frontend, mas creditos NUNCA SAO LIBERADOS no banco
       |
       v
Pagamento fica como "Pendente" para sempre no painel do cliente
```

## Solucao

Modificar a edge function `check-asaas-payment` para que, ao detectar um pagamento confirmado na API do Asaas que ainda esta como PENDING no banco, automaticamente libere os creditos usando a mesma funcao atomica `add_credits_atomic`.

Isso cria um mecanismo de fallback: mesmo que o webhook falhe, o polling sincroniza o status.

## Detalhes Tecnicos

### Arquivo modificado: `supabase/functions/check-asaas-payment/index.ts`

Quando a funcao detecta que:
- Status na API do Asaas = `CONFIRMED` ou `RECEIVED`
- Status no banco (dbPayment) = `PENDING`

Entao:
1. Chamar `add_credits_atomic` com os dados do pagamento para liberar creditos
2. Atualizar status do pagamento na tabela `asaas_payments` para `CONFIRMED`
3. Retornar o status atualizado ao frontend

Para isso, a funcao precisara usar o `SUPABASE_SERVICE_ROLE_KEY` para chamar as RPCs, ja que o usuario autenticado nao tem permissao para executar essas funcoes diretamente.

### Fluxo corrigido

```text
Polling via check-asaas-payment
       |
       v
Busca status na API Asaas --> CONFIRMED
       |
       v
Verifica status no banco --> PENDING
       |
       v
Chama add_credits_atomic (libera creditos)
       |
       v
Atualiza asaas_payments.status = CONFIRMED
       |
       v
Retorna ao frontend com status confirmado
       |
       v
Frontend exibe "Pagamento confirmado! Creditos liberados."
```

### Nenhum outro arquivo sera alterado

Apenas `supabase/functions/check-asaas-payment/index.ts` sera modificado para adicionar a logica de sincronizacao automatica.
