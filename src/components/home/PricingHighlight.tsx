import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Zap, Shield, Lock, Globe, FileText, Clock, Award, Infinity } from "lucide-react";

export function PricingHighlight() {
  const { language } = useLanguage();

  const getContent = () => {
    switch (language) {
      case "en":
        return {
          badge: "Best Price in the Market",
          title: "Register your creation for just",
          price: "R$49",
          decimal: ",00",
          perUnit: "per registration",
          subtitle: "One-time payment. No hidden fees. Perpetual validity.",
          cta: "Start my registration",
          mainFeatures: [
            { icon: FileText, text: "Blockchain digital certificate" },
            { icon: Infinity, text: "Perpetual validity" },
            { icon: Globe, text: "Public verification" },
            { icon: Zap, text: "Instant processing" },
          ],
          extraBenefits: [
            { icon: Shield, text: "Legal proof of prior art" },
            { icon: Lock, text: "256-bit encryption" },
            { icon: Clock, text: "24/7 availability" },
            { icon: Award, text: "Internationally accepted" },
          ],
        };
      case "es":
        return {
          badge: "Mejor Precio del Mercado",
          title: "Registre su creación por solo",
          price: "R$49",
          decimal: ",00",
          perUnit: "por registro",
          subtitle: "Pago único. Sin tarifas ocultas. Validez perpetua.",
          cta: "Comenzar mi registro",
          mainFeatures: [
            { icon: FileText, text: "Certificado digital blockchain" },
            { icon: Infinity, text: "Validez perpetua" },
            { icon: Globe, text: "Verificación pública" },
            { icon: Zap, text: "Procesamiento instantáneo" },
          ],
          extraBenefits: [
            { icon: Shield, text: "Prueba legal de anterioridad" },
            { icon: Lock, text: "Cifrado de 256 bits" },
            { icon: Clock, text: "Disponibilidad 24/7" },
            { icon: Award, text: "Aceptado internacionalmente" },
          ],
        };
      default:
        return {
          badge: "Melhor Preço do Mercado",
          title: "Registre sua criação por apenas",
          price: "R$49",
          decimal: ",00",
          perUnit: "por registro",
          subtitle: "Pagamento único. Sem taxas ocultas. Validade perpétua.",
          cta: "Começar meu registro",
          mainFeatures: [
            { icon: FileText, text: "Certificado digital blockchain" },
            { icon: Infinity, text: "Validade perpétua" },
            { icon: Globe, text: "Verificação pública" },
            { icon: Zap, text: "Processamento instantâneo" },
          ],
          extraBenefits: [
            { icon: Shield, text: "Prova legal de anterioridade" },
            { icon: Lock, text: "Criptografia 256 bits" },
            { icon: Clock, text: "Disponibilidade 24/7" },
            { icon: Award, text: "Aceito internacionalmente" },
          ],
        };
    }
  };

  const content = getContent();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6 md:mb-8 animate-pulse-glow">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">{content.badge}</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-foreground">
              {content.title}
            </h2>

            {/* Price Card */}
            <div className="inline-block bg-card border-2 border-primary/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/10 mb-8">
              <div className="flex items-start justify-center">
                <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-primary tracking-tight">
                  {content.price}
                </span>
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mt-2">
                  {content.decimal}
                </span>
              </div>
              <p className="text-muted-foreground font-medium mt-2">
                {content.perUnit}
              </p>
            </div>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              {content.subtitle}
            </p>

            {/* Main Features - Icons with text */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 max-w-3xl mx-auto">
              {content.mainFeatures.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background/50 border border-border/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground text-center">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Extra Benefits - Horizontal list */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
              {content.extraBenefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 text-sm md:text-base text-foreground"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button 
              asChild 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg md:text-xl px-10 md:px-14 py-7 md:py-8 rounded-xl shadow-lg shadow-primary/30 group"
            >
              <Link to="/cadastro">
                {content.cta}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
