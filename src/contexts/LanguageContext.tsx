import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "pt-BR" | "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  "pt-BR": {
    // Navigation
    "nav.home": "Início",
    "nav.advantages": "Vantagens",
    "nav.howItWorks": "Como Funciona",
    "nav.pricing": "Preços",
    "nav.verify": "Verificar",
    "nav.register": "Registrar",
    "nav.login": "Área do Cliente",
    "nav.dashboard": "Dashboard",
    "nav.myCredits": "Meus Créditos",
    "nav.myRecords": "Meus Registros",
    "nav.logout": "Sair",
    "nav.credits": "créditos",
    
    // Home Hero
    "home.hero.badge": "Registro de Propriedade Intelectual em Blockchain",
    "home.hero.title1": "Registro de Propriedade Intelectual",
    "home.hero.title2": "com Prova em",
    "home.hero.title3": "Blockchain",
    "home.hero.subtitle": "Registre seus arquivos digitais com prova de anterioridade, certificado digital e verificação pública em blockchain.",
    "home.hero.subtitle.highlight1": "prova de anterioridade",
    "home.hero.subtitle.highlight2": "verificação pública em blockchain",
    "home.hero.cta": "Criar Conta Grátis",
    "home.hero.secondary": "Ver como funciona",
    "home.hero.trustBadge": "com 3 créditos de registro inclusos",
    "home.hero.feature1": "Prova de Propriedade",
    "home.hero.feature2": "Prova em Blockchain",
    "home.hero.feature3": "Certificado Digital",
    "home.hero.feature4": "Verificação Pública",
    
    // Home About
    "home.about.badge": "Sobre a Plataforma",
    "home.about.title": "O que é a",
    "home.about.description": "A WebMarcas é uma plataforma de registro e comprovação de propriedade intelectual, que permite registrar arquivos digitais em blockchain para gerar prova técnica de anterioridade com emissão de certificado digital e verificação pública.",
    
    // Home Types
    "home.types.badge": "Tipos de Registros",
    "home.types.title": "Registros de Propriedade em",
    "home.types.subtitle": "Qualquer arquivo digital pode ser registrado para comprovar existência, autoria e integridade em uma data específica.",
    "home.types.images": "Imagens",
    "home.types.images.desc": "Logos, artes, plantas",
    "home.types.documents": "PDFs e documentos",
    "home.types.documents.desc": "Contratos, projetos",
    "home.types.evidence": "Evidências digitais",
    "home.types.evidence.desc": "E-mails, WhatsApp",
    "home.types.videos": "Vídeos e áudios",
    "home.types.videos.desc": "Gravações, podcasts",
    "home.types.code": "Códigos-fonte",
    "home.types.code.desc": "Software, scripts",
    "home.types.data": "Planilhas e dados",
    "home.types.data.desc": "Excel, CSV, datasets",
    
    // Home Business Plan
    "home.business.badge": "Plano Recomendado",
    "home.business.title": "Plano Business –",
    "home.business.titleHighlight": "Registro de Propriedade Intelectual",
    "home.business.price": "R$ 99",
    "home.business.period": "/ mês",
    "home.business.credits": "3 créditos de registro inclusos por mês",
    "home.business.feature1": "3 créditos de registro em blockchain por mês",
    "home.business.feature2": "Registros adicionais por R$ 39,00 cada",
    "home.business.feature3": "Registro de arquivos digitais como prova de propriedade",
    "home.business.feature4": "Certificados digitais em PDF para cada registro",
    "home.business.feature5": "Verificação pública em blockchain",
    "home.business.feature6": "Dashboard para acompanhamento dos registros",
    "home.business.feature7": "Histórico completo dos registros realizados",
    
    // Home How It Works
    "home.howItWorks.badge": "Processo Simples",
    "home.howItWorks.title": "Como",
    "home.howItWorks.titleHighlight": "Funciona",
    "home.howItWorks.step1.title": "Faça o upload",
    "home.howItWorks.step1.desc": "Envie seu arquivo para a plataforma",
    "home.howItWorks.step2.title": "Confirme o registro",
    "home.howItWorks.step2.desc": "Revise os dados e confirme",
    "home.howItWorks.step3.title": "Prova gerada",
    "home.howItWorks.step3.desc": "O registro é gravado em blockchain",
    "home.howItWorks.step4.title": "Baixe o certificado",
    "home.howItWorks.step4.desc": "Receba seu certificado digital PDF",
    "home.howItWorks.note": "Todo o processo é simples, rápido e com linguagem clara, sem complexidade técnica.",
    
    // Home Security
    "home.security.title": "Segurança e Validade",
    "home.security.description": "O registro em blockchain gera uma prova técnica de anterioridade, com timestamp imutável e verificação pública.",
    "home.security.warning": "Este serviço não substitui o registro de marca ou patente junto ao INPI. Ele atua como prova complementar de existência e autoria.",
    
    // Home Certificate
    "home.certificate.badge": "Documentação",
    "home.certificate.title": "Certificado",
    "home.certificate.titleHighlight": "Digital",
    "home.certificate.description": "Cada registro confirmado gera um certificado digital em PDF, contendo:",
    "home.certificate.item1": "Hash criptográfico",
    "home.certificate.item2": "Data e hora do registro",
    "home.certificate.item3": "Blockchain utilizada",
    "home.certificate.item4": "Dados do titular",
    "home.certificate.item5": "Verificação independente",
    
    // Home Target
    "home.target.badge": "Público-Alvo",
    "home.target.title": "Para quem é a",
    "home.target.item1": "Empresas e startups",
    "home.target.item2": "Agências e estúdios criativos",
    "home.target.item3": "Desenvolvedores e equipes técnicas",
    "home.target.item4": "Criadores de conteúdo",
    "home.target.item5": "Profissionais que precisam comprovar autoria",
    
    // Home FAQ
    "home.faq.badge": "Dúvidas Frequentes",
    "home.faq.title": "Perguntas",
    "home.faq.titleHighlight": "Frequentes",
    "home.faq.q1": "O que é um crédito?",
    "home.faq.a1": "Cada crédito corresponde a um registro de propriedade em blockchain.",
    "home.faq.q2": "Os créditos acumulam?",
    "home.faq.a2": "Não. Os créditos do plano são renovados mensalmente.",
    "home.faq.q3": "Posso comprar registros adicionais?",
    "home.faq.a3": "Sim. Cada registro adicional custa R$ 39,00.",
    
    // Home CTA
    "home.cta.title": "Proteja e organize sua propriedade intelectual",
    "home.cta.titleHighlight": "agora",
    "home.cta.subtitle": "Sem taxas ocultas. Cancele quando quiser.",
    "home.cta.button": "Criar Conta Grátis",
    "home.cta.whatsapp": "Falar com Especialista",
    
    // Home WhatsApp
    "home.whatsapp.message": "Olá! Gostaria de saber mais sobre o Plano Business da WebMarcas.",
    
    // Footer
    "footer.description": "Registro em blockchain para prova de anterioridade. Hash criptográfico + timestamp imutável para suas criações.",
    "footer.quickLinks": "Links Rápidos",
    "footer.howItWorks": "Como Funciona",
    "footer.services": "Serviços e Preços",
    "footer.advantages": "Vantagens Jurídicas",
    "footer.publicVerification": "Verificação Pública",
    "footer.verifyHash": "Verificar por Hash/TXID",
    "footer.clientArea": "Área do Cliente",
    "footer.accessAccount": "Acessar Conta",
    "footer.createAccount": "Criar Conta",
    "footer.myRecords": "Meus Registros",
    "footer.privacy": "Privacidade e Dados (LGPD)",
    "footer.contact": "Contato",
    "footer.company": "Uma empresa do grupo WebPatentes",
    "footer.disclaimer": "Funcionalidades avançadas de gestão poderão ser disponibilizadas futuramente. No momento, o plano contempla exclusivamente os recursos descritos acima.",
    "footer.copyright": "Todos os direitos reservados.",
    "footer.terms": "Termos de Uso",
    "footer.privacyPolicy": "Política de Privacidade",
    "footer.blockchainPolicy": "Política de Blockchain",
    "footer.whatsapp.message": "Olá! Gostaria de saber mais sobre os serviços da WebMarcas.",
    
    // Verify Page
    "verify.hero.badge": "Verificação Pública",
    "verify.hero.title": "Verificar",
    "verify.hero.titleHighlight": "Registro",
    "verify.hero.subtitle": "Confirme a autenticidade de qualquer registro feito na plataforma WebMarcas através do hash ou arquivo original.",
    "verify.card.title": "Verificação de Registro",
    "verify.card.subtitle": "Escolha como deseja verificar o registro",
    "verify.tab.file": "Por Arquivo",
    "verify.tab.hash": "Por Hash",
    "verify.file.title": "Verificação por Arquivo",
    "verify.file.subtitle": "Envie o arquivo original e o arquivo .ots (prova) para verificar a autenticidade.",
    "verify.file.original": "Arquivo Original",
    "verify.file.originalDesc": "O arquivo que foi registrado originalmente",
    "verify.file.dragText": "Arraste ou clique para selecionar",
    "verify.file.proof": "Arquivo de Prova (.ots)",
    "verify.file.proofDesc": "O arquivo .ots gerado no momento do registro",
    "verify.file.hash": "Hash SHA-256 do arquivo:",
    "verify.hash.title": "Verificação por Hash",
    "verify.hash.subtitle": "Cole o hash SHA-256 do arquivo para verificar se existe um registro correspondente.",
    "verify.hash.label": "Hash SHA-256",
    "verify.hash.placeholder": "Ex: a1b2c3d4e5f6789...",
    "verify.hash.helper": "O hash deve conter exatamente 64 caracteres hexadecimais",
    "verify.button": "Verificar Registro",
    "verify.verifying": "Verificando...",
    "verify.howTo.title": "Como Verificar?",
    "verify.howTo.step1": "Envie o arquivo original + arquivo .ots (prova)",
    "verify.howTo.step2": "Nosso sistema verificará a prova na blockchain",
    "verify.howTo.step3": "Receba a confirmação com todos os detalhes do registro",
    "verify.legal.title": "Blindagem Jurídica",
    "verify.legal.subtitle": "A verificação confirma que o arquivo foi registrado em blockchain em data específica, servindo como prova de anterioridade válida juridicamente.",
    
    // Verification Results
    "verify.result.found": "Registro Encontrado!",
    "verify.result.notFound": "Registro não encontrado",
    "verify.result.notFoundDesc": "Não encontramos nenhum registro na blockchain para este arquivo/hash.",
    "verify.result.recordId": "ID do Registro",
    "verify.result.assetName": "Nome do Ativo",
    "verify.result.assetType": "Tipo de Ativo",
    "verify.result.fileName": "Arquivo Original",
    "verify.result.registeredAt": "Registrado em",
    "verify.result.status": "Status",
    "verify.result.hash": "Hash SHA-256",
    "verify.result.blockchain.title": "Dados da Blockchain",
    "verify.result.blockchain.network": "Rede",
    "verify.result.blockchain.txHash": "Hash da Transação",
    "verify.result.blockchain.timestamp": "Timestamp Blockchain",
    "verify.result.blockchain.method": "Método",
    "verify.result.blockchain.confirmations": "Confirmações",
    "verify.result.newVerification": "Nova Verificação",
    
    // Common
    "common.loading": "Carregando...",
    "common.error": "Erro",
    "common.success": "Sucesso",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",
    "common.save": "Salvar",
    "common.delete": "Excluir",
    "common.edit": "Editar",
    "common.close": "Fechar",
    "common.back": "Voltar",
    "common.next": "Próximo",
    "common.previous": "Anterior",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.all": "Todos",
    "common.copy": "Copiar",
    "common.copied": "Copiado!",
    
    // Auth
    "auth.login.title": "Entrar",
    "auth.login.subtitle": "Acesse sua conta WebMarcas",
    "auth.login.email": "E-mail",
    "auth.login.password": "Senha",
    "auth.login.button": "Entrar",
    "auth.login.noAccount": "Não tem conta?",
    "auth.login.register": "Criar conta",
    "auth.register.title": "Criar Conta",
    "auth.register.subtitle": "Comece a proteger suas criações",
    "auth.register.fullName": "Nome Completo",
    "auth.register.cpfCnpj": "CPF ou CNPJ",
    "auth.register.phone": "Telefone",
    "auth.register.email": "E-mail",
    "auth.register.password": "Senha",
    "auth.register.confirmPassword": "Confirmar Senha",
    "auth.register.button": "Criar Conta",
    "auth.register.hasAccount": "Já tem conta?",
    "auth.register.login": "Entrar",
    
    // Advantages Page
    "advantages.hero.badge": "Vantagens Exclusivas",
    "advantages.hero.title": "Por que escolher a",
    "advantages.hero.titleHighlight": "WebMarcas?",
    "advantages.hero.subtitle": "Descubra como nossa plataforma oferece a proteção mais completa para suas criações digitais.",
    
    // Pricing Page
    "pricing.hero.badge": "Planos e Preços",
    "pricing.hero.title": "Escolha o plano",
    "pricing.hero.titleHighlight": "ideal para você",
    "pricing.hero.subtitle": "Opções flexíveis para proteger suas criações com a segurança da blockchain.",
    
    // How It Works Page
    "howItWorks.hero.badge": "Processo Simples",
    "howItWorks.hero.title": "Entenda como",
    "howItWorks.hero.titleHighlight": "funciona",
    "howItWorks.hero.subtitle": "Veja o passo a passo completo do registro em blockchain.",
    
    // Certificate Preview
    "certificate.title": "Certificado de Registro em Blockchain",
    "certificate.subtitle": "Prova de Anterioridade",
    "certificate.hash": "Hash SHA-256",
    "certificate.verified": "Verificado",
    "certificate.blockchain": "OpenTimestamps • Bitcoin Blockchain",
    "certificate.timestamp": "Timestamp Certificado",
  },
  "en": {
    // Navigation
    "nav.home": "Home",
    "nav.advantages": "Advantages",
    "nav.howItWorks": "How It Works",
    "nav.pricing": "Pricing",
    "nav.verify": "Verify",
    "nav.register": "Register",
    "nav.login": "Client Area",
    "nav.dashboard": "Dashboard",
    "nav.myCredits": "My Credits",
    "nav.myRecords": "My Records",
    "nav.logout": "Logout",
    "nav.credits": "credits",
    
    // Home Hero
    "home.hero.badge": "Intellectual Property Registration on Blockchain",
    "home.hero.title1": "Intellectual Property Registration",
    "home.hero.title2": "with Proof on",
    "home.hero.title3": "Blockchain",
    "home.hero.subtitle": "Register your digital files with proof of prior art, digital certificate and public blockchain verification.",
    "home.hero.subtitle.highlight1": "proof of prior art",
    "home.hero.subtitle.highlight2": "public blockchain verification",
    "home.hero.cta": "Create Free Account",
    "home.hero.secondary": "See how it works",
    "home.hero.trustBadge": "with 3 registration credits included",
    "home.hero.feature1": "Proof of Ownership",
    "home.hero.feature2": "Blockchain Proof",
    "home.hero.feature3": "Digital Certificate",
    "home.hero.feature4": "Public Verification",
    
    // Home About
    "home.about.badge": "About the Platform",
    "home.about.title": "What is",
    "home.about.description": "WebMarcas is an intellectual property registration and proof platform that allows you to register digital files on the blockchain to generate technical proof of prior art with digital certificate issuance and public verification.",
    
    // Home Types
    "home.types.badge": "Types of Registrations",
    "home.types.title": "Property Registrations on",
    "home.types.subtitle": "Any digital file can be registered to prove existence, authorship and integrity on a specific date.",
    "home.types.images": "Images",
    "home.types.images.desc": "Logos, artwork, blueprints",
    "home.types.documents": "PDFs and documents",
    "home.types.documents.desc": "Contracts, projects",
    "home.types.evidence": "Digital evidence",
    "home.types.evidence.desc": "Emails, WhatsApp",
    "home.types.videos": "Videos and audio",
    "home.types.videos.desc": "Recordings, podcasts",
    "home.types.code": "Source code",
    "home.types.code.desc": "Software, scripts",
    "home.types.data": "Spreadsheets and data",
    "home.types.data.desc": "Excel, CSV, datasets",
    
    // Home Business Plan
    "home.business.badge": "Recommended Plan",
    "home.business.title": "Business Plan –",
    "home.business.titleHighlight": "Intellectual Property Registration",
    "home.business.price": "R$ 99",
    "home.business.period": "/ month",
    "home.business.credits": "3 registration credits included per month",
    "home.business.feature1": "3 blockchain registration credits per month",
    "home.business.feature2": "Additional registrations for R$ 39.00 each",
    "home.business.feature3": "Digital file registration as proof of ownership",
    "home.business.feature4": "PDF digital certificates for each registration",
    "home.business.feature5": "Public blockchain verification",
    "home.business.feature6": "Dashboard for registration tracking",
    "home.business.feature7": "Complete history of registrations",
    
    // Home How It Works
    "home.howItWorks.badge": "Simple Process",
    "home.howItWorks.title": "How It",
    "home.howItWorks.titleHighlight": "Works",
    "home.howItWorks.step1.title": "Upload",
    "home.howItWorks.step1.desc": "Submit your file to the platform",
    "home.howItWorks.step2.title": "Confirm registration",
    "home.howItWorks.step2.desc": "Review the data and confirm",
    "home.howItWorks.step3.title": "Proof generated",
    "home.howItWorks.step3.desc": "The registration is recorded on blockchain",
    "home.howItWorks.step4.title": "Download certificate",
    "home.howItWorks.step4.desc": "Receive your PDF digital certificate",
    "home.howItWorks.note": "The entire process is simple, fast and in plain language, without technical complexity.",
    
    // Home Security
    "home.security.title": "Security and Validity",
    "home.security.description": "Blockchain registration generates technical proof of prior art, with immutable timestamp and public verification.",
    "home.security.warning": "This service does not replace trademark or patent registration with INPI. It acts as complementary proof of existence and authorship.",
    
    // Home Certificate
    "home.certificate.badge": "Documentation",
    "home.certificate.title": "Digital",
    "home.certificate.titleHighlight": "Certificate",
    "home.certificate.description": "Each confirmed registration generates a PDF digital certificate containing:",
    "home.certificate.item1": "Cryptographic hash",
    "home.certificate.item2": "Registration date and time",
    "home.certificate.item3": "Blockchain used",
    "home.certificate.item4": "Holder data",
    "home.certificate.item5": "Independent verification",
    
    // Home Target
    "home.target.badge": "Target Audience",
    "home.target.title": "Who is",
    "home.target.item1": "Companies and startups",
    "home.target.item2": "Creative agencies and studios",
    "home.target.item3": "Developers and technical teams",
    "home.target.item4": "Content creators",
    "home.target.item5": "Professionals who need to prove authorship",
    
    // Home FAQ
    "home.faq.badge": "Frequently Asked Questions",
    "home.faq.title": "Frequently Asked",
    "home.faq.titleHighlight": "Questions",
    "home.faq.q1": "What is a credit?",
    "home.faq.a1": "Each credit corresponds to a property registration on blockchain.",
    "home.faq.q2": "Do credits accumulate?",
    "home.faq.a2": "No. Plan credits are renewed monthly.",
    "home.faq.q3": "Can I purchase additional registrations?",
    "home.faq.a3": "Yes. Each additional registration costs R$ 39.00.",
    
    // Home CTA
    "home.cta.title": "Protect and organize your intellectual property",
    "home.cta.titleHighlight": "now",
    "home.cta.subtitle": "No hidden fees. Cancel anytime.",
    "home.cta.button": "Create Free Account",
    "home.cta.whatsapp": "Talk to a Specialist",
    
    // Home WhatsApp
    "home.whatsapp.message": "Hello! I would like to know more about the WebMarcas Business Plan.",
    
    // Footer
    "footer.description": "Blockchain registration for proof of prior art. Cryptographic hash + immutable timestamp for your creations.",
    "footer.quickLinks": "Quick Links",
    "footer.howItWorks": "How It Works",
    "footer.services": "Services and Pricing",
    "footer.advantages": "Legal Advantages",
    "footer.publicVerification": "Public Verification",
    "footer.verifyHash": "Verify by Hash/TXID",
    "footer.clientArea": "Client Area",
    "footer.accessAccount": "Access Account",
    "footer.createAccount": "Create Account",
    "footer.myRecords": "My Records",
    "footer.privacy": "Privacy and Data (LGPD)",
    "footer.contact": "Contact",
    "footer.company": "A WebPatentes group company",
    "footer.disclaimer": "Advanced management features may be made available in the future. Currently, the plan includes only the features described above.",
    "footer.copyright": "All rights reserved.",
    "footer.terms": "Terms of Use",
    "footer.privacyPolicy": "Privacy Policy",
    "footer.blockchainPolicy": "Blockchain Policy",
    "footer.whatsapp.message": "Hello! I would like to know more about WebMarcas services.",
    
    // Verify Page
    "verify.hero.badge": "Public Verification",
    "verify.hero.title": "Verify",
    "verify.hero.titleHighlight": "Registration",
    "verify.hero.subtitle": "Confirm the authenticity of any registration made on the WebMarcas platform through the hash or original file.",
    "verify.card.title": "Registration Verification",
    "verify.card.subtitle": "Choose how you want to verify the registration",
    "verify.tab.file": "By File",
    "verify.tab.hash": "By Hash",
    "verify.file.title": "Verification by File",
    "verify.file.subtitle": "Upload the original file and the .ots file (proof) to verify authenticity.",
    "verify.file.original": "Original File",
    "verify.file.originalDesc": "The file that was originally registered",
    "verify.file.dragText": "Drag or click to select",
    "verify.file.proof": "Proof File (.ots)",
    "verify.file.proofDesc": "The .ots file generated at registration",
    "verify.file.hash": "SHA-256 hash of file:",
    "verify.hash.title": "Verification by Hash",
    "verify.hash.subtitle": "Paste the SHA-256 hash of the file to verify if there is a corresponding registration.",
    "verify.hash.label": "SHA-256 Hash",
    "verify.hash.placeholder": "Ex: a1b2c3d4e5f6789...",
    "verify.hash.helper": "The hash must contain exactly 64 hexadecimal characters",
    "verify.button": "Verify Registration",
    "verify.verifying": "Verifying...",
    "verify.howTo.title": "How to Verify?",
    "verify.howTo.step1": "Upload the original file + .ots file (proof)",
    "verify.howTo.step2": "Our system will verify the proof on the blockchain",
    "verify.howTo.step3": "Receive confirmation with all registration details",
    "verify.legal.title": "Legal Protection",
    "verify.legal.subtitle": "Verification confirms that the file was registered on blockchain on a specific date, serving as legally valid proof of prior art.",
    
    // Verification Results
    "verify.result.found": "Registration Found!",
    "verify.result.notFound": "Registration not found",
    "verify.result.notFoundDesc": "We did not find any registration on the blockchain for this file/hash.",
    "verify.result.recordId": "Registration ID",
    "verify.result.assetName": "Asset Name",
    "verify.result.assetType": "Asset Type",
    "verify.result.fileName": "Original File",
    "verify.result.registeredAt": "Registered on",
    "verify.result.status": "Status",
    "verify.result.hash": "SHA-256 Hash",
    "verify.result.blockchain.title": "Blockchain Data",
    "verify.result.blockchain.network": "Network",
    "verify.result.blockchain.txHash": "Transaction Hash",
    "verify.result.blockchain.timestamp": "Blockchain Timestamp",
    "verify.result.blockchain.method": "Method",
    "verify.result.blockchain.confirmations": "Confirmations",
    "verify.result.newVerification": "New Verification",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.close": "Close",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.all": "All",
    "common.copy": "Copy",
    "common.copied": "Copied!",
    
    // Auth
    "auth.login.title": "Login",
    "auth.login.subtitle": "Access your WebMarcas account",
    "auth.login.email": "Email",
    "auth.login.password": "Password",
    "auth.login.button": "Login",
    "auth.login.noAccount": "Don't have an account?",
    "auth.login.register": "Create account",
    "auth.register.title": "Create Account",
    "auth.register.subtitle": "Start protecting your creations",
    "auth.register.fullName": "Full Name",
    "auth.register.cpfCnpj": "ID Number",
    "auth.register.phone": "Phone",
    "auth.register.email": "Email",
    "auth.register.password": "Password",
    "auth.register.confirmPassword": "Confirm Password",
    "auth.register.button": "Create Account",
    "auth.register.hasAccount": "Already have an account?",
    "auth.register.login": "Login",
    
    // Advantages Page
    "advantages.hero.badge": "Exclusive Advantages",
    "advantages.hero.title": "Why choose",
    "advantages.hero.titleHighlight": "WebMarcas?",
    "advantages.hero.subtitle": "Discover how our platform offers the most complete protection for your digital creations.",
    
    // Pricing Page
    "pricing.hero.badge": "Plans and Pricing",
    "pricing.hero.title": "Choose the plan",
    "pricing.hero.titleHighlight": "that's right for you",
    "pricing.hero.subtitle": "Flexible options to protect your creations with blockchain security.",
    
    // How It Works Page
    "howItWorks.hero.badge": "Simple Process",
    "howItWorks.hero.title": "Understand how",
    "howItWorks.hero.titleHighlight": "it works",
    "howItWorks.hero.subtitle": "See the complete step-by-step of blockchain registration.",
    
    // Certificate Preview
    "certificate.title": "Blockchain Registration Certificate",
    "certificate.subtitle": "Proof of Prior Art",
    "certificate.hash": "SHA-256 Hash",
    "certificate.verified": "Verified",
    "certificate.blockchain": "OpenTimestamps • Bitcoin Blockchain",
    "certificate.timestamp": "Certified Timestamp",
  },
  "es": {
    // Navigation
    "nav.home": "Inicio",
    "nav.advantages": "Ventajas",
    "nav.howItWorks": "Cómo Funciona",
    "nav.pricing": "Precios",
    "nav.verify": "Verificar",
    "nav.register": "Registrar",
    "nav.login": "Área del Cliente",
    "nav.dashboard": "Dashboard",
    "nav.myCredits": "Mis Créditos",
    "nav.myRecords": "Mis Registros",
    "nav.logout": "Salir",
    "nav.credits": "créditos",
    
    // Home Hero
    "home.hero.badge": "Registro de Propiedad Intelectual en Blockchain",
    "home.hero.title1": "Registro de Propiedad Intelectual",
    "home.hero.title2": "con Prueba en",
    "home.hero.title3": "Blockchain",
    "home.hero.subtitle": "Registre sus archivos digitales con prueba de anterioridad, certificado digital y verificación pública en blockchain.",
    "home.hero.subtitle.highlight1": "prueba de anterioridad",
    "home.hero.subtitle.highlight2": "verificación pública en blockchain",
    "home.hero.cta": "Crear Cuenta Gratis",
    "home.hero.secondary": "Ver cómo funciona",
    "home.hero.trustBadge": "con 3 créditos de registro incluidos",
    "home.hero.feature1": "Prueba de Propiedad",
    "home.hero.feature2": "Prueba en Blockchain",
    "home.hero.feature3": "Certificado Digital",
    "home.hero.feature4": "Verificación Pública",
    
    // Home About
    "home.about.badge": "Sobre la Plataforma",
    "home.about.title": "¿Qué es",
    "home.about.description": "WebMarcas es una plataforma de registro y comprobación de propiedad intelectual, que permite registrar archivos digitales en blockchain para generar prueba técnica de anterioridad con emisión de certificado digital y verificación pública.",
    
    // Home Types
    "home.types.badge": "Tipos de Registros",
    "home.types.title": "Registros de Propiedad en",
    "home.types.subtitle": "Cualquier archivo digital puede ser registrado para comprobar existencia, autoría e integridad en una fecha específica.",
    "home.types.images": "Imágenes",
    "home.types.images.desc": "Logos, artes, planos",
    "home.types.documents": "PDFs y documentos",
    "home.types.documents.desc": "Contratos, proyectos",
    "home.types.evidence": "Evidencias digitales",
    "home.types.evidence.desc": "E-mails, WhatsApp",
    "home.types.videos": "Videos y audios",
    "home.types.videos.desc": "Grabaciones, podcasts",
    "home.types.code": "Códigos fuente",
    "home.types.code.desc": "Software, scripts",
    "home.types.data": "Hojas de cálculo y datos",
    "home.types.data.desc": "Excel, CSV, datasets",
    
    // Home Business Plan
    "home.business.badge": "Plan Recomendado",
    "home.business.title": "Plan Business –",
    "home.business.titleHighlight": "Registro de Propiedad Intelectual",
    "home.business.price": "R$ 99",
    "home.business.period": "/ mes",
    "home.business.credits": "3 créditos de registro incluidos por mes",
    "home.business.feature1": "3 créditos de registro en blockchain por mes",
    "home.business.feature2": "Registros adicionales por R$ 39,00 cada uno",
    "home.business.feature3": "Registro de archivos digitales como prueba de propiedad",
    "home.business.feature4": "Certificados digitales en PDF para cada registro",
    "home.business.feature5": "Verificación pública en blockchain",
    "home.business.feature6": "Dashboard para seguimiento de registros",
    "home.business.feature7": "Historial completo de registros realizados",
    
    // Home How It Works
    "home.howItWorks.badge": "Proceso Simple",
    "home.howItWorks.title": "Cómo",
    "home.howItWorks.titleHighlight": "Funciona",
    "home.howItWorks.step1.title": "Suba el archivo",
    "home.howItWorks.step1.desc": "Envíe su archivo a la plataforma",
    "home.howItWorks.step2.title": "Confirme el registro",
    "home.howItWorks.step2.desc": "Revise los datos y confirme",
    "home.howItWorks.step3.title": "Prueba generada",
    "home.howItWorks.step3.desc": "El registro se graba en blockchain",
    "home.howItWorks.step4.title": "Descargue el certificado",
    "home.howItWorks.step4.desc": "Reciba su certificado digital PDF",
    "home.howItWorks.note": "Todo el proceso es simple, rápido y con lenguaje claro, sin complejidad técnica.",
    
    // Home Security
    "home.security.title": "Seguridad y Validez",
    "home.security.description": "El registro en blockchain genera una prueba técnica de anterioridad, con timestamp inmutable y verificación pública.",
    "home.security.warning": "Este servicio no sustituye el registro de marca o patente ante el INPI. Actúa como prueba complementaria de existencia y autoría.",
    
    // Home Certificate
    "home.certificate.badge": "Documentación",
    "home.certificate.title": "Certificado",
    "home.certificate.titleHighlight": "Digital",
    "home.certificate.description": "Cada registro confirmado genera un certificado digital en PDF, que contiene:",
    "home.certificate.item1": "Hash criptográfico",
    "home.certificate.item2": "Fecha y hora del registro",
    "home.certificate.item3": "Blockchain utilizada",
    "home.certificate.item4": "Datos del titular",
    "home.certificate.item5": "Verificación independiente",
    
    // Home Target
    "home.target.badge": "Público Objetivo",
    "home.target.title": "¿Para quién es",
    "home.target.item1": "Empresas y startups",
    "home.target.item2": "Agencias y estudios creativos",
    "home.target.item3": "Desarrolladores y equipos técnicos",
    "home.target.item4": "Creadores de contenido",
    "home.target.item5": "Profesionales que necesitan comprobar autoría",
    
    // Home FAQ
    "home.faq.badge": "Preguntas Frecuentes",
    "home.faq.title": "Preguntas",
    "home.faq.titleHighlight": "Frecuentes",
    "home.faq.q1": "¿Qué es un crédito?",
    "home.faq.a1": "Cada crédito corresponde a un registro de propiedad en blockchain.",
    "home.faq.q2": "¿Los créditos se acumulan?",
    "home.faq.a2": "No. Los créditos del plan se renuevan mensualmente.",
    "home.faq.q3": "¿Puedo comprar registros adicionales?",
    "home.faq.a3": "Sí. Cada registro adicional cuesta R$ 39,00.",
    
    // Home CTA
    "home.cta.title": "Proteja y organice su propiedad intelectual",
    "home.cta.titleHighlight": "ahora",
    "home.cta.subtitle": "Sin tarifas ocultas. Cancele cuando quiera.",
    "home.cta.button": "Crear Cuenta Gratis",
    "home.cta.whatsapp": "Hablar con Especialista",
    
    // Home WhatsApp
    "home.whatsapp.message": "¡Hola! Me gustaría saber más sobre el Plan Business de WebMarcas.",
    
    // Footer
    "footer.description": "Registro en blockchain para prueba de anterioridad. Hash criptográfico + timestamp inmutable para sus creaciones.",
    "footer.quickLinks": "Enlaces Rápidos",
    "footer.howItWorks": "Cómo Funciona",
    "footer.services": "Servicios y Precios",
    "footer.advantages": "Ventajas Jurídicas",
    "footer.publicVerification": "Verificación Pública",
    "footer.verifyHash": "Verificar por Hash/TXID",
    "footer.clientArea": "Área del Cliente",
    "footer.accessAccount": "Acceder Cuenta",
    "footer.createAccount": "Crear Cuenta",
    "footer.myRecords": "Mis Registros",
    "footer.privacy": "Privacidad y Datos (LGPD)",
    "footer.contact": "Contacto",
    "footer.company": "Una empresa del grupo WebPatentes",
    "footer.disclaimer": "Funcionalidades avanzadas de gestión podrán estar disponibles en el futuro. Actualmente, el plan incluye exclusivamente los recursos descritos anteriormente.",
    "footer.copyright": "Todos los derechos reservados.",
    "footer.terms": "Términos de Uso",
    "footer.privacyPolicy": "Política de Privacidad",
    "footer.blockchainPolicy": "Política de Blockchain",
    "footer.whatsapp.message": "¡Hola! Me gustaría saber más sobre los servicios de WebMarcas.",
    
    // Verify Page
    "verify.hero.badge": "Verificación Pública",
    "verify.hero.title": "Verificar",
    "verify.hero.titleHighlight": "Registro",
    "verify.hero.subtitle": "Confirme la autenticidad de cualquier registro realizado en la plataforma WebMarcas a través del hash o archivo original.",
    "verify.card.title": "Verificación de Registro",
    "verify.card.subtitle": "Elija cómo desea verificar el registro",
    "verify.tab.file": "Por Archivo",
    "verify.tab.hash": "Por Hash",
    "verify.file.title": "Verificación por Archivo",
    "verify.file.subtitle": "Suba el archivo original y el archivo .ots (prueba) para verificar la autenticidad.",
    "verify.file.original": "Archivo Original",
    "verify.file.originalDesc": "El archivo que fue registrado originalmente",
    "verify.file.dragText": "Arrastre o haga clic para seleccionar",
    "verify.file.proof": "Archivo de Prueba (.ots)",
    "verify.file.proofDesc": "El archivo .ots generado en el momento del registro",
    "verify.file.hash": "Hash SHA-256 del archivo:",
    "verify.hash.title": "Verificación por Hash",
    "verify.hash.subtitle": "Pegue el hash SHA-256 del archivo para verificar si existe un registro correspondiente.",
    "verify.hash.label": "Hash SHA-256",
    "verify.hash.placeholder": "Ej: a1b2c3d4e5f6789...",
    "verify.hash.helper": "El hash debe contener exactamente 64 caracteres hexadecimales",
    "verify.button": "Verificar Registro",
    "verify.verifying": "Verificando...",
    "verify.howTo.title": "¿Cómo Verificar?",
    "verify.howTo.step1": "Suba el archivo original + archivo .ots (prueba)",
    "verify.howTo.step2": "Nuestro sistema verificará la prueba en la blockchain",
    "verify.howTo.step3": "Reciba la confirmación con todos los detalles del registro",
    "verify.legal.title": "Blindaje Jurídico",
    "verify.legal.subtitle": "La verificación confirma que el archivo fue registrado en blockchain en una fecha específica, sirviendo como prueba de anterioridad válida jurídicamente.",
    
    // Verification Results
    "verify.result.found": "¡Registro Encontrado!",
    "verify.result.notFound": "Registro no encontrado",
    "verify.result.notFoundDesc": "No encontramos ningún registro en la blockchain para este archivo/hash.",
    "verify.result.recordId": "ID del Registro",
    "verify.result.assetName": "Nombre del Activo",
    "verify.result.assetType": "Tipo de Activo",
    "verify.result.fileName": "Archivo Original",
    "verify.result.registeredAt": "Registrado en",
    "verify.result.status": "Estado",
    "verify.result.hash": "Hash SHA-256",
    "verify.result.blockchain.title": "Datos de Blockchain",
    "verify.result.blockchain.network": "Red",
    "verify.result.blockchain.txHash": "Hash de Transacción",
    "verify.result.blockchain.timestamp": "Timestamp Blockchain",
    "verify.result.blockchain.method": "Método",
    "verify.result.blockchain.confirmations": "Confirmaciones",
    "verify.result.newVerification": "Nueva Verificación",
    
    // Common
    "common.loading": "Cargando...",
    "common.error": "Error",
    "common.success": "Éxito",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",
    "common.save": "Guardar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.close": "Cerrar",
    "common.back": "Volver",
    "common.next": "Siguiente",
    "common.previous": "Anterior",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.all": "Todos",
    "common.copy": "Copiar",
    "common.copied": "¡Copiado!",
    
    // Auth
    "auth.login.title": "Iniciar Sesión",
    "auth.login.subtitle": "Acceda a su cuenta WebMarcas",
    "auth.login.email": "Correo electrónico",
    "auth.login.password": "Contraseña",
    "auth.login.button": "Iniciar Sesión",
    "auth.login.noAccount": "¿No tiene cuenta?",
    "auth.login.register": "Crear cuenta",
    "auth.register.title": "Crear Cuenta",
    "auth.register.subtitle": "Comience a proteger sus creaciones",
    "auth.register.fullName": "Nombre Completo",
    "auth.register.cpfCnpj": "Número de Documento",
    "auth.register.phone": "Teléfono",
    "auth.register.email": "Correo electrónico",
    "auth.register.password": "Contraseña",
    "auth.register.confirmPassword": "Confirmar Contraseña",
    "auth.register.button": "Crear Cuenta",
    "auth.register.hasAccount": "¿Ya tiene cuenta?",
    "auth.register.login": "Iniciar Sesión",
    
    // Advantages Page
    "advantages.hero.badge": "Ventajas Exclusivas",
    "advantages.hero.title": "¿Por qué elegir",
    "advantages.hero.titleHighlight": "WebMarcas?",
    "advantages.hero.subtitle": "Descubra cómo nuestra plataforma ofrece la protección más completa para sus creaciones digitales.",
    
    // Pricing Page
    "pricing.hero.badge": "Planes y Precios",
    "pricing.hero.title": "Elija el plan",
    "pricing.hero.titleHighlight": "ideal para usted",
    "pricing.hero.subtitle": "Opciones flexibles para proteger sus creaciones con la seguridad de la blockchain.",
    
    // How It Works Page
    "howItWorks.hero.badge": "Proceso Simple",
    "howItWorks.hero.title": "Entienda cómo",
    "howItWorks.hero.titleHighlight": "funciona",
    "howItWorks.hero.subtitle": "Vea el paso a paso completo del registro en blockchain.",
    
    // Certificate Preview
    "certificate.title": "Certificado de Registro en Blockchain",
    "certificate.subtitle": "Prueba de Anterioridad",
    "certificate.hash": "Hash SHA-256",
    "certificate.verified": "Verificado",
    "certificate.blockchain": "OpenTimestamps • Bitcoin Blockchain",
    "certificate.timestamp": "Timestamp Certificado",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "pt-BR";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
