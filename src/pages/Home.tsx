import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Lock, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Fingerprint,
  Scale,
  Globe,
  MessageCircle
} from "lucide-react";

const features = [
  {
    icon: Fingerprint,
    title: "Hash Criptográfico",
    description: "Seu arquivo é convertido em uma assinatura digital única e irreversível usando SHA-256."
  },
  {
    icon: Lock,
    title: "Registro em Blockchain",
    description: "O hash é registrado na blockchain Polygon, criando uma prova imutável e permanente."
  },
  {
    icon: Clock,
    title: "Timestamp Oficial",
    description: "Data e hora do registro são gravados para comprovar anterioridade."
  },
  {
    icon: FileCheck,
    title: "Certificado Digital",
    description: "Receba um certificado profissional com todos os dados do registro."
  }
];

const benefits = [
  {
    icon: Scale,
    title: "Validade Jurídica",
    description: "Prova complementar reconhecida em processos judiciais de propriedade intelectual."
  },
  {
    icon: Shield,
    title: "Proteção Imediata",
    description: "Seu registro é feito em minutos, sem burocracia ou espera."
  },
  {
    icon: Globe,
    title: "Alcance Global",
    description: "A blockchain é pública e verificável de qualquer lugar do mundo."
  }
];

const steps = [
  { number: "01", title: "Cadastre-se", description: "Crie sua conta em segundos" },
  { number: "02", title: "Faça Upload", description: "Envie seu arquivo (marca, logo, documento)" },
  { number: "03", title: "Confirme o Pagamento", description: "Pix ou Cartão, rápido e seguro" },
  { number: "04", title: "Receba seu Certificado", description: "Prova de anterioridade garantida" }
];

export default function Home() {
  const whatsappNumber = "5511999999999";
  const whatsappMessage = encodeURIComponent("Olá! Gostaria de saber mais sobre o registro de marcas em blockchain.");

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-hero min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-up">
              <Lock className="h-4 w-4" />
              Tecnologia Blockchain para Proteção de Marcas
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Proteja sua Marca com{" "}
              <span className="text-gradient-gold">Prova Imutável</span>{" "}
              em Blockchain
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Registro instantâneo com hash criptográfico, timestamp verificável e certificado digital. 
              Sua marca protegida com a segurança da tecnologia blockchain.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button size="lg" asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 py-6 animate-pulse-glow">
                <Link to="/cadastro">
                  Registrar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8 py-6">
                <Link to="/como-funciona">
                  Como Funciona
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-primary-foreground/60 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-secondary" />
                <span className="text-sm">Registro em minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-secondary" />
                <span className="text-sm">Blockchain pública</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-secondary" />
                <span className="text-sm">Certificado verificável</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Como Protegemos sua <span className="text-secondary">Propriedade Intelectual</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tecnologia de ponta para garantir a autenticidade e anterioridade dos seus ativos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-secondary/50">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="font-display text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              4 Passos Simples
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Do upload ao certificado em poucos minutos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-display text-2xl font-bold mb-4">
                    {step.number}
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Por que escolher a <span className="text-secondary">WebMarcas</span>?
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Combinamos expertise jurídica com tecnologia de ponta
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10">
                <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-primary-foreground/70">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Pronto para proteger sua marca?
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Comece agora mesmo e tenha sua prova de anterioridade em minutos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Link to="/cadastro">
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a 
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Falar no WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
