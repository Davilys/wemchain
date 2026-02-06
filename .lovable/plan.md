
## Diagnóstico (o bug real)
Pelo código atual, “Visão Geral” no menu do Admin está apontando para **`/admin`**:

- `src/components/admin/AdminSidebar.tsx`  
  - Menu “Visão Geral” → `url: "/admin"`
  - Logo no topo → `<Link to="/admin"> ... </Link>`

Só que em `src/App.tsx` a rota **`/admin`** está configurada para renderizar **`<AdminLogin />`**:

- `src/App.tsx`
  - `<Route path="/admin" element={<AdminLogin />} />`
  - `<Route path="/admin/dashboard" element={<AdminDashboard />} />`

Resultado: quando você está logado como Super Admin e clica “Visão Geral”, você vai para `/admin` e a aplicação **abre a tela de login**. Isso “parece” um logout/reinício, mas na prática é um **conflito de rota/URL** (a página de login está ocupando o lugar do “Visão Geral”).

Observação importante: em alguns cenários, a tela `AdminLogin` pode também disparar verificações e, se alguém tentar logar com credenciais não-admin, ela faz `signOut()` (isso reforça a sensação de “deslogou”). Mas o gatilho principal aqui é o link errado + rota `/admin` errada para “Visão Geral”.

---

## Objetivo da correção
1. “Visão Geral” deve abrir o **Dashboard Admin** (Visão Geral) e nunca a tela de login.
2. A rota `/admin` deve ser “inteligente”:
   - Se já estiver autenticado e for admin → redireciona para `/admin/dashboard`
   - Se não estiver logado → mostra login admin
   - Se estiver logado mas não for admin → redireciona para `/dashboard` (ou mostra acesso negado), **sem deslogar** o usuário

---

## Mudanças planejadas (frontend)
### 1) Corrigir links do menu e logo no AdminSidebar
**Arquivo:** `src/components/admin/AdminSidebar.tsx`

- Alterar “Visão Geral” de:
  - `url: "/admin"`  
  para:
  - `url: "/admin/dashboard"`

- Alterar o link do logo/topo de:
  - `<Link to="/admin">`
  para:
  - `<Link to="/admin/dashboard">`

- Ajustar a função `isActive()` para refletir a nova rota do dashboard:
  - Hoje ela tem caso especial para `"/admin"`; esse caso especial deve passar a ser para `"/admin/dashboard"` (match exato).

**Efeito:** clicar em “Visão Geral” não cai mais na página de login.

---

### 2) Tornar a rota `/admin` “smart entry” (não renderizar AdminLogin sempre)
**Arquivo:** `src/App.tsx` e novo componente de entrada (ex.: `src/pages/admin/AdminEntry.tsx` ou equivalente, seguindo padrão do projeto)

- Trocar:
  - `<Route path="/admin" element={<AdminLogin />} />`
- Para:
  - `<Route path="/admin" element={<AdminEntry />} />`

**Comportamento do `AdminEntry`:**
- Usa `useAuth()` para saber se existe `user` e `loading`.
- Se `loading` → mostra tela de carregamento pequena (“Verificando…”).
- Se não tem usuário → renderiza `<AdminLogin />`.
- Se tem usuário:
  - chama RPC `get_user_admin_role` (mesma usada no resto do projeto) para confirmar papel admin
  - se for admin → `<Navigate to="/admin/dashboard" replace />`
  - se não for admin → `<Navigate to="/dashboard" replace />` (ou tela de “acesso negado” sem logout)

**Por que isso resolve de vez:**
- Mesmo que alguém digite `/admin` manualmente ou clique em algum link antigo, o sistema não “volta pro login” quando já está autenticado como admin.

---

### 3) (Opcional, mas recomendado) Blindar o AdminLogin para não “parecer logout”
**Arquivo:** `src/pages/admin/AdminLogin.tsx`

Adicionar um `useEffect` no início:
- Se `user` existir:
  - checar o role via `get_user_admin_role`
  - se for admin → `navigate("/admin/dashboard", { replace: true })`
  - se não for admin → exibir mensagem “Você já está logado, mas não tem acesso ao admin” e dar botão “Ir ao Dashboard” (sem `signOut`)

**Efeito:** evita confusão caso um usuário já autenticado caia no login admin por qualquer motivo.

---

## Teste completo (passo a passo)
Depois de aplicar as mudanças:

1) **Logar como Super Admin**
- Acessar `/admin` diretamente
- Esperado: redireciona automaticamente para `/admin/dashboard` (Visão Geral), sem mostrar login

2) **Clicar no menu “Visão Geral”**
- Estando em qualquer página admin (ex.: `/admin/registros`)
- Clicar “Visão Geral”
- Esperado: abre `/admin/dashboard` e mantém sessão

3) **Teste de usuário não-admin**
- Logar como usuário comum (não admin)
- Tentar abrir `/admin`
- Esperado: redireciona para `/dashboard` (ou mostra acesso negado), **sem deslogar**

4) **Confirmação via logs**
- Conferir console/network se não há chamada de `signOut()` acontecendo ao clicar “Visão Geral”
- Validar que o hook de permissões não está entrando em loop

---

## Riscos e como vamos evitar
- **Race condition de auth/permissões**: o `AdminEntry` aguardará `loading` do `useAuth()` antes de decidir o que renderizar/redirecionar.
- **Segurança**: a checagem continua sendo feita via backend RPC `get_user_admin_role`, sem localStorage e sem “hardcode”.

---

## Arquivos que serão alterados/criados
- Alterar:
  - `src/components/admin/AdminSidebar.tsx`
  - `src/App.tsx`
  - (opcional) `src/pages/admin/AdminLogin.tsx`
- Criar:
  - `src/pages/admin/AdminEntry.tsx` (ou nome equivalente)

---

## Resultado esperado
- “Visão Geral” passa a abrir o painel correto (`/admin/dashboard`).
- `/admin` deixa de ser “página de login fixa” e vira “porta de entrada inteligente”.
- O comportamento de “deslogar/voltar pro login” ao clicar no menu deixa de acontecer.
