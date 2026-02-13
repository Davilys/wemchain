import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { trackViewPlan, trackInitiateCheckout } from "@/lib/metaPixel";
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Shield, 
  Lock, 
  Globe, 
  FileText, 
  Clock, 
  Award, 
  Infinity,
  Hash,
  BadgeCheck,
  Eye,
  Sparkles
} from "lucide-react";

export function PricingBlock() {
  const { language } = useLanguage();

  const getContent = () => {
    switch (language) {
      case "en":
        return {
          badge: "Best Price in the Market",
          title: "Digital Property Registration in Blockchain",
          price: "R$49",
          decimal: ",00",
          perUnit: "one-time payment",
          subtitle: "Complete registration with perpetual validity",
          cta: "Make your 1st Free Registration",
          benefits: [
            { icon: FileText, text: "Blockchain registration" },
            { icon: Award, text: "Digital certificate in PDF" },
            { icon: Shield, text: "Legal proof of prior art" },
            { icon: Eye, text: "Public verification" },
            { icon: Infinity, text: "Perpetual validity" },
            { icon: Zap, text: "Simple and fast process" },
            { icon: Hash, text: "SHA-256 hash generation" },
            { icon: Lock, text: "256-bit encryption" },
            { icon: Clock, text: "24/7 availability" },
            { icon: Globe, text: "Internationally accepted" },
            { icon: BadgeCheck, text: "No hidden fees" },
            { icon: Sparkles, text: "Instant processing" },
          ],
        };
      case "es":
        return {
          badge: "Mejor Precio del Mercado",
          title: "Registro de Propiedad Digital en Blockchain",
          price: "R$49",
          decimal: ",00",
          perUnit: "pago único",
          subtitle: "Registro completo con validez perpetua",
          cta: "Haz tu 1er Registro Gratis",
          benefits: [
            { icon: FileText, text: "Registro en blockchain" },
            { icon: Award, text: "Certificado digital en PDF" },
            { icon: Shield, text: "Prueba legal de anterioridad" },
            { icon: Eye, text: "Verificación pública" },
            { icon: Infinity, text: "Validez perpetua" },
            { icon: Zap, text: "Proceso simple y rápido" },
            { icon: Hash, text: "Generación de hash SHA-256" },
            { icon: Lock, text: "Cifrado de 256 bits" },
            { icon: Clock, text: "Disponibilidad 24/7" },
            { icon: Globe, text: "Aceptado internacionalmente" },
            { icon: BadgeCheck, text: "Sin tarifas ocultas" },
            { icon: Sparkles, text: "Procesamiento instantáneo" },
          ],
        };
      default:
        return {
          badge: "Melhor Preço do Mercado",
          title: "Registro de Propriedade Digital em Blockchain",
          price: "R$49",
          decimal: ",00",
          perUnit: "pagamento único",
          subtitle: "Registro completo com validade perpétua",
          cta: "Faça seu 1º Registro Grátis",
          benefits: [
            { icon: FileText, text: "Registro em blockchain" },
            { icon: Award, text: "Certificado digital em PDF" },
            { icon: Shield, text: "Prova legal de anterioridade" },
            { icon: Eye, text: "Verificação pública" },
            { icon: Infinity, text: "Validade perpétua" },
            { icon: Zap, text: "Processo simples e rápido" },
            { icon: Hash, text: "Geração de hash SHA-256" },
            { icon: Lock, text: "Criptografia 256 bits" },
            { icon: Clock, text: "Disponibilidade 24/7" },
            { icon: Globe, text: "Aceito internacionalmente" },
            { icon: BadgeCheck, text: "Sem taxas ocultas" },
            { icon: Sparkles, text: "Processamento instantâneo" },
          ],
        };
    }
  };

  const content = getContent();
  const sectionRef = useRef<HTMLElement>(null);
  const hasTrackedView = useRef(false);

  // Track ViewContent when pricing section becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView.current) {
            trackViewPlan();
            hasTrackedView.current = true;
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleCTAClick = () => {
    trackInitiateCheckout();
  };

  return (
    <section ref={sectionRef} className="py-16 md:py-28 bg-gradient-to-b from-background via-primary/[0.03] to-background relative overflow-hidden">
      {/* Background decorations - more sophisticated */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-glow-pulse" />
      <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/12 border border-primary/25 mb-6 animate-pulse-glow">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary tracking-wide">{content.badge}</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {content.title}
            </h2>
          </div>

          {/* Price Card - Premium styling */}
          <div className="relative bg-card border-2 border-primary/30 rounded-3xl p-8 md:p-12 max-w-3xl mx-auto animate-fade-up delay-150 overflow-hidden"
               style={{ boxShadow: '0 25px 50px -12px hsl(var(--primary) / 0.15), 0 12px 24px -12px hsl(var(--primary) / 0.1)' }}>
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 pointer-events-none" />
            
            {/* Price Display */}
            <div className="text-center mb-10 relative">
              <div className="flex items-start justify-center mb-3">
                <span className="text-6xl sm:text-7xl md:text-8xl font-black text-primary tracking-tight drop-shadow-sm">
                  {content.price}
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-primary mt-3">
                  {content.decimal}
                </span>
              </div>
              <p className="text-muted-foreground font-semibold text-lg tracking-wide">
                {content.perUnit}
              </p>
              <p className="text-foreground/70 text-sm mt-2">
                {content.subtitle}
              </p>
            </div>

            {/* Benefits Grid - Enhanced cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-10 relative">
              {content.benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2.5 p-3.5 rounded-xl bg-background/60 border border-border/40 hover:border-primary/30 hover:bg-background/80 transition-all duration-200 group"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-foreground">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Button - Premium styling */}
            <div className="text-center relative">
              <Button 
                asChild 
                size="xl" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg md:text-xl px-12 md:px-16 py-7 md:py-8 rounded-2xl group w-full sm:w-auto"
                style={{ boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.4)' }}
              >
                <Link to="/cadastro" onClick={handleCTAClick}>
                  {content.cta}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
