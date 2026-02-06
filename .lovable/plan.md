
# Plano: Adicionar Opção de Conceder Créditos no Menu de Ações do Admin

## Objetivo
Adicionar uma nova opção "Conceder Créditos" no menu de ações (3 pontos) da página de gestão de usuários do painel administrativo, permitindo ao super admin/admin conceder uma quantidade específica de créditos a um usuário.

## Análise da Implementação Atual

O sistema já possui:
- Função de banco `add_credits_admin(p_user_id, p_amount, p_reason, p_admin_id)` que adiciona créditos com auditoria
- Menu dropdown com ações: Ver Detalhes, Editar, Conceder/Editar/Revogar Plano Business, Bloquear
- Edge function `admin-manage-subscription` que usa a função `add_credits_admin`

## Mudanças Necessárias

### 1. Frontend - AdminUsuarios.tsx

**Novos Estados:**
```typescript
// Estado para o dialog de conceder créditos
const [grantCreditsDialogOpen, setGrantCreditsDialogOpen] = useState(false);
const [grantCreditsAmount, setGrantCreditsAmount] = useState(1);
const [grantCreditsReason, setGrantCreditsReason] = useState("");
const [grantingCredits, setGrantingCredits] = useState(false);
```

**Nova opção no DropdownMenu:**
- Adicionar item "Conceder Créditos" com ícone `Coins` (já importado)
- Posicionar após "Editar Dados" e antes das opções de Plano Business

**Novo Dialog - Conceder Créditos:**
- Campo: Seletor de quantidade (1-50) com botões predefinidos (1, 5, 10, 20)
- Campo: Input numérico para quantidade customizada
- Campo: Textarea para motivo (obrigatório para auditoria)
- Exibir nome do usuário selecionado
- Botão "Conceder Créditos" que chama a função RPC

**Nova Função:**
```typescript
async function handleGrantCredits() {
  // Validação
  // Chamar supabase.rpc("add_credits_admin", {...})
  // Log da ação
  // Feedback e atualização
}
```

### 2. Integração com Banco de Dados

Usar diretamente a RPC function existente:
```typescript
const { data, error } = await supabase.rpc("add_credits_admin", {
  p_user_id: selectedUser.user_id,
  p_amount: grantCreditsAmount,
  p_reason: grantCreditsReason,
  p_admin_id: adminUser.id,
});
```

### 3. UI do Dialog

```text
┌─────────────────────────────────────────────────┐
│  🪙 Conceder Créditos                           │
│─────────────────────────────────────────────────│
│  Conceder créditos para: João Silva             │
│                                                 │
│  Quantidade de créditos:                        │
│                                                 │
│  [ 1 ]  [ 5 ]  [ 10 ]  [ 20 ]                  │
│                                                 │
│  Quantidade:  [ 5    ] ─  +                     │
│                                                 │
│  Motivo (obrigatório):                          │
│  ┌─────────────────────────────────────────┐    │
│  │ Bonificação por uso do sistema...       │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│        [ Cancelar ]  [ Conceder Créditos ]      │
└─────────────────────────────────────────────────┘
```

## Detalhes Técnicos

### Componentes UI a Adicionar no Dialog:
1. Botões de quantidade predefinida (1, 5, 10, 20)
2. Input numérico com botões +/- para ajuste fino
3. Validação: mínimo 1, máximo 100 créditos
4. Textarea para motivo (obrigatório)

### Validações:
- Quantidade deve ser entre 1 e 100
- Motivo é obrigatório (mínimo 10 caracteres)
- Apenas admins podem executar a ação

### Auditoria:
- Usar `logAction` para registrar a ação no admin_action_logs
- A função `add_credits_admin` já registra no credits_ledger

### Fluxo Completo:
1. Admin clica nos 3 pontos → "Conceder Créditos"
2. Dialog abre com o nome do usuário
3. Admin seleciona quantidade (botões ou input)
4. Admin digita motivo
5. Clica em "Conceder Créditos"
6. Sistema chama RPC `add_credits_admin`
7. Log é registrado automaticamente
8. Toast de sucesso com quantidade concedida
9. Lista de usuários é atualizada

### Arquivos a Modificar:
- `src/pages/admin/AdminUsuarios.tsx` - Adicionar menu item, dialog e lógica

### Imports Necessários:
- `Minus`, `Plus` de lucide-react (para botões +/-)
- Demais componentes já estão importados

### Ordem do Menu Atualizada:
1. Ver Detalhes
2. Editar Dados
3. **Conceder Créditos** ← NOVO
4. --- Separador ---
5. Conceder Plano Business
6. Editar Plano Business
7. Revogar Plano Business
8. --- Separador ---
9. Bloquear/Desbloquear
