

# Plano: Adicionar Animações de Transição com Framer Motion

## Objetivo

Implementar animações de transição suaves nas páginas usando `framer-motion` para melhorar significativamente a experiência do usuário em toda a plataforma.

## Análise Atual

- O projeto já usa algumas animações CSS via Tailwind (fade-up, scale-in, etc.)
- Não possui `framer-motion` instalado
- As mudanças de página são instantâneas sem transições
- Os layouts (DashboardLayout, AdminLayout) são pontos ideais para implementar as animações

## Arquitetura da Solução

```text
┌─────────────────────────────────────────────────────────────────┐
│                        App.tsx                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              AnimatePresence (wrapper)                    │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │                 Routes                              │  │  │
│  │  │   ┌─────────────────┐  ┌─────────────────┐          │  │  │
│  │  │   │  PageTransition │  │  PageTransition │          │  │  │
│  │  │   │   (wrapper)     │  │   (wrapper)     │          │  │  │
│  │  │   │  ┌───────────┐  │  │  ┌───────────┐  │          │  │  │
│  │  │   │  │  Content  │  │  │  │  Content  │  │          │  │  │
│  │  │   │  └───────────┘  │  │  └───────────┘  │          │  │  │
│  │  │   └─────────────────┘  └─────────────────┘          │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Componentes a Criar/Modificar

### 1. Novo Componente: PageTransition.tsx

Wrapper reutilizável que aplica animações de entrada/saída:

```typescript
// Variantes de animação disponíveis:
- fadeUp: Fade + slide de baixo para cima (padrão)
- fadeIn: Apenas fade
- slideRight: Slide da esquerda
- scale: Scale + fade
- stagger: Container com elementos animados em sequência
```

### 2. Novo Componente: AnimatedList.tsx

Para listas de cards/items com animação stagger:

```typescript
// Cards aparecem um após o outro com delay
- Cada item tem delay incremental (0.05s)
- Animação de entrada suave
- Perfeito para dashboards e listas
```

### 3. Modificações nos Layouts

**DashboardLayout.tsx:**
- Envolver `{children}` com `<PageTransition>`
- Animação fadeUp por padrão

**AdminLayout.tsx:**
- Mesmo tratamento que o dashboard
- Consistência visual em toda plataforma

**App.tsx:**
- Adicionar `AnimatePresence` no nível de rotas
- Permitir animações de saída

## Detalhes de Implementação

### Instalação
```bash
npm install framer-motion
```

### Variantes de Animação

```typescript
const pageVariants = {
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 }
  }
};
```

### Uso Simplificado

```tsx
// Nas páginas, basta usar o layout - animação automática
export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Conteúdo será animado automaticamente */}
    </DashboardLayout>
  );
}

// Para listas com stagger
<AnimatedList>
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</AnimatedList>
```

## Páginas Beneficiadas

### Área do Usuário
| Página | Animação | Elementos Animados |
|--------|----------|-------------------|
| Dashboard | fadeUp + stagger | Cards de métricas, lista de registros |
| MeusRegistros | fadeUp + stagger | Header, filtros, lista de cards |
| NovoRegistro | fadeUp | Steps do formulário |
| Certificado | scale | Card do certificado |
| Checkout | fadeUp | Cards de preços |

### Área Admin
| Página | Animação | Elementos Animados |
|--------|----------|-------------------|
| AdminDashboard | fadeUp + stagger | Cards de métricas |
| AdminUsuarios | fadeUp + stagger | Tabela de usuários |
| AdminRegistros | fadeUp + stagger | Lista de registros |
| Todas as demais | fadeUp | Conteúdo principal |

## Arquivos a Modificar

1. **package.json** - Adicionar dependência `framer-motion`
2. **src/components/ui/PageTransition.tsx** - NOVO: Componente de transição
3. **src/components/ui/AnimatedList.tsx** - NOVO: Lista animada
4. **src/components/layout/DashboardLayout.tsx** - Integrar PageTransition
5. **src/components/admin/AdminLayout.tsx** - Integrar PageTransition
6. **src/App.tsx** - Adicionar AnimatePresence

## Benefícios

1. **UX Premium**: Transições suaves criam sensação de app nativo
2. **Feedback Visual**: Usuário percebe mudanças de estado
3. **Consistência**: Mesmo padrão em toda plataforma
4. **Performance**: Framer Motion usa GPU para animações
5. **Manutenibilidade**: Componentes reutilizáveis e configuráveis

## Considerações Técnicas

- **Reduced Motion**: Respeitar `prefers-reduced-motion` do sistema
- **Performance**: Animações curtas (200-400ms) para não atrasar UX
- **Mobile**: Animações mais sutis em dispositivos móveis
- **Bundle Size**: Framer Motion adiciona ~30KB gzipped

