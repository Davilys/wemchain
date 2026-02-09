import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, FileText, Globe, Infinity, Zap } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    titlePt: "Prova de anterioridade",
    titleEn: "Proof of prior art",
    titleEs: "Prueba de anterioridad",
    descPt: "Comprove a existência do seu arquivo em uma data específica",
    descEn: "Prove the existence of your file on a specific date",
    descEs: "Compruebe la existencia de su archivo en una fecha específica",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: FileText,
    titlePt: "Certificado digital em PDF",
    titleEn: "PDF digital certificate",
    titleEs: "Certificado digital en PDF",
    descPt: "Documento oficial com hash e timestamp verificável",
    descEn: "Official document with verifiable hash and timestamp",
    descEs: "Documento oficial con hash y timestamp verificable",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Globe,
    titlePt: "Verificação pública",
    titleEn: "Public verification",
    titleEs: "Verificación pública",
    descPt: "Qualquer pessoa pode verificar a autenticidade",
    descEn: "Anyone can verify the authenticity",
    descEs: "Cualquier persona puede verificar la autenticidad",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: Infinity,
    titlePt: "Validade perpétua",
    titleEn: "Perpetual validity",
    titleEs: "Validez perpetua",
    descPt: "O registro em blockchain é permanente e imutável",
    descEn: "Blockchain registration is permanent and immutable",
    descEs: "El registro en blockchain es permanente e inmutable",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Zap,
    titlePt: "Processo simples e rápido",
    titleEn: "Simple and fast process",
    titleEs: "Proceso simple y rápido",
    descPt: "Registre em minutos, sem burocracia",
    descEn: "Register in minutes, without bureaucracy",
    descEs: "Registre en minutos, sin burocracia",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
];

export function BenefitsSection() {
  const { language } = useLanguage();

  const getTitle = (benefit: typeof benefits[0]) => {
    switch (language) {
      case "en":
        return benefit.titleEn;
      case "es":
        return benefit.titleEs;
      default:
        return benefit.titlePt;
    }
  };

  const getDesc = (benefit: typeof benefits[0]) => {
    switch (language) {
      case "en":
        return benefit.descEn;
      case "es":
        return benefit.descEs;
      default:
        return benefit.descPt;
    }
  };

  const getSectionTitle = () => {
    switch (language) {
      case "en":
        return "Why register with us?";
      case "es":
        return "¿Por qué registrarse con nosotros?";
      default:
        return "Por que registrar conosco?";
    }
  };

  return (
    <section className="py-16 md:py-28 bg-card relative border-y border-border/20 overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight animate-fade-up">
            {getSectionTitle()}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-5 md:p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/40 transition-all duration-300 group animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon with glow effect */}
              <div className={`relative w-14 h-14 md:w-16 md:h-16 rounded-xl ${benefit.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300`}>
                <div className={`absolute inset-0 rounded-xl ${benefit.bg} blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
                <benefit.icon className={`h-7 w-7 md:h-8 md:w-8 ${benefit.color} relative z-10`} />
              </div>
              <h3 className="font-bold text-foreground text-sm md:text-base mb-2 group-hover:text-primary transition-colors">
                {getTitle(benefit)}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {getDesc(benefit)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
