import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Star,
  Users,
  Award,
  Timer
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

const stats = [
  { value: "10.000+", label: "Marcas Registradas", icon: Shield },
  { value: "98%", label: "Taxa de Sucesso", icon: Award },
  { value: "48h", label: "Tempo de Protocolo", icon: Timer },
  { value: "15+", label: "Anos de Experiência", icon: Users },
];

const steps = [
  { number: "01", title: "Cadastre-se", description: "Crie sua conta em segundos" },
  { number: "02", title: "Faça Upload", description: "Envie seu arquivo (marca, logo, documento)" },
  { number: "03", title: "Confirme o Pagamento", description: "Pix ou Cartão, rápido e seguro" },
  { number: "04", title: "Receba seu Certificado", description: "Prova de anterioridade garantida" }
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

const testimonials = [
  {
    name: "Carla Mendes",
    role: "CEO, Doce Arte Confeitaria",
    text: "Processo super simples e rápido! Em menos de uma semana minha marca já estava protocolada. Recomendo demais!",
    rating: 5
  },
  {
    name: "Roberto Almeida",
    role: "Fundador, Tech Solutions",
    text: "Excelente atendimento e muito profissionais. O acompanhamento pelo painel do cliente é muito prático. Nota 10!",
    rating: 5
  },
  {
    name: "Juliana Costa",
    role: "Proprietária, Bella Moda",
    text: "Tinha medo do processo ser complicado, mas a equipe explicou tudo direitinho. Minha marca foi aprovada sem problemas!",
    rating: 5
  }
];

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-hero min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary px-4 py-2 rounded-full text-sm font-semibold mb-8 animate-fade-up font-body">
              <Lock className="h-4 w-4" />
              Registro em Blockchain | WebMarcas | WebPatentes
            </div>
            
            {/* Headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 animate-fade-up delay-100">
              Registre sua marca com{" "}
              <span className="text-gradient-gold">prova em Blockchain!</span>
            </h1>
            
            {/* Subheadline */}
            <p className="font-body text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-fade-up delay-200">
              Processo 100% online, registro instantâneo e certificado digital com validade jurídica. 
              Dono da marca é quem registra primeiro. <strong className="text-secondary">Proteja-se agora.</strong>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-300">
              <Button 
                size="lg" 
                asChild 
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 py-6 font-semibold shadow-glow hover:shadow-glow-lg transition-all"
              >
                <Link to="/cadastro">
                  Registrar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 font-semibold"
              >
                <Link to="/como-funciona">
                  Como Funciona
                </Link>
              </Button>
            </div>

            {/* Offer badge */}
            <Badge className="mt-6 bg-secondary/20 text-secondary border-secondary/30 animate-fade-up delay-400">
              Oferta válida por tempo limitado
            </Badge>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/10">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center animate-fade-up"
                  style={{ animationDelay: `${500 + index * 100}ms` }}
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className="h-5 w-5 text-secondary" />
                    <span className="font-display text-2xl md:text-3xl font-bold text-white">{stat.value}</span>
                  </div>
                  <span className="font-body text-sm text-white/70">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 bg-muted border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="font-body text-sm font-medium">Registro Nacional INPI</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="font-body text-sm font-medium">Protocolo em 48h</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="font-body text-sm font-medium">Garantia de Registro</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="font-body text-sm font-medium">Processo 100% Online</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Por que WebMarcas?</Badge>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Por que registrar com a <span className="text-primary">WebMarcas?</span>
            </h2>
            <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
              Uma solução do{" "}
              <a href="https://www.webpatentes.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-secondary underline font-medium">
                Grupo WebPatentes
              </a>
              . Combinamos 15 anos de expertise jurídica em propriedade intelectual com tecnologia blockchain de ponta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group card-hover border-border/50 hover:border-primary/50 bg-card"
              >
                <CardHeader>
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="font-display text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-body text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 md:py-28 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">Passo a Passo</Badge>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Como funciona o <span className="text-secondary">registro?</span>
            </h2>
            <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
              Processo simples, rápido e 100% online. Você não precisa sair de casa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary text-primary-foreground font-display text-2xl font-bold mb-6 shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="font-body text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border" />
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
            <Badge className="mb-4 bg-white/10 text-white border-white/20">Investimento</Badge>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Invista na proteção da sua <span className="text-secondary">marca</span>
            </h2>
            <p className="font-body text-white/80 text-lg max-w-2xl mx-auto">
              Preço único e transparente. Sem taxas ocultas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="font-body text-white/70">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">Depoimentos</Badge>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              O que nossos <span className="text-accent">clientes</span> dizem
            </h2>
            <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
              Milhares de marcas protegidas e clientes satisfeitos em todo o Brasil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50 card-hover">
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <CardDescription className="font-body text-foreground text-base italic">
                    "{testimonial.text}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-display text-lg font-bold text-primary">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-body font-semibold text-sm">{testimonial.name}</p>
                      <p className="font-body text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Pronto para proteger sua marca?
            </h2>
            <p className="font-body text-white/80 text-lg mb-10">
              Comece agora mesmo e tenha sua prova de anterioridade em minutos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                asChild 
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold shadow-glow"
              >
                <Link to="/cadastro">
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="border-white/30 text-white hover:bg-white/10 font-semibold"
              >
                <Link to="/servicos">
                  Ver Preços
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
