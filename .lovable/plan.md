
# Plano: Implementar Bloqueio/Desbloqueio de Usuários

## Problemas Identificados

Analisei o código e encontrei os seguintes problemas que impedem o funcionamento do bloqueio:

### 1. Coluna `is_blocked` não existe
A tabela `profiles` não possui a coluna `is_blocked`. O código frontend referencia `user.is_blocked` mas esse campo não existe no banco de dados.

### 2. Função de bloqueio não atualiza o banco
A função `handleBlockUser()` apenas registra um log, mas não altera nenhum dado no banco. Não há UPDATE na tabela profiles.

### 3. Hook de auditoria incorreto
O código usa `useAdminAuditLog` que tenta inserir na tabela `audit_logs`. Porém essa tabela possui uma constraint que só permite tipos específicos:
- `terms_accepted`, `privacy_accepted`, `blockchain_policy_accepted`, `data_export_requested`, `data_deletion_requested`, `login`, `logout`, `registro_created`, `certificado_downloaded`

Os tipos `admin_user_blocked` e `admin_user_unblocked` são rejeitados, gerando o erro:
```
new row for relation "audit_logs" violates check constraint "valid_action_type"
```

### 4. Deveria usar `useAdminActionLog`
Já existe o hook correto `useAdminActionLog` que registra na tabela `admin_action_logs` (sem constraint restritiva), mas o código usa o hook errado.

---

## Solução Proposta

### Parte 1: Migração do Banco de Dados

Adicionar coluna `is_blocked` na tabela `profiles`:

```sql
-- Adicionar coluna is_blocked na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN is_blocked boolean NOT NULL DEFAULT false;

-- Adicionar coluna blocked_at para registro de data
ALTER TABLE public.profiles 
ADD COLUMN blocked_at timestamp with time zone DEFAULT NULL;

-- Adicionar coluna blocked_reason para motivo
ALTER TABLE public.profiles 
ADD COLUMN blocked_reason text DEFAULT NULL;

-- Criar índice para consultas de usuários bloqueados
CREATE INDEX idx_profiles_is_blocked ON public.profiles(is_blocked);
```

### Parte 2: Atualizar AdminUsuarios.tsx

1. **Trocar o hook**: Substituir `useAdminAuditLog` por `useAdminActionLog`

2. **Implementar a atualização real**: Modificar `handleBlockUser()` para:
   - Atualizar `is_blocked`, `blocked_at` e `blocked_reason` no banco
   - Para bloqueio: `is_blocked = true`, `blocked_at = now()`, `blocked_reason = motivo`
   - Para desbloqueio: `is_blocked = false`, `blocked_at = null`, `blocked_reason = null`
   - Usar `useAdminActionLog` para registrar a ação

3. **Ajustar a interface UserProfile**: Adicionar os novos campos do tipo

### Parte 3: Bloquear Acesso de Usuários Bloqueados

Criar verificação no login e em rotas protegidas para impedir acesso de usuários bloqueados.

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/admin/AdminUsuarios.tsx` | Trocar hook, implementar UPDATE real |
| `src/hooks/useAuth.tsx` | Verificar se usuário está bloqueado no login |
| **Migração SQL** | Adicionar colunas `is_blocked`, `blocked_at`, `blocked_reason` |

---

## Detalhes Técnicos

### Nova função handleBlockUser

```typescript
async function handleBlockUser() {
  if (!selectedUser || !blockReason.trim()) {
    toast.error("Motivo é obrigatório");
    return;
  }
  setBlocking(true);

  try {
    const isBlocking = !selectedUser.is_blocked;
    
    const { error } = await supabase
      .from("profiles")
      .update({
        is_blocked: isBlocking,
        blocked_at: isBlocking ? new Date().toISOString() : null,
        blocked_reason: isBlocking ? blockReason : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedUser.id);

    if (error) throw error;

    // Log usando o hook correto
    await logAction({
      actionType: isBlocking ? "user_blocked" : "user_unblocked",
      targetType: "user",
      targetId: selectedUser.user_id,
      details: {
        reason: blockReason,
        user_name: selectedUser.full_name,
      },
    });

    toast.success(isBlocking ? "Usuário bloqueado" : "Usuário desbloqueado");
    setBlockDialogOpen(false);
    fetchUsers();
  } catch (error) {
    toast.error("Erro ao bloquear/desbloquear usuário");
  } finally {
    setBlocking(false);
  }
}
```

### Verificação no Login

```typescript
// Em useAuth.tsx, após signInWithPassword bem-sucedido
const { data: profile } = await supabase
  .from("profiles")
  .select("is_blocked, blocked_reason")
  .eq("user_id", data.user.id)
  .single();

if (profile?.is_blocked) {
  await supabase.auth.signOut();
  throw new Error(`Sua conta está bloqueada. Motivo: ${profile.blocked_reason || 'Contate o suporte'}`);
}
```

---

## Resultado Esperado

Após a implementação:

1. Admin clica em "Bloquear" no menu de ações
2. Modal solicita motivo obrigatório
3. Admin confirma e o sistema:
   - Atualiza `profiles.is_blocked = true`
   - Salva data e motivo do bloqueio
   - Registra ação em `admin_action_logs`
4. Badge do usuário muda para "Bloqueado" (vermelho)
5. Menu mostra opção "Desbloquear"
6. Usuário bloqueado não consegue fazer login
7. Se tentar, vê mensagem com motivo do bloqueio
