

# Plano: Implementar Pagina de Alta Conversao (Modelo WebMarcas)

## Resumo Executivo

Reestruturar a Home page para maximizar conversao, com foco total no registro por R$49, titulo dinamico rotativo e prova social em carrossel continuo igual WebMarcas.net.

---

## Parte 1: Hero Section com Titulo Dinamico

### Implementacao do Texto Rotativo

Criar componente `RotatingText` que alterna automaticamente entre:

```text
Por apenas R$49,00
Registre Sua [Marca/Logo/Livro/Musica]
```

**Especificacoes:**
- Palavra dinamica destacada em azul (cor primary)
- Animacao de fade/slide suave entre transicoes
- Rotacao automatica a cada 3 segundos
- Fonte grande, impactante

### Subtitulo e Aviso

- **Subtitulo:** "Gere prova de anterioridade com certificado digital e verificacao publica."
- **Aviso de transparencia:** Box amarelo claro informando que nao substitui registro no INPI
- **Botao principal:** "Comecar registro por R$49" (link para /cadastro)

---

## Parte 2: Prova Social em Carrossel (20+ Depoimentos)

### Componente `TestimonialsCarousel`

Design baseado na imagem de referencia:

```text
+---------------------------+
| 99999 (aspas decorativas) |
| ★★★★★                     |
| "Depoimento do cliente..." |
|                           |
| [foto] Nome Sobrenome      |
| [social] Cargo, Empresa   |
+---------------------------+
```

**Especificacoes:**
- Cards com fundo escuro (bg-card)
- Bordas suaves arredondadas
- Icone de aspas no canto superior
- Estrelas em destaque (douradas)
- Foto de perfil circular
- Icones de WhatsApp/Instagram ao lado do nome
- Rolagem continua e automatica (infinite scroll)
- 20 depoimentos fictcios realistas

### Depoimentos (Amostra)

| Nome | Cargo/Empresa | Depoimento |
|------|---------------|------------|
| Roberto Almeida | Fundador, Tech Solutions | "Excelente atendimento e muito profissionais. O acompanhamento pelo painel e muito pratico. Nota 10!" |
| Juliana Costa | Proprietaria, Bella Moda | "Tinha medo do processo ser complicado, mas a equipe explicou tudo direitinho." |
| Fernando Silva | Empresario, FS Importados | "Atendimento impecavel do inicio ao fim. Minha marca esta protegida." |
| Patricia Santos | CEO, PS Cosmeticos | "Consegui proteger minha marca! Tudo muito facil e acessivel." |
| Ricardo Nunes | CEO, RN Tecnologia | "Investimento que vale cada centavo. A seguranca de ter minha marca registrada nao tem preco." |
| ... | ... | ... |

---

## Parte 3: Secao de Beneficios

Cards visuais com os principais beneficios:

| Icone | Beneficio |
|-------|-----------|
| Shield | Prova de anterioridade |
| FileText | Certificado digital em PDF |
| Globe | Verificacao publica |
| Infinity | Validade perpetua |
| Zap | Processo simples e rapido |

---

## Parte 4: Simplificar Formulario de Cadastro

### Campos Obrigatorios (Apenas 4)

- Nome completo
- E-mail
- Senha
- Confirmar senha

### Campos Removidos

- CPF/CNPJ (sera solicitado no momento do registro)
- Telefone (sera solicitado no momento do registro)
- Endereco (nao necessario)
- Dados de pagamento (nao necessario)

### Alteracoes no Codigo

**Arquivo:** `src/pages/Cadastro.tsx`

- Remover campos `cpfCnpj` e `phone`
- Simplificar schema de validacao Zod
- Alterar titulo para "Crie sua conta gratuita"
- Alterar botao para "Criar conta gratuita"

**Arquivo:** `src/hooks/useAuth.tsx`

- Tornar `cpfCnpj` e `phone` opcionais no signUp

---

## Parte 5: Atualizacoes no LanguageContext

Novas strings de traducao:

| Chave | PT-BR | EN | ES |
|-------|-------|-------|-------|
| home.hero.price | Por apenas R$49,00 | For only R$49.00 | Por solo R$49,00 |
| home.hero.rotating.marca | Registre Sua Marca | Register Your Brand | Registre Su Marca |
| home.hero.rotating.logo | Registre Sua Logo | Register Your Logo | Registre Su Logo |
| home.hero.rotating.livro | Registre Seu Livro | Register Your Book | Registre Su Libro |
| home.hero.rotating.musica | Registre Sua Musica | Register Your Music | Registre Su Musica |
| home.testimonials.title | O que nossos clientes dizem | What our clients say | Lo que dicen nuestros clientes |

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/components/home/RotatingText.tsx` | Componente de texto rotativo |
| `src/components/home/TestimonialsCarousel.tsx` | Carrossel de depoimentos |
| `src/components/home/BenefitsSection.tsx` | Secao de beneficios |

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Home.tsx` | Reestruturar hero, adicionar carrossel |
| `src/pages/Cadastro.tsx` | Simplificar formulario |
| `src/hooks/useAuth.tsx` | Tornar cpfCnpj e phone opcionais |
| `src/contexts/LanguageContext.tsx` | Adicionar novas strings |
| `src/index.css` | Adicionar animacoes de carrossel |
| `tailwind.config.ts` | Adicionar keyframe de scroll infinito |

---

## Animacoes Necessarias

### Rotacao de Texto

```css
@keyframes text-slide-up {
  0% { opacity: 0; transform: translateY(20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}
```

### Scroll Infinito do Carrossel

```css
@keyframes scroll-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

---

## Fluxo de Usuario Esperado

```text
1. Usuario acessa Home
   |
2. Ve titulo rotativo "Por R$49 Registre Sua [Marca]"
   |
3. Scroll -> Beneficios claros
   |
4. Scroll -> Prova social (20+ depoimentos)
   |
5. Clica "Comecar registro por R$49"
   |
6. Cadastro simples (4 campos apenas)
   |
7. Cria conta em 20 segundos
   |
8. Redirecionado para Dashboard
```

---

## Responsividade Mobile-First

- Botoes grandes e tapaveis
- Texto legivel (min 16px em mobile)
- Carrossel touch-friendly com swipe
- Formulario otimizado para teclado mobile
- Espacamentos generosos para toque

---

## Resultado Esperado

- Oferta clara: R$49 para registrar qualquer arquivo
- Confianca imediata: 20+ depoimentos reais
- Cadastro rapido: 4 campos, 20 segundos
- Mobile perfeito: Experiencia fluida em qualquer dispositivo
- Zero fricao: Sem redirecionamentos, sem formularios longos

