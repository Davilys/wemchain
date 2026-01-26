import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Clock, 
  FileCheck, 
  Lock, 
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe,
  FileText,
  Award,
  Image,
  Video,
  Code,
  Table,
  Mail,
  Users,
  FolderOpen,
  UserPlus,
  ArrowLeftRight,
  LayoutDashboard,
  BadgeCheck,
  HelpCircle,
  MessageCircle
} from "lucide-react";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

export default function Home() {
  const whatsappNumber = "5511911120225";
  const whatsappMessage = encodeURIComponent("Olá! Gostaria de saber mais sobre o Plano Business da WebMarcas.");

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="absolute inset-0 pattern-dots" />
        
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-primary/3 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 mb-10 animate-fade-up">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">
                Plataforma de Gestão de Propriedade Intelectual
              </span>
            </div>

            {/* Main Title */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 md:mb-8 leading-[1.1] animate-fade-up delay-100 tracking-tight">
              <span className="text-foreground">Gestão de Propriedade Intelectual</span>
              <br />
              <span className="text-foreground">com Prova em </span>
              <span className="text-primary text-shadow-glow">Blockchain</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-up delay-200 px-4">
              Centralize, registre e gerencie seus registros de propriedade com{" "}
              <span className="text-foreground font-medium">segurança jurídica</span>, certificado digital e{" "}
              <span className="text-foreground font-medium">verificação pública em blockchain</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-fade-up delay-300 px-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-xl shadow-lg btn-premium group w-full sm:w-auto"
              >
                <Link to="/cadastro">
                  Assinar Plano Business
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="border-2 border-secondary bg-secondary/80 text-foreground hover:bg-secondary font-semibold text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-xl group w-full sm:w-auto"
              >
                <Link to="/como-funciona">
                  Ver como funciona
                </Link>
              </Button>
            </div>

            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary/60 border border-border/50 mb-12 animate-fade-up delay-400">
              <BadgeCheck className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">R$ 99/mês</span> com 3 créditos de registro inclusos
              </span>
            </div>

            {/* Feature Cards Row */}
            <div className="flex flex-wrap gap-4 justify-center items-center animate-fade-up delay-500 px-4 max-w-4xl mx-auto">
              {[
                { icon: FolderOpen, color: "text-blue-500", bg: "bg-blue-500/10", label: "Gestão de Projetos" },
                { icon: Lock, color: "text-purple-500", bg: "bg-purple-500/10", label: "Prova em Blockchain" },
                { icon: Award, color: "text-green-500", bg: "bg-green-500/10", label: "Certificado Digital" },
                { icon: Globe, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Verificação Pública" },
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="relative flex flex-col items-center p-5 rounded-2xl bg-card border border-border/50 min-w-[140px] group hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`absolute top-0 right-0 w-16 h-16 ${item.bg} rounded-bl-[60px] rounded-tr-2xl opacity-50`} />
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-3 relative z-10`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground relative z-10">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-card to-transparent" />
      </section>

      {/* O que é a WebMarcas */}
      <section className="py-16 md:py-24 bg-card relative border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Sobre a Plataforma</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              O que é a <span className="text-primary">WebMarcas</span>?
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              A WebMarcas é uma plataforma de <strong className="text-foreground">gestão de propriedade intelectual</strong>, 
              que permite registrar arquivos digitais em blockchain para gerar prova técnica de anterioridade, 
              organizar projetos, gerenciar clientes e controlar a titularidade de registros de forma segura e auditável.
            </p>
          </div>
        </div>
      </section>

      {/* Registros de Propriedade em Blockchain */}
      <section className="section-padding bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-bottom opacity-50" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <FileCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Tipos de Registros</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Registros de Propriedade em{" "}
              <span className="text-primary">Blockchain</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed px-4">
              Qualquer arquivo digital pode ser registrado para comprovar existência, autoria e integridade em uma data específica.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              { icon: Image, title: "Imagens", desc: "Logos, artes, plantas", color: "text-blue-500", bg: "bg-blue-500/10" },
              { icon: FileText, title: "PDFs e documentos", desc: "Contratos, projetos", color: "text-purple-500", bg: "bg-purple-500/10" },
              { icon: Mail, title: "Evidências digitais", desc: "E-mails, WhatsApp", color: "text-green-500", bg: "bg-green-500/10" },
              { icon: Video, title: "Vídeos e áudios", desc: "Gravações, podcasts", color: "text-yellow-500", bg: "bg-yellow-500/10" },
              { icon: Code, title: "Códigos-fonte", desc: "Software, scripts", color: "text-orange-500", bg: "bg-orange-500/10" },
              { icon: Table, title: "Planilhas e dados", desc: "Excel, CSV, datasets", color: "text-blue-500", bg: "bg-blue-500/10" },
            ].map((item, index) => (
              <Card key={index} className="card-premium group">
                <CardContent className="p-4 md:p-6">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${item.bg} flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`h-6 w-6 md:h-7 md:w-7 ${item.color}`} />
                  </div>
                  <h3 className="text-base md:text-lg font-bold mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Plano Business - Destaque Principal */}
      <section className="section-padding bg-primary/5 relative border-y border-primary/20">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Plano Recomendado</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Plano Business – <span className="text-primary">Gestão de Propriedade Intelectual</span>
              </h2>
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-5xl md:text-6xl font-bold text-foreground">R$ 99</span>
                <span className="text-xl text-muted-foreground">/ mês</span>
              </div>
              <p className="text-lg text-primary font-semibold mb-6">
                3 créditos de registro inclusos por mês
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-10">
              {[
                { icon: FileCheck, text: "3 créditos de registro em blockchain por mês" },
                { icon: Zap, text: "Registros adicionais por R$ 39,00 cada" },
                { icon: FolderOpen, text: "Gestão de projetos e registros de propriedade" },
                { icon: Clock, text: "Organização em linha do tempo" },
                { icon: Users, text: "Cadastro e gestão de clientes" },
                { icon: UserPlus, text: "Definição de funções para equipe" },
                { icon: ArrowLeftRight, text: "Transferência de propriedade (titularidade)" },
                { icon: LayoutDashboard, text: "Dashboard completo" },
                { icon: Award, text: "Certificados digitais em PDF" },
                { icon: Globe, text: "Verificação pública em blockchain" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm md:text-base text-foreground">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg px-10 py-7 rounded-xl shadow-lg btn-premium group"
              >
                <Link to="/cadastro">
                  Assinar Plano Business agora
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="section-padding bg-background relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Processo Simples</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Como <span className="text-primary">Funciona</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10">
            {[
              { step: "1", title: "Faça o upload", desc: "Envie seu arquivo para a plataforma", icon: FileCheck },
              { step: "2", title: "Confirme o registro", desc: "Revise os dados e confirme", icon: CheckCircle2 },
              { step: "3", title: "Prova gerada", desc: "O registro é gravado em blockchain", icon: Lock },
              { step: "4", title: "Baixe o certificado", desc: "Receba seu certificado digital PDF", icon: Award },
            ].map((item, index) => (
              <div key={index} className="relative text-center p-6 rounded-2xl bg-card border border-border/50 group hover:border-primary/30 transition-all">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm">
                  {item.step}
                </div>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 mt-2 group-hover:scale-110 transition-transform">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-muted-foreground max-w-xl mx-auto">
            Todo o processo é <strong className="text-foreground">simples, rápido e com linguagem clara</strong>, sem complexidade técnica.
          </p>
        </div>
      </section>

      {/* Segurança e Validade */}
      <section className="py-12 md:py-16 bg-card relative border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative p-6 md:p-8 rounded-2xl bg-green-500/5 border border-green-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Segurança e Validade</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    O registro em blockchain gera uma <strong className="text-foreground">prova técnica de anterioridade</strong>, 
                    com timestamp imutável e verificação pública.
                  </p>
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-yellow-600">⚠️ Importante:</strong> Este serviço não substitui o registro de marca ou patente junto ao INPI. 
                      Ele atua como prova complementar de existência e autoria.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certificado Digital */}
      <section className="section-padding bg-background relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Documentação</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">
                  Certificado <span className="text-primary">Digital</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Cada registro confirmado gera um certificado digital em PDF, contendo:
                </p>
                <ul className="space-y-3">
                  {[
                    "Hash criptográfico",
                    "Data e hora do registro",
                    "Blockchain utilizada",
                    "Dados do titular",
                    "Verificação independente"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 p-8 flex flex-col items-center justify-center">
                  <Award className="h-20 w-20 text-primary/50 mb-4" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground mb-1">Certificado de Registro</p>
                    <p className="text-sm text-muted-foreground">Blockchain • SHA-256</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Para Quem É */}
      <section className="section-padding bg-card relative border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Público-Alvo</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Para quem é a <span className="text-primary">WebMarcas</span>?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              { icon: Shield, title: "Empresas e startups", color: "text-blue-500", bg: "bg-blue-500/10" },
              { icon: Image, title: "Agências e estúdios criativos", color: "text-purple-500", bg: "bg-purple-500/10" },
              { icon: Code, title: "Desenvolvedores e equipes técnicas", color: "text-green-500", bg: "bg-green-500/10" },
              { icon: Video, title: "Criadores de conteúdo", color: "text-yellow-500", bg: "bg-yellow-500/10" },
              { icon: FileText, title: "Profissionais que precisam comprovar autoria", color: "text-orange-500", bg: "bg-orange-500/10" },
              { icon: FolderOpen, title: "Quem precisa de organização de projetos", color: "text-blue-500", bg: "bg-blue-500/10" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border/50 hover:border-primary/30 transition-all group">
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <span className="font-medium text-foreground">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Curto */}
      <section className="section-padding bg-background relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Dúvidas Frequentes</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Perguntas <span className="text-primary">Frequentes</span>
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "O que é um crédito?",
                  a: "Cada crédito corresponde a um registro de propriedade em blockchain."
                },
                {
                  q: "Os créditos acumulam?",
                  a: "Não. Os créditos do plano são renovados mensalmente."
                },
                {
                  q: "Posso comprar registros adicionais?",
                  a: "Sim. Cada registro adicional custa R$ 39,00."
                }
              ].map((faq, index) => (
                <Card key={index} className="card-premium">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section-padding bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 md:mb-8 rounded-2xl bg-primary/10 flex items-center justify-center animate-float border border-primary/20">
              <img 
                src={webmarcasLogo} 
                alt="WebMarcas" 
                className="h-10 w-10 md:h-12 md:w-12 object-contain"
              />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight">
              Proteja e organize sua propriedade intelectual{" "}
              <span className="text-primary">agora</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg mb-4 leading-relaxed px-4">
              Sem taxas ocultas. Cancele quando quiser.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-6 md:py-7 rounded-xl shadow-lg btn-premium group w-full sm:w-auto"
              >
                <Link to="/cadastro">
                  Assinar Plano Business por R$ 99,00/mês
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="border-2 border-border bg-card/50 text-foreground hover:bg-card font-semibold px-8 py-6 md:py-7 rounded-xl backdrop-blur-sm w-full sm:w-auto"
              >
                <a 
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Falar com Especialista
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
