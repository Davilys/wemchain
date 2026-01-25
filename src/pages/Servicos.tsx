import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Check,
  ArrowRight,
  Shield,
  Zap,
  Crown,
  MessageCircle
} from "lucide-react";

const plans = [
  {
    name: "Básico",
    icon: Shield,
    price: "R$ 49",
    period: "por registro",
    description: "Ideal para registro único de marca ou documento",
    features: [
      "1 registro em blockchain",
      "Hash SHA-256",
      "Timestamp imutável",
      "Certificado digital PDF",
      "Verificação pública",
      "Suporte por e-mail"
    ],
    highlighted: false,
    cta: "Começar Agora",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    name: "Profissional",
    icon: Zap,
    price: "R$ 149",
    period: "pacote com 5 registros",
    description: "Para empreendedores e pequenas empresas",
    features: [
      "5 registros em blockchain",
      "Hash SHA-256",
      "Timestamp imutável",
      "Certificados digitais PDF",
      "Verificação pública",
      "Suporte prioritário",
      "Dashboard completo",
      "Economia de 40%"
    ],
    highlighted: true,
    badge: "Mais Popular",
    cta: "Escolher Plano",
    color: "text-primary",
    bg: "bg-primary/10"
  },
  {
    name: "Empresarial",
    icon: Crown,
    price: "R$ 399",
    period: "pacote com 20 registros",
    description: "Para empresas com múltiplas marcas e ativos",
    features: [
      "20 registros em blockchain",
      "Hash SHA-256",
      "Timestamp imutável",
      "Certificados digitais PDF",
      "Verificação pública",
      "Suporte VIP dedicado",
      "Dashboard avançado",
      "Relatórios personalizados",
      "API de integração",
      "Economia de 60%"
    ],
    highlighted: false,
    cta: "Falar com Especialista",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10"
  }
];

const additionalServices = [
  {
    title: "Consultoria de Marcas",
    description: "Análise de viabilidade e estratégia de proteção para sua marca",
    price: "Sob consulta"
  },
  {
    title: "Registro no INPI",
    description: "Acompanhamento completo do processo de registro no INPI",
    price: "A partir de R$ 990"
  },
  {
    title: "Monitoramento de Marca",
    description: "Vigilância contínua contra violações da sua marca",
    price: "R$ 199/mês"
  }
];

export default function Servicos() {
  const whatsappNumber = "5511911120225";
  const whatsappMessage = encodeURIComponent("Olá! Gostaria de saber mais sobre os planos da WebMarcas.");

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Planos Flexíveis</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Planos e <span className="text-primary">Preços</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para proteger seus ativos de propriedade intelectual
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative flex flex-col card-premium ${
                  plan.highlighted 
                    ? "border-primary shadow-lg shadow-primary/10 scale-105" 
                    : ""
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    {plan.badge}
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className={`h-14 w-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${plan.bg}`}>
                    <plan.icon className={`h-7 w-7 ${plan.color}`} />
                  </div>
                  <CardTitle className="text-2xl tracking-tight">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-center mb-8">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground text-sm block mt-1">{plan.period}</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <Check className={`h-5 w-5 flex-shrink-0 ${plan.highlighted ? "text-primary" : "text-green-500"}`} />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    asChild 
                    className={`w-full rounded-xl ${
                      plan.highlighted 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : ""
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    <Link to="/cadastro">
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 md:py-28 bg-card border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Serviços <span className="text-primary">Complementares</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Proteção completa para sua propriedade intelectual
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {additionalServices.map((service, index) => (
              <Card key={index} className="card-premium">
                <CardHeader>
                  <CardTitle className="text-xl tracking-tight">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{service.description}</CardDescription>
                  <p className="font-semibold text-primary">{service.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
                Perguntas Frequentes
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Posso fazer apenas um registro?",
                  a: "Sim! O plano Básico permite fazer registros individuais por R$ 49 cada. Se você precisar de mais registros, os pacotes oferecem economia significativa."
                },
                {
                  q: "Os créditos expiram?",
                  a: "Não! Seus créditos de registro nunca expiram. Use quando precisar."
                },
                {
                  q: "Quais formas de pagamento são aceitas?",
                  a: "Aceitamos Pix (desconto de 5%) e cartão de crédito (parcelamento em até 12x)."
                },
                {
                  q: "Preciso registrar no INPI também?",
                  a: "Sim. O registro em blockchain constitui prova técnica de anterioridade, mas não substitui o registro de marca junto ao INPI. Recomendamos ambos para proteção jurídica completa."
                }
              ].map((faq, index) => (
                <Card key={index} className="card-premium">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{faq.a}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
            Dúvidas? Fale conosco
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
            Nossa equipe está pronta para ajudar você a escolher a melhor opção
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-background text-foreground hover:bg-background/90 font-semibold rounded-xl">
              <Link to="/cadastro">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded-xl">
              <a 
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
