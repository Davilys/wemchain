

# Plano: Deduplicacao de Clientes, Perfil Completo e Validacoes

## Resumo

Corrigir duplicidade de clientes no painel admin, redesenhar a area de dados pessoais separando pessoa fisica e empresa, adicionar endereco com preenchimento automatico por CEP, e bloquear registro sem perfil completo.

---

## 1. Migracoes de Banco de Dados

### 1.1 Novos campos na tabela `profiles`

Adicionar campos separados para CPF e CNPJ, razao social, e endereco completo:

- `cpf` (text, nullable) - CPF do cliente (obrigatorio apos primeiro acesso)
- `cnpj` (text, nullable) - CNPJ opcional
- `razao_social` (text, nullable) - Razao social da empresa
- `cep` (text, nullable) - obrigatorio
- `rua` (text, nullable) - obrigatorio
- `numero` (text, nullable) - obrigatorio
- `complemento` (text, nullable) - opcional
- `bairro` (text, nullable) - obrigatorio
- `cidade` (text, nullable) - obrigatorio
- `estado` (text, nullable) - obrigatorio

### 1.2 Migrar dados existentes

- Copiar `cpf_cnpj` para `cpf` ou `cnpj` baseado no tamanho (11 digitos = CPF, 14 = CNPJ)
- Criar indice UNIQUE em `cpf` (WHERE cpf IS NOT NULL) para evitar duplicatas

### 1.3 Constraint de unicidade

```sql
CREATE UNIQUE INDEX idx_profiles_cpf_unique ON profiles (cpf) WHERE cpf IS NOT NULL;
```

Isso impede dois perfis com o mesmo CPF.

---

## 2. Admin - Deduplicacao de Clientes (AdminUsuarios.tsx)

### 2.1 Identificar duplicatas por CPF/CNPJ

Na listagem, agrupar clientes que compartilham o mesmo CPF ou CNPJ. Exibir um badge "Duplicado" ao lado de clientes com CPF repetido.

### 2.2 Funcionalidade de unificacao

Adicionar botao "Unificar" quando duplicatas sao detectadas:
- Selecionar conta principal (a mais antiga ou a que tem mais registros)
- Transferir todos os `registros`, `certificates`, `record_authors`, `credits_ledger`, `asaas_payments` da conta secundaria para a principal
- Marcar conta secundaria como bloqueada com motivo "Conta unificada"

Isso sera feito via uma nova edge function `admin-merge-clients` que:
1. Recebe `primary_user_id` e `secondary_user_id`
2. Usa service role para mover todos os dados
3. Bloqueia a conta secundaria

---

## 3. Bloquear Cadastro Duplicado

### 3.1 Na pagina de Cadastro (Cadastro.tsx)

Sem alteracoes no cadastro inicial (apenas nome, email, senha). O CPF sera preenchido depois na area do cliente.

### 3.2 Validacao no save do perfil

Quando o cliente salvar o CPF na pagina de configuracoes, verificar se ja existe outro perfil com o mesmo CPF. Se existir, exibir erro "Este CPF ja esta cadastrado em outra conta".

---

## 4. Bloquear Registro sem Perfil Completo

### 4.1 NovoRegistro.tsx

Antes de permitir criar um registro, verificar se o perfil tem os campos obrigatorios preenchidos:
- `full_name`
- `cpf`
- `cep`, `rua`, `numero`, `bairro`, `cidade`, `estado`

Se incompleto, exibir mensagem: "Complete seus dados pessoais em Configuracoes antes de registrar" com link para `/conta`.

---

## 5. Redesenhar Pagina de Perfil (Conta.tsx - aba Perfil)

### 5.1 Secao "Dados Pessoais" (obrigatorios)

Campos na ordem:
- E-mail (somente leitura)
- Nome Completo (obrigatorio)
- CPF (obrigatorio, com mascara e validacao)
- Telefone (obrigatorio)

### 5.2 Secao "Endereco" (obrigatorio)

Campos na ordem:
- CEP (com busca automatica via ViaCEP API: `https://viacep.com.br/ws/{cep}/json/`)
- Rua (preenchido automaticamente)
- Numero (manual)
- Complemento (opcional)
- Bairro (preenchido automaticamente)
- Cidade (preenchido automaticamente)
- Estado (preenchido automaticamente)

### 5.3 Secao "Dados da Empresa" (opcional)

- CNPJ (opcional, com mascara e validacao)
- Razao Social (opcional)

### 5.4 Busca automatica por CEP

Ao digitar 8 digitos no campo CEP, chamar a API ViaCEP e preencher automaticamente rua, bairro, cidade e estado.

```text
Fluxo:
CEP digitado (8 digitos) --> fetch viacep.com.br/ws/{cep}/json/
  --> Preenche: rua, bairro, cidade, estado
  --> Usuario preenche: numero, complemento
```

---

## 6. Arquivos Modificados

| Arquivo | Alteracao |
|---------|-----------|
| Nova migracao SQL | Campos de endereco, cpf, cnpj separados, indice unique |
| `src/pages/Conta.tsx` | Redesenhar aba Perfil com 3 secoes + busca CEP |
| `src/pages/NovoRegistro.tsx` | Validar perfil completo antes de permitir registro |
| `src/pages/admin/AdminUsuarios.tsx` | Detectar e exibir duplicatas, botao unificar |
| `supabase/functions/admin-merge-clients/index.ts` | Nova edge function para unificar contas |
| `src/integrations/supabase/types.ts` | Atualizado automaticamente |

---

## 7. Seguranca

- Indice UNIQUE no CPF garante que nao existam duplicatas futuras
- Edge function de merge exige role `super_admin`
- Validacao de CPF/CNPJ com algoritmo oficial (ja existe em `cpfValidator.ts`)
- Busca CEP e client-side, sem dados sensiveis

