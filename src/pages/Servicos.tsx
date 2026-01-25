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
    cta: "Começar Agora"
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
    cta: "Escolher Plano"
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
    cta: "Falar com Especialista"
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
  const whatsappNumber = "5511999999999";
  const whatsappMessage = encodeURIComponent("Olá! Gostaria de saber mais sobre os planos da WebMarcas.");

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Planos e <span className="text-secondary">Preços</span>
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Escolha o plano ideal para proteger seus ativos de propriedade intelectual
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative flex flex-col ${
                  plan.highlighted 
                    ? "border-secondary shadow-lg shadow-secondary/20 scale-105" 
                    : "border-border/50"
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground">
                    {plan.badge}
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className={`h-14 w-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                    plan.highlighted ? "bg-secondary/20" : "bg-primary/10"
                  }`}>
                    <plan.icon className={`h-7 w-7 ${plan.highlighted ? "text-secondary" : "text-primary"}`} />
                  </div>
                  <CardTitle className="font-display text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-center mb-8">
                    <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground text-sm block mt-1">{plan.period}</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <Check className={`h-5 w-5 flex-shrink-0 ${plan.highlighted ? "text-secondary" : "text-success"}`} />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    asChild 
                    className={`w-full ${
                      plan.highlighted 
                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" 
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
      <section className="py-20 md:py-28 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Serviços <span className="text-secondary">Complementares</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Proteção completa para sua propriedade intelectual
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {additionalServices.map((service, index) => (
              <Card key={index} className="border-border/50">
                <CardHeader>
                  <CardTitle className="font-display text-xl">{service.title}</CardTitle>
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
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Perguntas Frequentes
              </h2>
            </div>

            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Posso fazer apenas um registro?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Sim! O plano Básico permite fazer registros individuais por R$ 49 cada. 
                    Se você precisar de mais registros, os pacotes oferecem economia significativa.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Os créditos expiram?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Não! Seus créditos de registro nunca expiram. Use quando precisar.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Quais formas de pagamento são aceitas?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Aceitamos Pix (desconto de 5%) e cartão de crédito (parcelamento em até 12x).
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Preciso registrar no INPI também?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    O registro em blockchain serve como prova de anterioridade e é complementar 
                    ao registro no INPI. Recomendamos ambos para proteção completa.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Dúvidas? Fale conosco
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
            Nossa equipe está pronta para ajudar você a escolher a melhor opção
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Link to="/cadastro">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
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
