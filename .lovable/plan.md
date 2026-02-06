
# Plano: Corrigir Erro "Invalid Key" no Upload de Arquivos

## Problema Identificado

O Supabase Storage está rejeitando uploads de arquivos que contêm caracteres especiais no nome:
- **Erro**: `Invalid key: 38600758-12b7-4332-abd9-f91e74b0b514/1770409349411-Dãozin Teixeira - Só Jesus.wav`
- **Causa**: O nome do arquivo contém acentos (ã, ó), espaços e caracteres não permitidos
- **Impacto**: Usuários não conseguem registrar arquivos com nomes contendo acentos ou espaços

## Solução

Criar uma função de sanitização que normalize o nome do arquivo para o storage, enquanto preserva o nome original para exibição.

## Fluxo da Correção

```text
+---------------------------+        +---------------------------+
|  Nome Original            |   -->  |  Nome Sanitizado          |
|  (arquivo_nome no BD)     |        |  (filePath no Storage)    |
+---------------------------+        +---------------------------+
| Dãozin Teixeira - Só.wav  |   -->  | daozin_teixeira_so.wav    |
+---------------------------+        +---------------------------+
```

## Mudanças Necessárias

### 1. NovoRegistro.tsx - Adicionar Função de Sanitização

**Nova função utilitária:**
```typescript
/**
 * Sanitiza nome de arquivo para upload no Supabase Storage
 * - Remove acentos e caracteres especiais
 * - Substitui espaços por underscores
 * - Mantém apenas letras, números, underscores, hífens e pontos
 */
const sanitizeFileName = (fileName: string): string => {
  // Normaliza caracteres acentuados (NFD) e remove diacríticos
  const normalized = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  
  // Extrai nome e extensão
  const lastDot = normalized.lastIndexOf(".");
  const name = lastDot > 0 ? normalized.substring(0, lastDot) : normalized;
  const ext = lastDot > 0 ? normalized.substring(lastDot) : "";
  
  // Sanitiza o nome: substitui espaços e caracteres inválidos
  const safeName = name
    .toLowerCase()
    .replace(/\s+/g, "_")           // espaços -> underscores
    .replace(/[^a-z0-9_-]/g, "");   // remove caracteres inválidos
  
  return safeName + ext.toLowerCase();
};
```

### 2. Modificar handleSubmit

**Antes (linha 386):**
```typescript
const filePath = `${user.id}/${Date.now()}-${file.name}`;
```

**Depois:**
```typescript
const safeFileName = sanitizeFileName(file.name);
const filePath = `${user.id}/${Date.now()}-${safeFileName}`;
```

### 3. Preservar Nome Original

O nome original do arquivo já é salvo corretamente no banco de dados:
```typescript
arquivo_nome: file.name,  // Nome original preservado para exibição
```

Nenhuma alteração necessária nessa parte.

## Exemplos de Transformação

| Nome Original | Nome Sanitizado |
|---------------|-----------------|
| Dãozin Teixeira - Só Jesus.wav | daozin_teixeira_-_so_jesus.wav |
| Minha Música #1 (Final).mp3 | minha_musica_1_final.mp3 |
| Contrato João & Maria.pdf | contrato_joao__maria.pdf |
| 日本語ファイル.png | .png → fallback para file.png |

## Tratamento de Edge Cases

1. **Nome vira vazio**: Se o nome sanitizado ficar vazio (só caracteres especiais), usar "file" como fallback
2. **Extensão preservada**: A extensão do arquivo é sempre mantida
3. **Lowercase**: Tudo convertido para minúsculas para evitar problemas de case-sensitivity

## Arquivo a Modificar

- `src/pages/NovoRegistro.tsx`
  - Adicionar função `sanitizeFileName`
  - Atualizar linha do `filePath` no `handleSubmit`

## Resultado Esperado

- Qualquer arquivo pode ser registrado independente do nome
- Nomes com acentos, espaços, caracteres especiais funcionam
- O nome original é preservado para exibição ao usuário
- O storage recebe apenas nomes válidos (ASCII, sem espaços)
