import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CertificatePreview } from "@/components/home/CertificatePreview";
import { RotatingText } from "@/components/home/RotatingText";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { PricingBlock } from "@/components/home/PricingBlock";
import { FAQSection } from "@/components/home/FAQSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { trackInitiateCheckout } from "@/lib/metaPixel";
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
  LayoutDashboard,
  BadgeCheck,
  HelpCircle,
  MessageCircle,
  AlertTriangle
} from "lucide-react";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

export default function Home() {
  const { t, language } = useLanguage();
  const whatsappNumber = "5511911120225";
  const whatsappMessage = encodeURIComponent(t("home.whatsapp.message"));

  return (
    <Layout>
      {/* Hero Section - High Conversion with Premium Visual */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="absolute inset-0 pattern-dots" />
        
        {/* Animated glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-primary/5 rounded-full blur-[150px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-primary/3 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/25 mb-10 animate-fade-up backdrop-blur-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">
                {language === "en" ? "Leader in Digital Registration" : language === "es" ? "Líder en Registro Digital" : "Líder em Registro Digital"}
              </span>
            </div>

            {/* Rotating Title */}
            <div className="mb-8 md:mb-10 animate-fade-up delay-100">
              <RotatingText />
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-up delay-200 px-4">
              {language === "en" 
                ? "Generate proof of prior art with digital certificate and public verification."
                : language === "es"
                ? "Genere prueba de anterioridad con certificado digital y verificación pública."
                : "Gere prova de anterioridade com certificado digital e verificação pública."}
            </p>

            {/* Transparency Warning */}
            <div className="max-w-2xl mx-auto mb-8 animate-fade-up delay-250 px-4">
              <div className="p-4 rounded-2xl bg-warning/10 border border-warning/25 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground text-left leading-relaxed">
                    {language === "en"
                      ? "This service generates blockchain proof of prior art and does not replace registration with INPI."
                      : language === "es"
                      ? "Este servicio genera prueba de anterioridad en blockchain y no sustituye el registro en el INPI."
                      : "Este serviço gera prova de anterioridade em blockchain e não substitui registro no INPI."}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-up delay-300 px-4">
              <Button 
                asChild 
                size="xl" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg md:text-xl px-10 md:px-12 py-7 md:py-8 rounded-2xl btn-premium group w-full sm:w-auto"
                style={{ boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.4)' }}
              >
                <Link to="/cadastro" onClick={() => trackInitiateCheckout()}>
                  {language === "en" 
                    ? "Start registration for R$49" 
                    : language === "es" 
                    ? "Comenzar registro por R$49" 
                    : "Começar registro por R$49"}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </Button>
            </div>

            {/* Feature Cards Row - Premium styling */}
            <div className="flex flex-wrap gap-4 justify-center items-center animate-fade-up delay-500 px-4 max-w-4xl mx-auto">
              {[
                { icon: Shield, color: "text-blue-500", bg: "bg-blue-500/12", label: t("home.hero.feature1") },
                { icon: Lock, color: "text-purple-500", bg: "bg-purple-500/12", label: t("home.hero.feature2") },
                { icon: Award, color: "text-green-500", bg: "bg-green-500/12", label: t("home.hero.feature3") },
                { icon: Globe, color: "text-yellow-500", bg: "bg-yellow-500/12", label: t("home.hero.feature4") },
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="relative flex flex-col items-center p-5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/60 min-w-[140px] group hover:-translate-y-1.5 hover:border-primary/30 transition-all duration-300"
                  style={{ boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.06)' }}
                >
                  <div className={`absolute top-0 right-0 w-16 h-16 ${item.bg} rounded-bl-[60px] rounded-tr-2xl opacity-60 transition-opacity group-hover:opacity-80`} />
                  <div className={`relative w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`h-6 w-6 ${item.color} relative z-10`} />
                  </div>
                  <span className="text-sm font-medium text-foreground relative z-10">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Pricing Block - Right after Hero */}
      <PricingBlock />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Testimonials Carousel */}
      <TestimonialsCarousel />

      {/* O que é a WebMarcas */}
      <section className="py-16 md:py-28 bg-card relative border-y border-border/20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-40" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">{t("home.about.badge")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              {t("home.about.title")} <span className="text-primary">WebMarcas</span>?
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              {t("home.about.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Registros de Propriedade em Blockchain */}
      <section className="section-padding bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-bottom opacity-60" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <FileCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">{t("home.types.badge")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              {t("home.types.title")}{" "}
              <span className="text-primary">Blockchain</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed px-4">
              {t("home.types.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              { icon: Image, title: t("home.types.images"), desc: t("home.types.images.desc"), color: "text-blue-500", bg: "bg-blue-500/12" },
              { icon: FileText, title: t("home.types.documents"), desc: t("home.types.documents.desc"), color: "text-purple-500", bg: "bg-purple-500/12" },
              { icon: Mail, title: t("home.types.evidence"), desc: t("home.types.evidence.desc"), color: "text-green-500", bg: "bg-green-500/12" },
              { icon: Video, title: t("home.types.videos"), desc: t("home.types.videos.desc"), color: "text-yellow-500", bg: "bg-yellow-500/12" },
              { icon: Code, title: t("home.types.code"), desc: t("home.types.code.desc"), color: "text-orange-500", bg: "bg-orange-500/12" },
              { icon: Table, title: t("home.types.data"), desc: t("home.types.data.desc"), color: "text-blue-500", bg: "bg-blue-500/12" },
            ].map((item, index) => (
              <Card key={index} className="card-premium group">
                <CardContent className="p-4 md:p-6">
                  <div className={`relative w-12 h-12 md:w-14 md:h-14 rounded-xl ${item.bg} flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 transition-all duration-300`}>
                    <item.icon className={`h-6 w-6 md:h-7 md:w-7 ${item.color} relative z-10`} />
                  </div>
                  <h3 className="text-base md:text-lg font-bold mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="section-padding bg-card relative border-y border-border/20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">{t("home.howItWorks.badge")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              {t("home.howItWorks.title")} <span className="text-primary">{t("home.howItWorks.titleHighlight")}</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10">
            {[
              { step: "1", title: t("home.howItWorks.step1.title"), desc: t("home.howItWorks.step1.desc"), icon: FileCheck },
              { step: "2", title: t("home.howItWorks.step2.title"), desc: t("home.howItWorks.step2.desc"), icon: CheckCircle2 },
              { step: "3", title: t("home.howItWorks.step3.title"), desc: t("home.howItWorks.step3.desc"), icon: Lock },
              { step: "4", title: t("home.howItWorks.step4.title"), desc: t("home.howItWorks.step4.desc"), icon: Award },
            ].map((item, index) => (
              <div 
                key={index} 
                className="relative text-center p-6 rounded-2xl bg-background border border-border/50 group hover:border-primary/30 transition-all duration-300"
                style={{ boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.04)' }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-lg">
                  {item.step}
                </div>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 mt-2 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t("home.howItWorks.note")}
          </p>
        </div>
      </section>

      {/* Certificado Digital */}
      <section className="section-padding bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-40" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary tracking-wide">Documentação</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">
                  Certificado <span className="text-primary">Digital</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Cada registro confirmado gera um certificado digital em PDF, contendo:
                </p>
                <ul className="space-y-4">
                  {[
                    "Hash criptográfico",
                    "Data e hora do registro",
                    "Blockchain utilizada",
                    "Dados do titular",
                    "Verificação independente"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 group">
                      <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </div>
                      <span className="text-foreground font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <CertificatePreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Para Quem É */}
      <section className="section-padding bg-card relative border-y border-border/20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">Público-Alvo</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Para quem é a <span className="text-primary">WebMarcas</span>?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto">
            {[
              { icon: Shield, title: "Empresas e startups", color: "text-blue-500", bg: "bg-blue-500/12" },
              { icon: Image, title: "Agências e estúdios criativos", color: "text-purple-500", bg: "bg-purple-500/12" },
              { icon: Code, title: "Desenvolvedores e equipes técnicas", color: "text-green-500", bg: "bg-green-500/12" },
              { icon: Video, title: "Criadores de conteúdo", color: "text-yellow-500", bg: "bg-yellow-500/12" },
              { icon: FileText, title: "Profissionais que precisam comprovar autoria", color: "text-orange-500", bg: "bg-orange-500/12" },
            ].map((item, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-all duration-300 group"
                style={{ boxShadow: '0 2px 8px -2px rgb(0 0 0 / 0.04)' }}
              >
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <span className="font-medium text-foreground">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Final */}
      <section className="section-padding bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="absolute inset-0 pattern-dots opacity-25" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        
        {/* Animated glow orbs */}
        <div className="absolute top-1/3 -left-32 w-72 h-72 bg-primary/5 rounded-full blur-[100px] animate-glow-pulse" />
        <div className="absolute bottom-1/3 -right-32 w-72 h-72 bg-primary/5 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 md:mb-8 rounded-2xl bg-primary/10 flex items-center justify-center animate-float border border-primary/25 backdrop-blur-sm">
              <img 
                src={webmarcasLogo} 
                alt="WebMarcas" 
                className="h-10 w-10 md:h-12 md:w-12 object-contain"
              />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight">
              Proteja sua propriedade intelectual{" "}
              <span className="text-primary">por R$49</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed px-4">
              Sem taxas ocultas. Processo simples e rápido.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button 
                asChild 
                size="xl" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-10 py-7 rounded-2xl btn-premium group w-full sm:w-auto"
                style={{ boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.4)' }}
              >
                <Link to="/cadastro">
                  Começar registro por R$49
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="border-2 border-border/60 bg-card/60 text-foreground hover:bg-card hover:border-primary/30 font-semibold px-8 py-7 rounded-2xl backdrop-blur-sm w-full sm:w-auto transition-all duration-300"
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
