
# Plano de Correção: Meta Pixel e Melhorias Gerais

## Resumo da Análise

O Meta Pixel está **instalado corretamente** e funcionando. Os logs do console confirmam que os eventos estão sendo disparados:
```
[Meta Pixel] Event tracked: ViewContent {...}
```

### O que está funcionando:
- Pixel base no `<head>` do `index.html`
- Evento `PageView` em todas as páginas
- `ViewContent` ao visualizar seção de preços
- `InitiateCheckout` ao clicar nos botões de registro
- `Lead` e `CompleteRegistration` no cadastro
- `AddToCart` ao iniciar registro de arquivo
- `Purchase` quando pagamento é confirmado

## Problemas Encontrados

### 1. Warning de Ref no Header (Prioridade Média)
```
Warning: Function components cannot be given refs.
Check the render method of `Header`.
```
**Causa**: O componente `DropdownMenu` está recebendo uma ref que não pode processar.

### 2. Warnings do React Router v7 (Prioridade Baixa)
Avisos de flags futuras para a versão 7 do React Router.

---

## Correções Planejadas

### Correção 1: Resolver Warning de Ref no Header
**Arquivo**: `src/components/layout/Header.tsx`

O problema está na forma como os componentes do Dropdown Menu são renderizados. Vou garantir que a estrutura está correta.

### Correção 2: Adicionar Verificação de Disponibilidade do Pixel
**Arquivo**: `src/lib/metaPixel.ts`

Adicionar log de aviso caso o pixel não esteja carregado, para facilitar debug.

### Correção 3: Suprimir Warnings do React Router (Opcional)
**Arquivo**: `src/App.tsx`

Adicionar future flags ao BrowserRouter para eliminar os warnings.

---

## Detalhes Técnicos

### Estrutura do Pixel Meta (Atual - Funcionando)

```
index.html
├── <head>
│   └── Meta Pixel Script (init + PageView)
└── <body>
    └── <noscript> fallback (img tag)

src/lib/metaPixel.ts
├── trackEvent() - função base
├── trackViewPlan() - ViewContent
├── trackInitiateCheckout() - InitiateCheckout
├── trackCompleteRegistration() - CompleteRegistration
├── trackAddToCart() - AddToCart
├── trackPurchase() - Purchase
└── trackLead() - Lead
```

### Pontos de Integração do Funil

| Evento | Página | Trigger |
|--------|--------|---------|
| PageView | Todas | Carregamento |
| ViewContent | Home | Scroll até preço |
| InitiateCheckout | Home | Clique botão R$49 |
| Lead | Cadastro | Início do signup |
| CompleteRegistration | Cadastro | Após signup |
| AddToCart | NovoRegistro | Início do registro |
| Purchase | Checkout | Pagamento confirmado |

---

## Implementação

### Passo 1: Corrigir Header.tsx
Remover qualquer ref problemática do DropdownMenu e usar a estrutura correta do Radix.

### Passo 2: Melhorar Log do Pixel
Adicionar verificação se `window.fbq` existe e mostrar warning útil caso não esteja disponível.

### Passo 3: Testar Eventos
Após as correções:
1. Abrir console do navegador
2. Navegar pela página inicial
3. Rolar até seção de preço → deve aparecer `ViewContent`
4. Clicar em "Registrar por R$49" → deve aparecer `InitiateCheckout`
5. Completar cadastro → deve aparecer `Lead` e `CompleteRegistration`

---

## Resultado Esperado

- Warnings eliminados do console
- Pixel Meta 100% funcional
- Logs claros para debug
- Funil de conversão rastreando corretamente

**Nota**: O pixel já está funcionando. As correções são para eliminar warnings e melhorar a robustez do código.
