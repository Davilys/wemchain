
# Plano: Compra de Créditos com Quantidade Selecionável

## Objetivo
Modificar o plano "Básico" (R$49) para permitir que o usuário selecione a quantidade de créditos desejada, com cálculo automático do valor total. O pagamento será processado no Asaas e os créditos liberados após confirmação.

## Visão Geral da Implementação

```text
+---------------------------+       +---------------------------+
|  Tela de Checkout         |       |  Edge Function            |
|  (Plano Básico)           |       |  create-asaas-payment     |
|---------------------------|       |---------------------------|
| - Seletor de quantidade   |  -->  | - Recebe quantity         |
| - Cálculo: qtd x R$49     |       | - Calcula valor total     |
| - Total dinâmico na UI    |       | - Cria pagamento no Asaas |
+---------------------------+       +---------------------------+
                                              |
                                              v
                            +---------------------------+
                            |  Webhook Asaas            |
                            |---------------------------|
                            | - Confirma pagamento      |
                            | - Libera créditos (qty)   |
                            +---------------------------+
```

## Mudanças Necessárias

### 1. Frontend - Checkout.tsx

**Novo Estado:**
- Adicionar estado `creditQuantity` para controlar a quantidade selecionada (mínimo: 1, máximo: 50)

**Novo Componente - Seletor de Quantidade:**
- Exibir seletor apenas quando o plano "BASICO" for selecionado
- Opções: campo numérico ou botões +/- para ajustar quantidade
- Valores predefinidos sugeridos: 1, 3, 5, 10 créditos

**Cálculo Dinâmico:**
- Preço unitário: R$ 49,00
- Total: `quantidade × 49`
- Atualizar exibição do plano selecionado em tempo real

**Modificações no Formulário:**
- Mostrar: "X créditos × R$ 49,00 = R$ XXX,00"
- Enviar `quantity` junto com `planType` na requisição

### 2. Edge Function - create-asaas-payment

**Alterações na Interface:**
```typescript
interface CreatePaymentRequest {
  planType: "BASICO" | "PROFISSIONAL" | "BUSINESS" | "ADICIONAL";
  quantity?: number; // NOVO: quantidade de créditos (apenas para BASICO)
  customerName: string;
  customerEmail: string;
  customerCpfCnpj: string;
  customerPhone?: string;
}
```

**Lógica de Processamento:**
- Se `planType === "BASICO"` e `quantity > 1`:
  - Valor total = `quantity × 49.00`
  - Créditos = `quantity`
  - Descrição: "X Registros de Propriedade em Blockchain"
- Validação: quantidade entre 1 e 50
- Demais planos funcionam normalmente

**Registro no Banco:**
- `valor`: valor total calculado
- `credits_amount`: quantidade de créditos
- `plan_type`: "BASICO" (mantém compatibilidade)

### 3. UI do Seletor de Quantidade

**Design proposto para o card do plano Básico:**

```text
┌─────────────────────────────────────┐
│           🛡️ Básico                 │
│   Registro avulso de propriedade    │
│                                     │
│        R$ 49 / crédito              │
│                                     │
│   Quantos créditos você quer?       │
│                                     │
│   [ 1 ] [ 3 ] [ 5 ] [ 10 ] [___]   │
│                                     │
│   ─────────────────────────────     │
│   Total: 5 créditos = R$ 245,00     │
│                                     │
│        [ Selecionar ]               │
└─────────────────────────────────────┘
```

## Detalhes Técnicos

### Validações
- Quantidade mínima: 1
- Quantidade máxima: 50 (evitar abusos)
- Apenas números inteiros
- Campo obrigatório para plano Básico

### Fluxo Completo
1. Usuário clica no card "Básico"
2. Seletor de quantidade é exibido
3. Usuário escolhe quantidade desejada
4. Total é calculado automaticamente (qtd × R$49)
5. Clica em "Selecionar" para ir ao formulário
6. Formulário mostra resumo: "X créditos × R$ 49,00 = R$ XXX,00"
7. Após preencher dados, gera pagamento Pix no Asaas
8. Webhook confirma e libera a quantidade de créditos

### Arquivos a Modificar
1. `src/pages/Checkout.tsx` - Interface e lógica do seletor
2. `supabase/functions/create-asaas-payment/index.ts` - Processamento de quantidade

### Compatibilidade
- Planos Profissional e Business continuam funcionando normalmente
- Registro Adicional (R$39) continua sem alteração
- Webhook não precisa de modificação (já usa credits_amount do banco)
