
# Sistema de Link de Parceria (Influenciadores)

## Resumo

Criar um sistema completo para gerenciar influenciadores digitais via links de parceria exclusivos. O admin master gera links, influenciadores se cadastram com redes sociais obrigatorias, e o admin aprova/bloqueia manualmente. Usuarios aprovados recebem creditos ilimitados no plano basico, sem acesso a projetos ou features Business.

## Arquitetura

O sistema envolve 3 camadas: banco de dados (tabelas e funcoes), backend (edge function para validacao), e frontend (paginas de cadastro, admin e restricoes).

## 1. Migracao SQL - Novas Tabelas e Campos

### Tabela `partner_links` (links de parceria)
```text
id             UUID PK
code           TEXT UNIQUE (codigo do link, ex: "abc123")
created_by     UUID (admin que criou)
is_active      BOOLEAN DEFAULT true
created_at     TIMESTAMPTZ
```

### Novos campos na tabela `profiles`
```text
is_partner          BOOLEAN DEFAULT false
partner_status      TEXT ('pending', 'approved', 'blocked') 
partner_link_id     UUID (ref partner_links)
instagram_url       TEXT
tiktok_url          TEXT
unlimited_credits   BOOLEAN DEFAULT false
```

### RLS Policies
- `partner_links`: somente super_admin pode INSERT/SELECT/UPDATE
- Campos de parceria em `profiles`: admins podem ver/editar, usuarios veem o proprio

### Funcao `handle_partner_approval`
- Ao aprovar: seta `partner_status = 'approved'`, `unlimited_credits = true`, `is_blocked = false`
- Ao bloquear: seta `partner_status = 'blocked'`, `is_blocked = true`

## 2. Edge Function `partner-register`

Nova edge function que:
- Recebe `code`, `email`, `password`, `full_name`, `instagram_url`, `tiktok_url`
- Valida se o `code` existe e esta ativo na tabela `partner_links`
- Cria o usuario via Admin API (auto-confirma email)
- Atualiza o `profiles` com `is_partner = true`, `partner_status = 'pending'`, redes sociais
- Retorna sucesso com mensagem de "aguardando aprovacao"

## 3. Frontend - Pagina de Cadastro de Parceria

### Nova rota: `/parceria/register`
- Verifica parametro `ref=xxxxx` na URL
- Se nao tiver `ref` valido, mostra mensagem de bloqueio ("Link invalido ou expirado")
- Formulario com campos: Nome, Email, Senha, Confirmar Senha, Instagram (obrigatorio), TikTok (obrigatorio)
- Apos cadastro: tela de "Cadastro em analise"

### Nova pagina: `src/pages/ParceriaRegister.tsx`

## 4. Frontend - Area Admin

### 4a. Nova aba no sidebar: "Parcerias" (dentro do grupo Principal)
- Icone: `Handshake` ou `Link`
- Permissao: `config.edit` (somente super_admin)

### 4b. Nova pagina: `src/pages/admin/AdminParcerias.tsx`

**Secao 1: Gerar Link**
- Botao "Gerar Link de Parceria"
- Lista de links gerados com: codigo, data criacao, status (ativo/inativo), botao copiar, toggle ativar/desativar

**Secao 2: Usuarios de Parceria**
- Cards de resumo: Total, Pendentes, Aprovados, Bloqueados
- Tabela separada com usuarios parceiros
- Ao clicar: painel com Nome, Email, Instagram, TikTok, Data cadastro, Status
- Botoes: Aprovar Parceria / Bloquear Parceria

### 4c. Modificacao em `AdminUsuarios.tsx`
- Adicionar filtro/separacao: "Usuarios Normais" vs "Usuarios Parceria"
- Badge visual para identificar parceiros

## 5. Restricoes no Dashboard do Usuario

### Em `src/pages/Projetos.tsx` e rotas de projetos:
- Se `is_partner === true`: bloquear acesso, mostrar mensagem "Feature nao disponivel para seu plano"

### Em `useCredits.tsx`:
- Se `unlimited_credits === true`: retornar saldo como ilimitado (similar ao super_admin)

### Tela pos-login para parceiros pendentes:
- Se `partner_status === 'pending'`: mostrar tela de "Cadastro em analise" em vez do dashboard

## 6. Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `supabase/migrations/xxx.sql` | Criar tabela partner_links, alterar profiles |
| `supabase/functions/partner-register/index.ts` | Nova edge function |
| `src/pages/ParceriaRegister.tsx` | Pagina de cadastro parceria |
| `src/pages/admin/AdminParcerias.tsx` | Gestao de parcerias no admin |
| `src/components/admin/AdminSidebar.tsx` | Adicionar menu "Parcerias" |
| `src/App.tsx` | Adicionar rotas `/parceria/register` e `/admin/parcerias` |
| `src/pages/admin/AdminUsuarios.tsx` | Separar usuarios normais vs parceiros |
| `src/hooks/useCredits.tsx` | Suporte a creditos ilimitados para parceiros |
| `src/pages/Dashboard.tsx` | Tela de "pendente" para parceiros |
| `src/pages/Projetos.tsx` | Bloquear acesso para parceiros |
| `src/lib/adminPermissions.ts` | Adicionar permissao `partners.manage` |

## 7. Fluxo Completo

```text
Admin gera link
       |
       v
Influenciador acessa /parceria/register?ref=xxxxx
       |
       v
Preenche formulario (nome, email, senha, Instagram, TikTok)
       |
       v
Edge function cria conta + marca como parceiro pendente
       |
       v
Influenciador ve tela "Cadastro em analise"
       |
       v
Admin ve notificacao na aba Parcerias
       |
       v
Admin aprova --> conta ativada, creditos ilimitados, plano basico
   ou
Admin bloqueia --> login impedido
```
