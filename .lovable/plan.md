
# Plano: Corrigir Titular do Certificado para Usar Dados do Cliente

## Problema Identificado

O certificado de prova de anterioridade está exibindo os dados da WebMarcas como titular em vez dos dados do cliente que fez o registro:

**Atualmente:**
- Titular: "Webmarcas Patentes Ltda"
- CNPJ: "39.528.012/0001-29"

**Deveria ser:**
- Titular: Nome do cliente (ex: "DAVILYS DANQUES DE OLIVEIRA CUNHA")
- CPF/CNPJ: Documento do cliente (ex: "39323911879")

## Causa Raiz

A edge function `generate-certificate` ignora os campos `titular_name`, `titular_document` e `titular_type` que já existem na tabela `registros` e foram preenchidos durante o cadastro.

A lógica atual (linhas 268-282) usa WebMarcas como fallback:
```typescript
const WEBMARCAS_NAME = "Webmarcas Patentes Ltda";
const WEBMARCAS_CNPJ = "39.528.012/0001-29";
userName: useBranding ? brandingSettings.display_name : WEBMARCAS_NAME,
userDocument: useBranding ? brandingSettings.document_number : WEBMARCAS_CNPJ,
```

## Solução

Usar os dados do registro (`titular_name`, `titular_document`) como fonte primária para o titular do certificado.

## Mudanças Necessárias

### 1. Edge Function - generate-certificate/index.ts

**Lógica de Prioridade para Dados do Titular:**

1. Se Business com branding configurado → usar branding
2. Senão → usar dados do registro (`titular_name`, `titular_document`)
3. Fallback (só se registro não tiver dados) → usar perfil do usuário

**Código Atual (linhas 268-282):**
```typescript
const WEBMARCAS_NAME = "Webmarcas Patentes Ltda";
const WEBMARCAS_CNPJ = "39.528.012/0001-29";

userName: useBranding ? brandingSettings.display_name : WEBMARCAS_NAME,
userDocument: useBranding ? brandingSettings.document_number : WEBMARCAS_CNPJ,
```

**Novo Código:**
```typescript
// Determinar dados do titular do certificado
// Prioridade: 1) Branding Business, 2) Dados do Registro, 3) Perfil do usuário
let certificateHolderName: string;
let certificateHolderDocument: string;

if (useBranding) {
  // Business com branding customizado
  certificateHolderName = brandingSettings.display_name;
  certificateHolderDocument = brandingSettings.document_number;
} else if (registro.titular_name && registro.titular_document) {
  // Usar dados do titular informados no registro
  certificateHolderName = registro.titular_name;
  certificateHolderDocument = formatDocument(
    registro.titular_document, 
    registro.titular_type
  );
} else if (profile?.full_name && profile?.cpf_cnpj) {
  // Fallback: usar perfil do usuário
  certificateHolderName = profile.full_name;
  certificateHolderDocument = profile.cpf_cnpj;
} else {
  // Último fallback: WebMarcas (não deveria acontecer)
  certificateHolderName = "Webmarcas Patentes Ltda";
  certificateHolderDocument = "39.528.012/0001-29";
}

// Usar no certificado
userName: certificateHolderName,
userDocument: certificateHolderDocument,
```

### 2. Adicionar Função de Formatação de Documento

Formatar CPF/CNPJ para exibição no certificado:

```typescript
function formatDocument(doc: string, type: string): string {
  const cleaned = doc.replace(/\D/g, '');
  if (type === 'CNPJ' || cleaned.length === 14) {
    // CNPJ: XX.XXX.XXX/XXXX-XX
    return cleaned.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  } else {
    // CPF: XXX.XXX.XXX-XX
    return cleaned.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      '$1.$2.$3-$4'
    );
  }
}
```

## Fluxo Corrigido

```text
+---------------------------+
|  Certificado Gerado       |
+---------------------------+
            |
            v
+---------------------------+
|  1. Usuário Business      |
|     com branding ativo?   |
|---------------------------+
|  SIM → Usar branding      |
+---------------------------+
            | NÃO
            v
+---------------------------+
|  2. Registro tem          |
|     titular_name?         |
|---------------------------+
|  SIM → Usar dados         |
|        do registro        |
+---------------------------+
            | NÃO
            v
+---------------------------+
|  3. Fallback: perfil      |
|     do usuário            |
+---------------------------+
```

## Resultado Esperado

**Antes:** O certificado mostrava "Webmarcas Patentes Ltda" como titular

**Depois:** O certificado mostra os dados reais do cliente:
- Nome: "DAVILYS DANQUES DE OLIVEIRA CUNHA"
- CPF: "393.239.118-79"

## Arquivo a Modificar

- `supabase/functions/generate-certificate/index.ts`
  - Adicionar função `formatDocument()`
  - Modificar lógica de seleção do titular (linhas 268-282)
  - Usar dados do registro como fonte primária

## Validações

- Registro com titular preenchido → mostra dados do cliente
- Registro sem titular → usa perfil do usuário
- Business com branding → usa branding (mantém comportamento atual)
- Todos casos → nunca mostrar dados da WebMarcas como titular

## Deploy

Após modificação, a edge function será automaticamente redeployada.
