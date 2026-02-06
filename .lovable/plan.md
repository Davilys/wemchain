

# Plano: Manter Certificado Padrao WebMarcas (Personalização Opcional)

## Entendimento do Problema

**Comportamento Atual:**
- O certificado usa dados do perfil do usuario (`profiles.full_name`, `profiles.cpf_cnpj`)
- Para usuarios Business, o plano era aplicar personalizacao automaticamente

**Comportamento Desejado:**
- Por padrao, certificado **sempre** sai com identidade visual da WebMarcas
- Somente se cliente Business **configurar explicitamente** em Configuracoes -> Certificado, ai usa a personalizacao

---

## Logica de Decisao

```
SE usuario tem plano Business ativo
  E tem registro em business_branding_settings
  E is_active = true
  E display_name nao esta vazio
ENTAO
  -> Usar branding personalizado do cliente
SENAO
  -> Usar dados padrao WebMarcas
```

---

## Alteracoes Necessarias

### 1. Edge Function `generate-certificate/index.ts`

**Situacao Atual:**
- Linha 233-238: Busca dados do `profiles` e passa para o certificado
- Linha 248-249: Usa `profile?.full_name` e `profile?.cpf_cnpj`

**Alteracao:**

Adicionar logica para:
1. Verificar se usuario tem plano Business ativo
2. Buscar `business_branding_settings` onde `is_active = true`
3. Se existir E tiver dados preenchidos -> usar branding do cliente
4. Senao -> usar dados fixos da WebMarcas

```typescript
// Buscar branding settings se existir
const { data: brandingSettings } = await supabaseAdmin
  .from('business_branding_settings')
  .select('*')
  .eq('user_id', userId)
  .eq('is_active', true)
  .maybeSingle();

// Decidir qual identidade usar
const useBranding = brandingSettings && 
  brandingSettings.display_name && 
  brandingSettings.document_number;

// Passar para generatePDFContent
const certificateData = generatePDFContent({
  ...params,
  // Se tiver branding configurado, usa. Senao, WebMarcas.
  userName: useBranding ? brandingSettings.display_name : "WebMarcas",
  userDocument: useBranding ? brandingSettings.document_number : "CNPJ: XX.XXX.XXX/0001-XX",
  branding: useBranding ? {
    logoPath: brandingSettings.logo_path,
    primaryColor: brandingSettings.primary_color,
    secondaryColor: brandingSettings.secondary_color,
    displayName: brandingSettings.display_name,
    documentNumber: brandingSettings.document_number,
  } : null,
});
```

### 2. Atualizar `generatePDFContent()` na Edge Function

**Alteracao:**
- Adicionar campo opcional `branding` na interface de dados
- Retornar `branding` no JSON para o frontend poder aplicar cores

```typescript
function generatePDFContent(data: {
  // ... campos existentes
  branding?: {
    logoPath: string | null;
    primaryColor: string;
    secondaryColor: string;
    displayName: string;
    documentNumber: string;
  } | null;
}): string {
  // ...
  
  return JSON.stringify({
    // ... dados existentes
    
    // Adicionar objeto branding para o frontend
    branding: data.branding || null,
  });
}
```

### 3. Atualizar `certificateService.ts` (Frontend)

**Alteracao:**
- Receber dados de branding do backend
- Se `branding !== null` -> aplicar cores personalizadas no PDF
- Senao -> manter visual padrao WebMarcas (comportamento atual)

```typescript
interface CertificateData {
  // ... campos existentes
  branding?: {
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    displayName: string;
    documentNumber: string;
  } | null;
}

// Na geracao do PDF:
if (certificateData.branding) {
  // Aplicar cores personalizadas
  const customPrimary = hexToRgb(certificateData.branding.primaryColor);
  // Usar customPrimary em vez de colors.primary
  
  // Se tiver logo, carregar e usar
  if (certificateData.branding.logoUrl) {
    const customLogoData = await loadImageAsDataURL(certificateData.branding.logoUrl);
    // Usar no lugar do logo WebMarcas
  }
  
  // Adicionar "Emitido via WebMarcas" no rodape
} else {
  // Manter visual atual WebMarcas (nao muda nada)
}
```

### 4. Ajustar Componente `CertificateCustomization.tsx`

**Situacao Atual:**
- Pre-preenche com dados do perfil quando nao tem settings

**Alteracao:**
- Mostrar mensagem mais clara: "Enquanto nao configurar, seus certificados serao emitidos em nome da WebMarcas"
- Nao pre-preencher automaticamente para deixar claro que e opcional

```tsx
// Remover pre-fill automatico do perfil
useEffect(() => {
  // REMOVER esse useEffect que faz pre-fill
  // O usuario deve preencher explicitamente se quiser personalizar
}, []);

// Adicionar aviso explicativo
{!settings && (
  <div className="...">
    <AlertCircle className="h-5 w-5" />
    <div>
      <p className="font-medium">Certificados Padrao WebMarcas</p>
      <p className="text-xs">
        Seus certificados serao emitidos em nome da WebMarcas ate voce
        configurar sua personalizacao abaixo.
      </p>
    </div>
  </div>
)}
```

---

## Tabela: Comportamento Final

| Situacao | Emissor no Certificado |
|----------|------------------------|
| Usuario comum (sem Business) | WebMarcas |
| Usuario Business SEM configurar personalizacao | WebMarcas |
| Usuario Business COM personalizacao configurada | Dados do cliente |
| Usuario Business com assinatura vencida | WebMarcas (is_active = false) |

---

## Dados WebMarcas Padrao

Para o certificado padrao, usar:
- **Nome:** WebMarcas
- **Documento:** CNPJ conforme dados da empresa
- **Logo:** Logo WebMarcas (ja existe no projeto)
- **Cores:** Azul primario #0a3d6e, secundario #0066cc

---

## Arquivos a Alterar

1. `supabase/functions/generate-certificate/index.ts` - Logica de decisao branding
2. `src/services/certificateService.ts` - Aplicar branding se existir
3. `src/components/certificates/CertificateCustomization.tsx` - Remover pre-fill e melhorar UX

---

## Vantagens dessa Abordagem

- Certificados sempre validos com dados da WebMarcas por padrao
- Cliente Business tem **opcao** de personalizar, nao e automatico
- Se nao configurar, nao fica com dados vazios ou incorretos
- Transicao suave: certificados antigos continuam iguais
- Seguranca: dados da WebMarcas sao fixos e confiaveis

