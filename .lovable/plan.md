

# Plano: Criar Seção FAQ Animada com Accordion

## Objetivo

Substituir a seção "Perguntas Frequentes" atual por uma seção "FAQ" completa e animada, com 10 perguntas principais sobre registro em blockchain, incluindo uma pergunta específica sobre a diferença entre INPI e blockchain.

## Análise Atual

- A seção FAQ atual na Home.tsx (linhas 315-356) tem apenas 3 perguntas simples
- Usa Cards estáticos sem interatividade
- O projeto já possui o componente Accordion do Radix UI com animações CSS
- O AnimatedList.tsx pode ser usado para entrada staggered dos items
- Framer-motion está instalado para micro-interações

## Nova Arquitetura

```text
┌─────────────────────────────────────────────────────────────────┐
│                     Seção FAQ Animada                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Header com Badge "FAQ" + Título animado                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  AnimatedList (stagger entry)                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ AccordionItem 1 - Ícone + Pergunta + Resposta       │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ AccordionItem 2 - Ícone + Pergunta + Resposta       │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ...                                                      │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ AccordionItem 10 - INPI vs Blockchain (destaque)    │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## As 10 Perguntas do FAQ

| # | Pergunta | Categoria |
|---|----------|-----------|
| 1 | O que é registro em blockchain? | Conceito |
| 2 | Como funciona a prova de anterioridade? | Funcionamento |
| 3 | Meu registro é permanente e imutável? | Segurança |
| 4 | Quais tipos de arquivos posso registrar? | Uso |
| 5 | O registro tem validade jurídica? | Legal |
| 6 | Como posso verificar meu registro? | Verificação |
| 7 | O que é um hash criptográfico? | Técnico |
| 8 | Quanto tempo leva para confirmar o registro? | Processo |
| 9 | Posso registrar marcas e logos? | Uso |
| 10 | Qual a diferença entre registro no INPI e blockchain? | **DESTAQUE** |

## Componente a Criar

### FAQSection.tsx

Novo componente dedicado para a seção FAQ com:

- Accordion animado do Radix UI
- Entrada staggered com AnimatedList
- Ícones coloridos por categoria
- Item destacado (INPI vs Blockchain) com borda especial
- Animação suave de abertura/fechamento
- Design premium consistente com o resto do site

### Estrutura do Componente

```typescript
// Dados estruturados das FAQs
const faqData = [
  {
    id: "blockchain-registro",
    icon: Shield,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    question: "O que é registro em blockchain?",
    answer: "É uma forma de criar uma prova digital imutável..."
  },
  // ... mais 9 perguntas
  {
    id: "inpi-vs-blockchain",
    icon: Scale, // Ícone de balança
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    question: "Qual a diferença entre registro no INPI e blockchain?",
    answer: "Explicação detalhada...",
    highlighted: true // Destaque visual
  }
];
```

## Animações Implementadas

1. **Entrada Staggered**: Cada item do accordion aparece com delay progressivo
2. **Accordion Expand/Collapse**: Animação suave de altura com Radix
3. **Hover States**: Elevação e borda destacada ao passar o mouse
4. **Ícone Rotação**: Chevron rotaciona 180 graus ao abrir
5. **Fade do Conteúdo**: Resposta aparece com fade suave

## Arquivos a Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/home/FAQSection.tsx` | CRIAR | Novo componente FAQ animado |
| `src/pages/Home.tsx` | MODIFICAR | Substituir seção FAQ antiga pelo novo componente |

## Design Visual

- Accordion com bordas arredondadas e fundo card-premium
- Ícones coloridos à esquerda de cada pergunta
- Chevron animado à direita
- Item INPI vs Blockchain com borda primary/gradiente
- Responsivo: funciona bem em mobile e desktop
- Suporte a tema claro/escuro

## Respostas Detalhadas (Conteúdo)

### 1. O que é registro em blockchain?
Blockchain é uma tecnologia de registro distribuído que cria um histórico imutável e transparente. Ao registrar seu arquivo, geramos um hash criptográfico único que é gravado permanentemente na rede, comprovando que você possuía aquele conteúdo em determinada data.

### 2. Como funciona a prova de anterioridade?
Quando você faz um registro, capturamos a data e hora exata (timestamp) e o hash do seu arquivo. Essa informação é gravada na blockchain, criando uma prova irrefutável de que aquele conteúdo existia naquele momento, antes de qualquer outro registro posterior.

### 3. Meu registro é permanente e imutável?
Sim. Uma vez confirmado na blockchain, o registro não pode ser alterado, excluído ou falsificado. A tecnologia garante que a prova permanecerá íntegra e verificável por tempo indeterminado.

### 4. Quais tipos de arquivos posso registrar?
Você pode registrar imagens (logos, artes), documentos (contratos, PDFs), código-fonte, vídeos, músicas, planilhas e qualquer arquivo digital. O sistema aceita diversos formatos e tamanhos.

### 5. O registro tem validade jurídica?
O registro em blockchain constitui prova técnica de anterioridade reconhecida em processos judiciais. É um documento complementar que pode ser utilizado como evidência em disputas de autoria e propriedade intelectual.

### 6. Como posso verificar meu registro?
Cada registro gera um certificado com QR Code e link de verificação pública. Qualquer pessoa pode acessar e confirmar a autenticidade do registro de forma independente, sem precisar de login.

### 7. O que é um hash criptográfico?
É uma "impressão digital" única do seu arquivo, gerada por algoritmos matemáticos (SHA-256). Qualquer alteração mínima no arquivo gera um hash completamente diferente, garantindo a integridade do conteúdo original.

### 8. Quanto tempo leva para confirmar o registro?
O registro é processado em poucos minutos. Após a confirmação na blockchain, você recebe o certificado digital em PDF por email e pode acessá-lo pelo painel a qualquer momento.

### 9. Posso registrar marcas e logos?
Sim, você pode registrar a imagem da sua marca ou logo como prova de anterioridade. Porém, para proteção legal completa de marca, recomendamos também o registro formal junto ao INPI.

### 10. Qual a diferença entre registro no INPI e blockchain? (DESTAQUE)
**INPI (Instituto Nacional da Propriedade Industrial):**
- Registro oficial de marcas no Brasil
- Processo burocrático (12-24 meses)
- Confere direito exclusivo de uso
- Custo mais elevado
- Necessário para proteção jurídica completa

**Blockchain (WebMarcas):**
- Prova técnica de anterioridade
- Registro instantâneo (minutos)
- Comprova existência em data específica
- Custo acessível (R$49)
- Complementa o registro no INPI

**Recomendação:** Utilize ambos. O registro em blockchain garante prova imediata enquanto aguarda o processo do INPI, formando uma proteção completa para sua propriedade intelectual.

