
# Plano de Implementacao: Personalizacao de Certificado para Plano Business

## Resumo Executivo

Implementar sistema de personalizacao de certificados exclusivo para usuarios do Plano Business (R$99/mes), permitindo que emitam certificados com sua propria identidade visual: logo, nome, documento e cores personalizadas.

---

## Parte 1: Alteracoes na Interface

### 1.1 Renomear Aba "Conta" para "Configuracoes"

**Arquivos afetados:**
- `src/components/layout/DashboardSidebar.tsx`
- `src/components/layout/DashboardBottomNav.tsx`
- `src/components/layout/DashboardMobileNav.tsx`
- `src/pages/Conta.tsx`

**Mudancas:**
- Alterar titulo de "Conta" para "Configuracoes"
- Alterar icone de `User` para `Settings`
- Manter toda a estrutura interna existente (Perfil, Plano, Faturas, Alertas)

### 1.2 Adicionar Nova Sub-aba "Personalizar Certificado"

**Arquivo:** `src/pages/Conta.tsx`

Adicionar quinta aba ao TabsList:

```
TabsList atual:
[Perfil] [Plano] [Faturas] [Alertas]

TabsList novo:
[Perfil] [Plano] [Faturas] [Alertas] [Certificado]
```

Layout da nova aba inspirado no Asaas:
- Card com titulo "Personalize seu Certificado"
- Bloqueio visual para nao-Business com CTA "Atualizar para Business"
- Para Business: formulario completo de personalizacao

---

## Parte 2: Componente de Personalizacao

### 2.1 Criar Componente `CertificateCustomization.tsx`

**Arquivo:** `src/components/certificates/CertificateCustomization.tsx`

**Funcionalidades:**

1. **Upload de Logo**
   - Aceita PNG, JPG, SVG (max 2MB)
   - Preview da imagem carregada
   - Botao para remover
   - Upload para bucket `business-branding`

2. **Dados do Titular**
   - Campo "Nome que aparecera no certificado" (pre-preenchido do perfil)
   - Campo "CPF ou CNPJ" (pre-preenchido do perfil)
   - Validacao de formato

3. **Cores Personalizadas**
   - Seletor de cor primaria (titulo, barras)
   - Seletor de cor secundaria (acentos)
   - Paletas pre-definidas sugeridas
   - Input HEX para cores customizadas

4. **Pre-visualizacao em Tempo Real**
   - Mini-certificado mostrando como ficara
   - Atualiza conforme usuario muda opcoes
   - Mostra logo, nome, cores

5. **Botao Salvar Configuracoes**
   - Salva no banco de dados
   - Feedback visual de sucesso

### 2.2 Logica de Bloqueio para Nao-Business

```
Se isBusinessPlan === false:
  - Mostrar overlay semi-transparente
  - Exibir icone de cadeado
  - Texto: "Recurso exclusivo do Plano Business"
  - Botao: "Atualizar para Business (R$99/mes)"
  - Link para /checkout?plan=BUSINESS
```

---

## Parte 3: Banco de Dados

### 3.1 Criar Tabela `business_branding_settings`

```sql
CREATE TABLE public.business_branding_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logo_path TEXT,
  display_name TEXT NOT NULL,
  document_number TEXT NOT NULL,
  primary_color TEXT DEFAULT '#0a3d6e',
  secondary_color TEXT DEFAULT '#0066cc',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
```

### 3.2 RLS Policies

```sql
-- Usuarios podem ver suas proprias configuracoes
CREATE POLICY "Users can view own branding"
  ON business_branding_settings FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios podem inserir suas configuracoes (apenas se Business)
CREATE POLICY "Business users can insert branding"
  ON business_branding_settings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM asaas_subscriptions
      WHERE user_id = auth.uid()
      AND plan_type = 'BUSINESS'
      AND status = 'ACTIVE'
    )
  );

-- Usuarios podem atualizar suas configuracoes (apenas se Business)
CREATE POLICY "Business users can update branding"
  ON business_branding_settings FOR UPDATE
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM asaas_subscriptions
      WHERE user_id = auth.uid()
      AND plan_type = 'BUSINESS'
      AND status = 'ACTIVE'
    )
  );

-- Admins podem ver todas
CREATE POLICY "Admins can view all branding"
  ON business_branding_settings FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
```

### 3.3 Criar Bucket de Storage

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-branding', 'business-branding', false);

-- Policy para upload de logos
CREATE POLICY "Business users can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'business-branding' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    EXISTS (
      SELECT 1 FROM asaas_subscriptions
      WHERE user_id = auth.uid()
      AND plan_type = 'BUSINESS'
      AND status = 'ACTIVE'
    )
  );

-- Policy para visualizar logos
CREATE POLICY "Users can view own logos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'business-branding' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy para deletar logos
CREATE POLICY "Users can delete own logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'business-branding' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Parte 4: Integracao com Geracao de Certificado

### 4.1 Atualizar Edge Function `generate-certificate`

**Arquivo:** `supabase/functions/generate-certificate/index.ts`

**Alteracoes:**

1. Verificar se usuario tem plano Business ativo
2. Se sim, buscar `business_branding_settings`
3. Passar dados de branding para `generatePDFContent()`
4. Incluir campo `branding` no retorno JSON

```typescript
// Buscar branding se for Business
let brandingSettings = null;
if (await isBusinessPlan(userId, supabaseAdmin)) {
  const { data } = await supabaseAdmin
    .from('business_branding_settings')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();
  brandingSettings = data;
}

// Gerar certificado com branding
const certificateData = generatePDFContent({
  ...existingParams,
  branding: brandingSettings ? {
    logoUrl: brandingSettings.logo_path 
      ? await getSignedUrl(brandingSettings.logo_path) 
      : null,
    displayName: brandingSettings.display_name,
    documentNumber: brandingSettings.document_number,
    primaryColor: brandingSettings.primary_color,
    secondaryColor: brandingSettings.secondary_color,
  } : null
});
```

### 4.2 Atualizar `certificateService.ts`

**Arquivo:** `src/services/certificateService.ts`

**Alteracoes:**

1. Atualizar interface `CertificateData` para incluir branding
2. Modificar `generateCertificatePDF()` para:
   - Usar logo do cliente se disponivel
   - Usar nome/documento do cliente
   - Aplicar cores personalizadas
   - Ajustar footer para mostrar "Emitido via WebMarcas"

```typescript
interface CertificateData {
  // ... campos existentes
  branding?: {
    logoUrl: string | null;
    displayName: string;
    documentNumber: string;
    primaryColor: string;
    secondaryColor: string;
  } | null;
}

// Na geracao do PDF:
const useBranding = certificateData.branding !== null;

// Logo
if (useBranding && certificateData.branding.logoUrl) {
  // Usar logo do cliente
} else {
  // Usar logo WebMarcas (comportamento atual)
}

// Cores
const primaryColor = useBranding 
  ? hexToRgb(certificateData.branding.primaryColor)
  : colors.primary;

// Header
if (useBranding) {
  // Nome do cliente em destaque
  // "Emitido via WebMarcas" em texto menor
} else {
  // Layout atual WebMarcas
}
```

---

## Parte 5: Hook de Branding

### 5.1 Criar Hook `useBrandingSettings`

**Arquivo:** `src/hooks/useBrandingSettings.tsx`

```typescript
interface BrandingSettings {
  id: string;
  logoPath: string | null;
  logoUrl: string | null;
  displayName: string;
  documentNumber: string;
  primaryColor: string;
  secondaryColor: string;
  isActive: boolean;
}

interface UseBrandingSettingsReturn {
  settings: BrandingSettings | null;
  loading: boolean;
  error: string | null;
  saveSettings: (data: Partial<BrandingSettings>) => Promise<void>;
  uploadLogo: (file: File) => Promise<string>;
  removeLogo: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useBrandingSettings(): UseBrandingSettingsReturn {
  // Implementacao...
}
```

---

## Parte 6: Comportamento do Sistema

### 6.1 Fluxo de Registro Business

```
1. Usuario Business inicia novo registro
2. Completa o fluxo normalmente
3. Ao gerar certificado:
   a. Sistema verifica se tem plano Business ativo
   b. Se sim, busca business_branding_settings
   c. Gera certificado personalizado com:
      - Logo do cliente
      - Nome do cliente como titular
      - CPF/CNPJ do cliente
      - Cores personalizadas
      - Rodape: "Emitido via WebMarcas"
   d. Se nao tem branding configurado, usa dados do perfil
4. Certificado baixado mostra identidade do cliente
```

### 6.2 Regra de Vencimento

```
Se assinatura Business vencer:
  - business_branding_settings.is_active = false (trigger automatico)
  - Certificados futuros voltam para modelo WebMarcas padrao
  - Certificados ja emitidos permanecem com branding
  - Ao reativar Business, configuracoes voltam a funcionar
```

### 6.3 Trigger de Desativacao

```sql
CREATE OR REPLACE FUNCTION deactivate_branding_on_subscription_end()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('CANCELLED', 'EXPIRED', 'SUSPENDED') 
     AND OLD.status = 'ACTIVE' 
     AND OLD.plan_type = 'BUSINESS' THEN
    UPDATE business_branding_settings
    SET is_active = false, updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  IF NEW.status = 'ACTIVE' 
     AND OLD.status != 'ACTIVE' 
     AND NEW.plan_type = 'BUSINESS' THEN
    UPDATE business_branding_settings
    SET is_active = true, updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_branding_on_subscription_change
AFTER UPDATE ON asaas_subscriptions
FOR EACH ROW EXECUTE FUNCTION deactivate_branding_on_subscription_end();
```

---

## Parte 7: Arquivos a Criar/Modificar

### Novos Arquivos:
1. `src/components/certificates/CertificateCustomization.tsx`
2. `src/components/certificates/CertificatePreview.tsx` (mini preview)
3. `src/components/certificates/ColorPicker.tsx`
4. `src/hooks/useBrandingSettings.tsx`

### Arquivos a Modificar:
1. `src/pages/Conta.tsx` - Adicionar aba Certificado
2. `src/components/layout/DashboardSidebar.tsx` - Renomear Conta → Configuracoes
3. `src/components/layout/DashboardBottomNav.tsx` - Renomear Conta → Configuracoes
4. `src/components/layout/DashboardMobileNav.tsx` - Renomear se existir referencia
5. `src/services/certificateService.ts` - Suporte a branding
6. `supabase/functions/generate-certificate/index.ts` - Buscar e passar branding

### Migracoes SQL:
1. Criar tabela `business_branding_settings`
2. Criar bucket `business-branding`
3. Criar policies RLS
4. Criar trigger de ativacao/desativacao

---

## Parte 8: Resultado Esperado

| Aspecto | Usuario Comum | Usuario Business |
|---------|---------------|------------------|
| Acesso a personalizacao | Bloqueado (CTA upgrade) | Liberado |
| Logo no certificado | WebMarcas | Logo do cliente |
| Nome do titular | Nome do perfil | Nome personalizado |
| CPF/CNPJ | Do perfil | Personalizado |
| Cores | Azul WebMarcas | Cores do cliente |
| Rodape | "WebMarcas" | "Emitido via WebMarcas" |
| Pre-visualizacao | Nao | Sim, em tempo real |

---

## Estimativa de Implementacao

| Etapa | Complexidade |
|-------|--------------|
| Migracoes SQL | Media |
| Hook useBrandingSettings | Baixa |
| Componente CertificateCustomization | Alta |
| Integracao certificateService | Media |
| Edge Function update | Media |
| Testes e ajustes | Media |

**Total estimado:** Implementacao completa em uma sessao
