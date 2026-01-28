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
    "home.hero.badge": "Tecnologia blockchain certificada",
    "home.hero.title1": "Registro em",
    "home.hero.title2": "Blockchain",
    "home.hero.title3": "com Prova de Anterioridade",
    "home.hero.subtitle": "Proteja suas criações com registro imutável em blockchain. Hash criptográfico único, timestamp verificável e certificado digital com validade jurídica.",
    "home.hero.cta": "Criar conta grátis",
    "home.hero.secondary": "Como funciona",
    "home.hero.feature1.title": "Blockchain Imutável",
    "home.hero.feature1.desc": "Registro permanente",
    "home.hero.feature2.title": "Certificado Digital",
    "home.hero.feature2.desc": "Validade jurídica",
    "home.hero.feature3.title": "Verificação Pública",
    "home.hero.feature3.desc": "Consulta instantânea",
    
    // Home Features
    "home.features.badge": "Por que escolher a WebMarcas?",
    "home.features.title": "Proteção",
    "home.features.titleHighlight": "Intelectual",
    "home.features.titleEnd": "de Nível Superior",
    "home.features.subtitle": "Nossa plataforma combina tecnologia de ponta com simplicidade de uso para garantir a proteção definitiva das suas criações.",
    
    // Feature Cards
    "home.features.blockchain.title": "Registro Blockchain",
    "home.features.blockchain.desc": "Cada arquivo é registrado com hash SHA-256 único na blockchain, garantindo autenticidade e imutabilidade permanente.",
    "home.features.certificate.title": "Certificado Digital",
    "home.features.certificate.desc": "Certificado com validade jurídica contendo todos os dados do registro, pronto para uso em processos legais.",
    "home.features.verification.title": "Verificação Instantânea",
    "home.features.verification.desc": "Qualquer pessoa pode verificar a autenticidade do seu registro através do hash ou código do certificado.",
    "home.features.timestamp.title": "Timestamp Certificado",
    "home.features.timestamp.desc": "Data e hora do registro comprovada por protocolo OpenTimestamps, aceito internacionalmente.",
    "home.features.legal.title": "Proteção Jurídica",
    "home.features.legal.desc": "Prova de anterioridade válida para disputas de propriedade intelectual e direitos autorais.",
    "home.features.security.title": "Segurança Máxima",
    "home.features.security.desc": "Criptografia de nível bancário e armazenamento distribuído garantem a integridade dos seus registros.",
    
    // How it Works
    "home.howItWorks.badge": "Processo Simples",
    "home.howItWorks.title": "Como",
    "home.howItWorks.titleHighlight": "Funciona",
    "home.howItWorks.subtitle": "Em apenas 3 passos, suas criações estarão protegidas com a segurança da blockchain.",
    "home.howItWorks.step1.title": "Faça o Upload",
    "home.howItWorks.step1.desc": "Envie qualquer arquivo digital que deseja proteger. Aceitamos imagens, documentos, códigos, músicas e muito mais.",
    "home.howItWorks.step2.title": "Geramos o Hash",
    "home.howItWorks.step2.desc": "Calculamos o hash SHA-256 único do seu arquivo, criando uma impressão digital criptográfica impossível de falsificar.",
    "home.howItWorks.step3.title": "Registro na Blockchain",
    "home.howItWorks.step3.desc": "O hash é registrado na blockchain com timestamp certificado. Você recebe o certificado digital imediatamente.",
    
    // CTA Section
    "home.cta.title": "Pronto para proteger",
    "home.cta.titleHighlight": "suas criações?",
    "home.cta.subtitle": "Junte-se a milhares de criadores que já protegem suas obras com a WebMarcas. Registro rápido, seguro e com validade jurídica.",
    "home.cta.button": "Começar Agora",
    "home.cta.note": "Não é necessário cartão de crédito",
    
    // Footer
    "footer.description": "Plataforma de registro em blockchain para proteção de propriedade intelectual com prova de anterioridade.",
    "footer.platform": "Plataforma",
    "footer.legal": "Jurídico",
    "footer.contact": "Contato",
    "footer.terms": "Termos de Uso",
    "footer.privacy": "Política de Privacidade",
    "footer.blockchain": "Política de Blockchain",
    "footer.copyright": "Todos os direitos reservados.",
    
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
    "verify.file.subtitle": "Arraste ou selecione o arquivo original para verificar se existe um registro na blockchain.",
    "verify.file.dragText": "Arraste seu arquivo aqui ou clique para selecionar",
    "verify.file.formats": "Aceita qualquer formato de arquivo",
    "verify.hash.title": "Verificação por Hash",
    "verify.hash.subtitle": "Cole o hash SHA-256 do arquivo para verificar se existe um registro correspondente.",
    "verify.hash.label": "Hash SHA-256",
    "verify.hash.placeholder": "Ex: a1b2c3d4e5f6...",
    "verify.button": "Verificar Registro",
    "verify.verifying": "Verificando...",
    "verify.howTo.title": "Como Verificar?",
    "verify.howTo.step1": "Envie o arquivo original ou cole o hash SHA-256",
    "verify.howTo.step2": "Nosso sistema calculará e buscará o registro na blockchain",
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
    "home.hero.badge": "Certified blockchain technology",
    "home.hero.title1": "Registration on",
    "home.hero.title2": "Blockchain",
    "home.hero.title3": "with Proof of Prior Art",
    "home.hero.subtitle": "Protect your creations with immutable blockchain registration. Unique cryptographic hash, verifiable timestamp, and digital certificate with legal validity.",
    "home.hero.cta": "Create free account",
    "home.hero.secondary": "How it works",
    "home.hero.feature1.title": "Immutable Blockchain",
    "home.hero.feature1.desc": "Permanent record",
    "home.hero.feature2.title": "Digital Certificate",
    "home.hero.feature2.desc": "Legal validity",
    "home.hero.feature3.title": "Public Verification",
    "home.hero.feature3.desc": "Instant lookup",
    
    // Home Features
    "home.features.badge": "Why choose WebMarcas?",
    "home.features.title": "Intellectual",
    "home.features.titleHighlight": "Property",
    "home.features.titleEnd": "Protection of Superior Level",
    "home.features.subtitle": "Our platform combines cutting-edge technology with ease of use to ensure the ultimate protection of your creations.",
    
    // Feature Cards
    "home.features.blockchain.title": "Blockchain Registration",
    "home.features.blockchain.desc": "Each file is registered with a unique SHA-256 hash on the blockchain, ensuring permanent authenticity and immutability.",
    "home.features.certificate.title": "Digital Certificate",
    "home.features.certificate.desc": "Certificate with legal validity containing all registration data, ready for use in legal proceedings.",
    "home.features.verification.title": "Instant Verification",
    "home.features.verification.desc": "Anyone can verify the authenticity of your registration through the hash or certificate code.",
    "home.features.timestamp.title": "Certified Timestamp",
    "home.features.timestamp.desc": "Registration date and time proven by OpenTimestamps protocol, internationally accepted.",
    "home.features.legal.title": "Legal Protection",
    "home.features.legal.desc": "Valid proof of prior art for intellectual property and copyright disputes.",
    "home.features.security.title": "Maximum Security",
    "home.features.security.desc": "Bank-level encryption and distributed storage ensure the integrity of your records.",
    
    // How it Works
    "home.howItWorks.badge": "Simple Process",
    "home.howItWorks.title": "How It",
    "home.howItWorks.titleHighlight": "Works",
    "home.howItWorks.subtitle": "In just 3 steps, your creations will be protected with blockchain security.",
    "home.howItWorks.step1.title": "Upload Your File",
    "home.howItWorks.step1.desc": "Submit any digital file you want to protect. We accept images, documents, code, music, and more.",
    "home.howItWorks.step2.title": "We Generate the Hash",
    "home.howItWorks.step2.desc": "We calculate the unique SHA-256 hash of your file, creating an unforgeable cryptographic fingerprint.",
    "home.howItWorks.step3.title": "Blockchain Registration",
    "home.howItWorks.step3.desc": "The hash is registered on the blockchain with a certified timestamp. You receive your digital certificate immediately.",
    
    // CTA Section
    "home.cta.title": "Ready to protect",
    "home.cta.titleHighlight": "your creations?",
    "home.cta.subtitle": "Join thousands of creators who already protect their works with WebMarcas. Fast, secure registration with legal validity.",
    "home.cta.button": "Get Started",
    "home.cta.note": "No credit card required",
    
    // Footer
    "footer.description": "Blockchain registration platform for intellectual property protection with proof of prior art.",
    "footer.platform": "Platform",
    "footer.legal": "Legal",
    "footer.contact": "Contact",
    "footer.terms": "Terms of Use",
    "footer.privacy": "Privacy Policy",
    "footer.blockchain": "Blockchain Policy",
    "footer.copyright": "All rights reserved.",
    
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
    "verify.file.subtitle": "Drag or select the original file to verify if there is a registration on the blockchain.",
    "verify.file.dragText": "Drag your file here or click to select",
    "verify.file.formats": "Accepts any file format",
    "verify.hash.title": "Verification by Hash",
    "verify.hash.subtitle": "Paste the SHA-256 hash of the file to verify if there is a corresponding registration.",
    "verify.hash.label": "SHA-256 Hash",
    "verify.hash.placeholder": "Ex: a1b2c3d4e5f6...",
    "verify.button": "Verify Registration",
    "verify.verifying": "Verifying...",
    "verify.howTo.title": "How to Verify?",
    "verify.howTo.step1": "Upload the original file or paste the SHA-256 hash",
    "verify.howTo.step2": "Our system will calculate and search for the registration on the blockchain",
    "verify.howTo.step3": "Receive confirmation with all registration details",
    "verify.legal.title": "Legal Protection",
    "verify.legal.subtitle": "Verification confirms that the file was registered on the blockchain on a specific date, serving as legally valid proof of prior art.",
    
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
    "home.hero.badge": "Tecnología blockchain certificada",
    "home.hero.title1": "Registro en",
    "home.hero.title2": "Blockchain",
    "home.hero.title3": "con Prueba de Anterioridad",
    "home.hero.subtitle": "Proteja sus creaciones con registro inmutable en blockchain. Hash criptográfico único, timestamp verificable y certificado digital con validez jurídica.",
    "home.hero.cta": "Crear cuenta gratis",
    "home.hero.secondary": "Cómo funciona",
    "home.hero.feature1.title": "Blockchain Inmutable",
    "home.hero.feature1.desc": "Registro permanente",
    "home.hero.feature2.title": "Certificado Digital",
    "home.hero.feature2.desc": "Validez jurídica",
    "home.hero.feature3.title": "Verificación Pública",
    "home.hero.feature3.desc": "Consulta instantánea",
    
    // Home Features
    "home.features.badge": "¿Por qué elegir WebMarcas?",
    "home.features.title": "Protección",
    "home.features.titleHighlight": "Intelectual",
    "home.features.titleEnd": "de Nivel Superior",
    "home.features.subtitle": "Nuestra plataforma combina tecnología de vanguardia con facilidad de uso para garantizar la protección definitiva de sus creaciones.",
    
    // Feature Cards
    "home.features.blockchain.title": "Registro Blockchain",
    "home.features.blockchain.desc": "Cada archivo se registra con un hash SHA-256 único en la blockchain, garantizando autenticidad e inmutabilidad permanente.",
    "home.features.certificate.title": "Certificado Digital",
    "home.features.certificate.desc": "Certificado con validez jurídica que contiene todos los datos del registro, listo para uso en procesos legales.",
    "home.features.verification.title": "Verificación Instantánea",
    "home.features.verification.desc": "Cualquier persona puede verificar la autenticidad de su registro a través del hash o código del certificado.",
    "home.features.timestamp.title": "Timestamp Certificado",
    "home.features.timestamp.desc": "Fecha y hora del registro comprobada por protocolo OpenTimestamps, aceptado internacionalmente.",
    "home.features.legal.title": "Protección Jurídica",
    "home.features.legal.desc": "Prueba de anterioridad válida para disputas de propiedad intelectual y derechos de autor.",
    "home.features.security.title": "Seguridad Máxima",
    "home.features.security.desc": "Cifrado de nivel bancario y almacenamiento distribuido garantizan la integridad de sus registros.",
    
    // How it Works
    "home.howItWorks.badge": "Proceso Simple",
    "home.howItWorks.title": "Cómo",
    "home.howItWorks.titleHighlight": "Funciona",
    "home.howItWorks.subtitle": "En solo 3 pasos, sus creaciones estarán protegidas con la seguridad de la blockchain.",
    "home.howItWorks.step1.title": "Suba su Archivo",
    "home.howItWorks.step1.desc": "Envíe cualquier archivo digital que desee proteger. Aceptamos imágenes, documentos, códigos, música y mucho más.",
    "home.howItWorks.step2.title": "Generamos el Hash",
    "home.howItWorks.step2.desc": "Calculamos el hash SHA-256 único de su archivo, creando una huella digital criptográfica imposible de falsificar.",
    "home.howItWorks.step3.title": "Registro en Blockchain",
    "home.howItWorks.step3.desc": "El hash se registra en la blockchain con timestamp certificado. Usted recibe el certificado digital inmediatamente.",
    
    // CTA Section
    "home.cta.title": "¿Listo para proteger",
    "home.cta.titleHighlight": "sus creaciones?",
    "home.cta.subtitle": "Únase a miles de creadores que ya protegen sus obras con WebMarcas. Registro rápido, seguro y con validez jurídica.",
    "home.cta.button": "Comenzar Ahora",
    "home.cta.note": "No se requiere tarjeta de crédito",
    
    // Footer
    "footer.description": "Plataforma de registro en blockchain para protección de propiedad intelectual con prueba de anterioridad.",
    "footer.platform": "Plataforma",
    "footer.legal": "Jurídico",
    "footer.contact": "Contacto",
    "footer.terms": "Términos de Uso",
    "footer.privacy": "Política de Privacidad",
    "footer.blockchain": "Política de Blockchain",
    "footer.copyright": "Todos los derechos reservados.",
    
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
    "verify.file.subtitle": "Arrastre o seleccione el archivo original para verificar si existe un registro en la blockchain.",
    "verify.file.dragText": "Arrastre su archivo aquí o haga clic para seleccionar",
    "verify.file.formats": "Acepta cualquier formato de archivo",
    "verify.hash.title": "Verificación por Hash",
    "verify.hash.subtitle": "Pegue el hash SHA-256 del archivo para verificar si existe un registro correspondiente.",
    "verify.hash.label": "Hash SHA-256",
    "verify.hash.placeholder": "Ej: a1b2c3d4e5f6...",
    "verify.button": "Verificar Registro",
    "verify.verifying": "Verificando...",
    "verify.howTo.title": "¿Cómo Verificar?",
    "verify.howTo.step1": "Suba el archivo original o pegue el hash SHA-256",
    "verify.howTo.step2": "Nuestro sistema calculará y buscará el registro en la blockchain",
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
