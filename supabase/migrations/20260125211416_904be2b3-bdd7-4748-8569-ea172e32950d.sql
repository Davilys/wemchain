-- Create legal_documents table for versioned legal documents
CREATE TABLE public.legal_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_type TEXT NOT NULL,
    version TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT valid_document_type CHECK (document_type IN ('terms_of_use', 'privacy_policy', 'blockchain_policy')),
    UNIQUE(document_type, version)
);

-- Create audit_logs table for consent and action tracking
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    document_type TEXT,
    document_version TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT valid_action_type CHECK (action_type IN ('terms_accepted', 'privacy_accepted', 'blockchain_policy_accepted', 'data_export_requested', 'data_deletion_requested', 'login', 'logout', 'registro_created', 'certificado_downloaded'))
);

-- Create data_requests table for LGPD requests
CREATE TABLE public.data_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT valid_request_type CHECK (request_type IN ('export', 'deletion')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'rejected'))
);

-- Create user_consents table for tracking individual consent
CREATE TABLE public.user_consents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_version TEXT NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ip_address TEXT,
    CONSTRAINT valid_consent_document_type CHECK (document_type IN ('terms_of_use', 'privacy_policy', 'blockchain_policy')),
    UNIQUE(user_id, document_type, document_version)
);

-- Enable RLS on all tables
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for legal_documents (public read)
CREATE POLICY "Anyone can view active legal documents"
ON public.legal_documents FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage legal documents"
ON public.legal_documents FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for audit_logs
CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for data_requests
CREATE POLICY "Users can view their own data requests"
ON public.data_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own data requests"
ON public.data_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all data requests"
ON public.data_requests FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_consents
CREATE POLICY "Users can view their own consents"
ON public.user_consents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents"
ON public.user_consents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all consents"
ON public.user_consents FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_legal_documents_updated_at
BEFORE UPDATE ON public.legal_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_requests_updated_at
BEFORE UPDATE ON public.data_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial legal documents
INSERT INTO public.legal_documents (document_type, version, title, content) VALUES
('terms_of_use', '1.0', 'Termos de Uso', '# Termos de Uso da Plataforma WebMarcas

## 1. Natureza do Serviço

A WebMarcas oferece um serviço técnico de registro de prova de anterioridade através de tecnologia blockchain. Este serviço:

- **NÃO substitui** o registro de marca junto ao Instituto Nacional da Propriedade Industrial (INPI)
- **NÃO garante** exclusividade ou propriedade sobre marcas, logotipos ou obras
- **NÃO constitui** registro oficial perante qualquer órgão governamental

O serviço oferece **prova técnica de existência** de um arquivo em determinada data e hora, através do registro imutável do hash criptográfico em blockchain.

## 2. Blockchain como Meio Técnico

A tecnologia blockchain é utilizada como meio técnico para:

- Registrar o hash SHA-256 do arquivo enviado
- Criar um timestamp imutável e verificável
- Gerar prova de anterioridade através do protocolo OpenTimestamps

**Importante**: Nenhum arquivo é armazenado na blockchain. Apenas o hash criptográfico (resumo matemático único) é registrado.

## 3. Responsabilidade do Usuário

O usuário é integralmente responsável por:

- A veracidade e originalidade do conteúdo enviado
- Possuir direitos sobre o material registrado
- Não violar direitos de terceiros
- Não enviar conteúdo ilegal, difamatório ou prejudicial

## 4. Limitação de Responsabilidade

A WebMarcas:

- Não se responsabiliza por disputas de propriedade intelectual
- Não garante sucesso em processos judiciais ou administrativos
- Não oferece consultoria jurídica
- Não substitui a orientação de advogados especializados

A prova gerada é de natureza técnica e sua validade jurídica depende de avaliação caso a caso pelo Poder Judiciário.

## 5. Imutabilidade dos Registros

Uma vez confirmado na blockchain, o registro:

- Não pode ser alterado
- Não pode ser excluído
- Permanece verificável indefinidamente

Esta característica é fundamental para a validade da prova de anterioridade.

## 6. Foro e Legislação

Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o Foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias.

## 7. Aceitação

Ao utilizar a plataforma, você declara ter lido, compreendido e aceito integralmente estes Termos de Uso.

---

*Última atualização: Janeiro de 2026*
*WebMarcas - Uma extensão da WebPatentes*'),

('privacy_policy', '1.0', 'Política de Privacidade', '# Política de Privacidade - WebMarcas

Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

## 1. Dados Coletados

Coletamos os seguintes dados pessoais:

### Dados de Cadastro
- Nome completo
- CPF ou CNPJ
- Endereço de e-mail
- Número de telefone

### Dados de Uso
- Endereço IP
- Logs de acesso
- Arquivos enviados para registro

## 2. Finalidade do Tratamento

Seus dados são utilizados para:

- Identificação e autenticação na plataforma
- Execução do serviço de registro em blockchain
- Geração de certificados
- Comunicação sobre seus registros
- Cumprimento de obrigações legais

## 3. Armazenamento e Segurança

Seus dados são armazenados com:

- **Criptografia em repouso** - dados protegidos mesmo quando armazenados
- **Criptografia em trânsito** - todas as comunicações via HTTPS
- **Controle de acesso** - apenas pessoal autorizado
- **Logs de acesso** - auditoria completa de acessos
- **Backups seguros** - recuperação garantida

### Importante sobre Blockchain

**NENHUM ARQUIVO É ENVIADO À BLOCKCHAIN.**

Apenas o hash criptográfico (uma sequência de caracteres que representa matematicamente o arquivo) é registrado na blockchain. Seu arquivo original permanece armazenado de forma segura em nossos servidores.

## 4. Compartilhamento de Dados

Não compartilhamos seus dados pessoais com terceiros, exceto:

- Por determinação legal ou judicial
- Para prestadores de serviço essenciais (infraestrutura)
- Com seu consentimento expresso

## 5. Seus Direitos (LGPD)

Você tem direito a:

- **Acesso** - saber quais dados temos sobre você
- **Correção** - corrigir dados incorretos
- **Exclusão** - solicitar a remoção de seus dados
- **Portabilidade** - exportar seus dados
- **Revogação** - revogar consentimentos

### Importante sobre Exclusão

Registros em blockchain são **imutáveis e não podem ser excluídos**. Esta característica é essencial para a validade da prova de anterioridade. Ao solicitar exclusão, seus dados pessoais serão removidos, mas o hash registrado na blockchain permanecerá.

## 6. Retenção de Dados

- **Dados pessoais**: mantidos enquanto a conta estiver ativa
- **Arquivos**: mantidos enquanto a conta existir
- **Provas blockchain**: permanentes e imutáveis

## 7. Canal de Contato

Para exercer seus direitos ou esclarecer dúvidas:

- **E-mail**: ola@webmarcas.net
- **WhatsApp**: (11) 91112-0225

Responderemos em até 15 dias úteis.

---

*Última atualização: Janeiro de 2026*
*WebMarcas - Uma extensão da WebPatentes*'),

('blockchain_policy', '1.0', 'Política de Registro em Blockchain', '# Política de Registro em Blockchain - WebMarcas

Este documento explica tecnicamente como funciona o registro em blockchain oferecido pela WebMarcas.

## 1. O que é Hash?

Hash é uma função matemática que transforma qualquer arquivo em uma sequência fixa de caracteres (como uma "impressão digital" única).

- Utilizamos o algoritmo **SHA-256**
- O hash tem sempre 64 caracteres hexadecimais
- Qualquer alteração mínima no arquivo gera um hash completamente diferente
- É matematicamente impossível recuperar o arquivo original a partir do hash

**Exemplo de hash:**
`a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

## 2. O que é Timestamp?

Timestamp é o registro preciso de data e hora em que algo aconteceu.

No contexto blockchain, o timestamp é:

- Imutável
- Verificável por qualquer pessoa
- Não depende de nenhuma autoridade central
- Prova técnica de anterioridade

## 3. O que é OpenTimestamps?

OpenTimestamps é um protocolo aberto e gratuito para registro de timestamps na blockchain do Bitcoin.

### Características:
- **Descentralizado** - não depende de uma única empresa
- **Verificável** - qualquer pessoa pode verificar
- **Permanente** - registrado para sempre no Bitcoin
- **Agregado** - múltiplos hashes são agrupados em uma única transação

### Como funciona:
1. Seu hash é enviado aos servidores OpenTimestamps
2. O hash é agregado com milhares de outros
3. Um hash raiz é calculado (Merkle Tree)
4. Esse hash raiz é registrado no Bitcoin
5. Quando confirmado, você recebe a prova (.ots)

## 4. Blockchain Utilizada

Utilizamos a **blockchain do Bitcoin** através do protocolo OpenTimestamps.

### Por que Bitcoin?
- Blockchain mais antiga e estabelecida
- Maior segurança e descentralização
- Imutabilidade comprovada há 15+ anos
- Aceita internacionalmente

## 5. Natureza da Prova

O registro em blockchain constitui **prova técnica** de que:

- Um arquivo específico existia
- Em uma data e hora específicas
- Com um conteúdo específico (hash)

### Esta prova NÃO:
- Garante propriedade ou autoria
- Substitui registros oficiais (INPI, Biblioteca Nacional)
- Constitui direito legal automático

### Esta prova PODE:
- Demonstrar anterioridade em disputas
- Servir como elemento de prova judicial
- Comprovar existência de documentos
- Proteger sua posição em negociações

## 6. Verificação Independente

Qualquer pessoa pode verificar sua prova:

1. Acesse [opentimestamps.org](https://opentimestamps.org)
2. Faça upload do arquivo original
3. Faça upload do arquivo .ots (prova)
4. O sistema confirmará a autenticidade

Esta verificação não depende da WebMarcas.

## 7. Imutabilidade

Uma vez registrado na blockchain:

> **O registro não pode ser alterado, editado ou excluído por ninguém, incluindo a WebMarcas.**

Esta característica é fundamental para a validade da prova.

---

*Última atualização: Janeiro de 2026*
*WebMarcas - Uma extensão da WebPatentes*');