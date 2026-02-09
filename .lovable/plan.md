
# Plano: Corrigir Acesso do Admin Master a Registros e Certificados

## Problema Identificado

O admin master (super_admin) nao consegue ver todos os registros e certificados de todos os usuarios. O dashboard mostra apenas 7 registros quando existem 14 no banco, e os certificados tambem estao limitados.

**Causa raiz:** As politicas de seguranca (RLS) das tabelas `registros` e `certificates` usam `has_role(auth.uid(), 'admin')` que verifica apenas o role exato `admin`. O usuario super_admin tem o role `super_admin`, que nao passa nessa verificacao.

## Solucao

Atualizar as politicas RLS para usar a funcao `has_any_admin_role()` que ja existe no banco e cobre todos os roles administrativos (super_admin, admin, suporte, financeiro, auditor).

## Alteracoes Necessarias

### 1. Migracao SQL - Corrigir Politicas RLS

Atualizar 2 politicas:

| Tabela | Politica Atual | Correcao |
|--------|---------------|----------|
| `registros` | `has_role(auth.uid(), 'admin')` | `has_any_admin_role(auth.uid())` |
| `certificates` | `has_role(auth.uid(), 'admin')` | `has_any_admin_role(auth.uid())` |

SQL a executar:

```sql
-- Registros: permitir todos os admins verem todos os registros
DROP POLICY "Admins can view all registros" ON registros;
CREATE POLICY "Admins can view all registros" ON registros
  FOR SELECT USING (has_any_admin_role(auth.uid()));

-- Certificates: permitir todos os admins verem todos os certificados  
DROP POLICY "Admins can view all certificates" ON certificates;
CREATE POLICY "Admins can view all certificates" ON certificates
  FOR SELECT USING (has_any_admin_role(auth.uid()));
```

### 2. Nenhuma alteracao de codigo necessaria

As paginas `AdminRegistros.tsx` e `AdminCertificados.tsx` ja fazem as queries corretas (buscam todos os registros sem filtro de user_id). O problema e exclusivamente nas politicas de seguranca do banco.

## Resultado Esperado

- O super_admin vera todos os 14 registros e 12 certificados de todos os usuarios
- O dashboard mostrara as metricas corretas
- Todos os roles admin (admin, suporte, etc) tambem terao acesso de leitura conforme suas permissoes
- A seguranca continua garantida: usuarios comuns so veem seus proprios dados
