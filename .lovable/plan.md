
# Plano: Corrigir Consumo de Créditos no Registro

## Problema Identificado

O cliente conseguiu fazer **5 registros confirmados** tendo apenas **4 créditos** disponíveis. A análise revelou:

1. **Tabela credits (cache)**: `used_credits=5`, `available_credits=1`, `total_credits=4` - **inconsistente!**
2. **Tabela credits_ledger**: Apenas 2 operações ADD (2+2=4), **NENHUMA operação CONSUME**
3. **A função `consume_credit_safe`** atualiza apenas a tabela cache, mas **NÃO insere no ledger**
4. **NÃO há validação de créditos ANTES do processamento** - o crédito só é consumido APÓS o registro ser confirmado

## Causa Raiz

```text
FLUXO ATUAL (PROBLEMÁTICO):
┌─────────────────────────────────────────────────────────────────┐
│ 1. Frontend: hasCredits = true (pode estar desatualizado)      │
│ 2. Edge function: process-registro inicia                      │
│ 3. Processamento completo (OTS timestamp, etc)                 │
│ 4. Status = CONFIRMED                                          │
│ 5. DEPOIS: consume_credit_safe() ← Só agora tenta consumir!    │
│    └── Se saldo zerou entre 1-4, registro já foi feito         │
│    └── Função não insere no ledger = sem auditoria             │
└─────────────────────────────────────────────────────────────────┘
```

## Solução

Implementar validação e consumo de crédito **ANTES** de processar o registro:

```text
FLUXO CORRIGIDO:
┌─────────────────────────────────────────────────────────────────┐
│ 1. Edge function: VALIDA créditos direto no banco (fresh)      │
│ 2. SE saldo < 1 → REJEITA com erro "Créditos insuficientes"    │
│ 3. SE ok → CONSUME crédito usando consume_credit_atomic        │
│    └── Insere no ledger com idempotência (reference=registro)  │
│ 4. Processamento (OTS timestamp, etc)                          │
│ 5. Status = CONFIRMED (crédito já foi consumido)               │
│ 6. SE falhar → crédito pode ser estornado por admin            │
└─────────────────────────────────────────────────────────────────┘
```

## Mudanças Necessárias

### 1. Edge Function - process-registro/index.ts

**Adicionar validação de créditos no INÍCIO (após autenticação):**

```typescript
// === VALIDAÇÃO DE CRÉDITOS (ANTES de processar) ===
// Verificar se é super_admin (créditos ilimitados)
const { data: isSuperAdmin } = await supabaseAdmin.rpc('is_super_admin', {
  _user_id: userId
});

if (!isSuperAdmin) {
  // Buscar saldo FRESH do ledger (fonte da verdade)
  const { data: balance } = await supabaseAdmin.rpc('get_ledger_balance', {
    p_user_id: userId
  });

  if ((balance || 0) < 1) {
    console.log(`[PROCESS-REGISTRO] Créditos insuficientes. Saldo: ${balance}`);
    return new Response(
      JSON.stringify({ 
        success: false,
        registroId,
        status: 'falhou',
        error: 'Créditos insuficientes. Adquira mais créditos para continuar.'
      }),
      { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
```

**Substituir consume_credit_safe por consume_credit_atomic:**

```typescript
// Antes (linha 383):
const { data: creditResult } = await supabaseAdmin.rpc('consume_credit_safe', {

// Depois:
const { data: creditResult } = await supabaseAdmin.rpc('consume_credit_atomic', {
  p_user_id: userId,
  p_registro_id: registroId,
  p_reason: 'Consumo para registro em blockchain'
});
```

### 2. Mover o Consumo para ANTES do Status CONFIRMED

O consumo deve acontecer ANTES de confirmar o registro, para garantir que:
- Se não houver crédito, o registro não é confirmado
- O ledger tem o registro do consumo

```typescript
// Mover para ANTES de "Update registro to CONFIRMED"

// ⚠️ CRITICAL: Consume credit BEFORE confirming
const { data: creditResult } = await supabaseAdmin.rpc('consume_credit_atomic', {
  p_user_id: userId,
  p_registro_id: registroId,
  p_reason: 'Consumo para registro em blockchain'
});

if (!creditResult?.success && !isSuperAdmin) {
  // Se falhar consumo e não for super_admin, reverter
  console.log(`[PROCESS-REGISTRO] Credit consumption failed: ${creditResult?.error}`);
  
  // Não confirmar o registro
  await supabaseAdmin
    .from('registros')
    .update({ status: 'falhou', error_message: 'Créditos insuficientes' })
    .eq('id', registroId);

  return new Response(
    JSON.stringify({ 
      success: false,
      registroId,
      status: 'falhou',
      error: creditResult?.error || 'Créditos insuficientes'
    }),
    { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Agora sim, confirmar o registro
await supabaseAdmin
  .from('registros')
  .update({ status: 'confirmado', error_message: null })
  .eq('id', registroId);
```

## Arquivos a Modificar

- `supabase/functions/process-registro/index.ts`
  - Adicionar validação de créditos no início (após autenticação)
  - Substituir `consume_credit_safe` por `consume_credit_atomic`
  - Mover consumo de crédito para ANTES de confirmar o registro
  - Adicionar verificação de super_admin para bypass

## Fluxo Corrigido Detalhado

```text
process-registro(registroId)
│
├── 1. Autenticar usuário
│
├── 2. Verificar se é super_admin
│   └── SE SIM: pular validação de créditos
│
├── 3. Validar créditos via get_ledger_balance()
│   └── SE saldo < 1: REJEITAR com erro 402
│
├── 4. Verificar se registro já foi processado (idempotência)
│
├── 5. Atualizar status para PROCESSANDO
│
├── 6. Processar timestamp (OTS ou interno)
│
├── 7. Criar transação blockchain
│
├── 8. CONSUMIR CRÉDITO via consume_credit_atomic()
│   └── SE falhar: REJEITAR e reverter status
│
└── 9. Atualizar status para CONFIRMED
```

## Benefícios da Correção

1. **Validação server-side**: Créditos verificados direto no banco, não no frontend
2. **Idempotência**: consume_credit_atomic impede consumo duplicado para mesmo registro
3. **Auditoria**: Todas operações registradas no ledger
4. **Consistência**: Cache (credits) e ledger sempre sincronizados
5. **Segurança**: Impossível processar registro sem crédito disponível

## Correção dos Dados Atuais

Após implementar a correção, será necessário reconciliar o saldo do usuário afetado:

```sql
-- Verificar situação atual
SELECT * FROM credits WHERE user_id = '38600758-12b7-4332-abd9-f91e74b0b514';
-- available_credits: 1, used_credits: 5, total_credits: 4 (INCONSISTENTE)

-- Corrigir via reconcile_credit_balance
SELECT reconcile_credit_balance('38600758-12b7-4332-abd9-f91e74b0b514');
-- Isso vai corrigir o cache baseado no ledger (saldo real = 4)
```
