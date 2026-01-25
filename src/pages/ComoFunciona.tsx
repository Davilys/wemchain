import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Upload,
  Hash,
  Link2,
  FileText,
  CheckCircle2,
  ArrowRight,
  Shield,
  Lock,
  Clock,
  Eye
} from "lucide-react";

const processSteps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload do Arquivo",
    description: "Você envia seu arquivo (marca, logotipo, documento, obra autoral) através da nossa plataforma segura.",
    details: [
      "Formatos aceitos: PDF, PNG, JPG, JPEG, SVG",
      "Tamanho máximo: 10MB por arquivo",
      "O arquivo fica armazenado de forma privada"
    ]
  },
  {
    icon: Hash,
    number: "02",
    title: "Geração do Hash SHA-256",
    description: "Nosso sistema gera uma assinatura digital única do seu arquivo usando criptografia SHA-256.",
    details: [
      "O hash é uma 'impressão digital' única",
      "Qualquer alteração no arquivo gera um hash diferente",
      "O arquivo original nunca é exposto publicamente"
    ]
  },
  {
    icon: Link2,
    number: "03",
    title: "Registro na Blockchain",
    description: "O hash é registrado permanentemente na blockchain Polygon com timestamp exato.",
    details: [
      "Transação pública e verificável",
      "Data e hora registradas de forma imutável",
      "Custo mínimo de transação (frações de centavo)"
    ]
  },
  {
    icon: FileText,
    number: "04",
    title: "Certificado Digital",
    description: "Você recebe um certificado profissional contendo todos os dados do registro.",
    details: [
      "Hash do arquivo",
      "ID da transação (TXID)",
      "Link para verificação pública",
      "QR Code para validação"
    ]
  }
];

const techDetails = [
  {
    icon: Shield,
    title: "SHA-256",
    description: "Algoritmo de hash criptográfico usado por bancos e governos mundialmente. Virtualmente impossível de falsificar."
  },
  {
    icon: Lock,
    title: "Blockchain Polygon",
    description: "Rede blockchain de alta performance, econômica e ambientalmente sustentável. Compatível com Ethereum."
  },
  {
    icon: Clock,
    title: "Timestamp Imutável",
    description: "A data e hora do registro são gravadas permanentemente, servindo como prova de anterioridade."
  },
  {
    icon: Eye,
    title: "Verificação Pública",
    description: "Qualquer pessoa pode verificar a autenticidade do registro na blockchain pública."
  }
];

export default function ComoFunciona() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Como Funciona o Registro em <span className="text-secondary">Blockchain</span>
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Entenda o processo completo de proteção da sua marca com tecnologia de ponta
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {processSteps.map((step, index) => (
              <div key={index} className="relative pb-12 last:pb-0">
                {/* Connector Line */}
                {index < processSteps.length - 1 && (
                  <div className="absolute left-8 top-20 w-0.5 h-[calc(100%-5rem)] bg-border" />
                )}
                
                <div className="flex gap-6 md:gap-10">
                  {/* Number Circle */}
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                      <span className="font-display text-xl font-bold text-primary-foreground">
                        {step.number}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <Card className="flex-1 border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <step.icon className="h-6 w-6 text-secondary" />
                        <CardTitle className="font-display text-2xl">{step.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base text-muted-foreground">
                        {step.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-20 md:py-28 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tecnologia de <span className="text-secondary">Ponta</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Utilizamos as mesmas tecnologias de segurança usadas por grandes instituições financeiras
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {techDetails.map((tech, index) => (
              <Card key={index} className="border-border/50">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <tech.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-display text-xl">{tech.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {tech.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Important Note */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-warning/50 bg-warning/5">
            <CardHeader>
              <CardTitle className="font-display text-2xl flex items-center gap-3">
                <Shield className="h-6 w-6 text-warning" />
                Importante: Blockchain × INPI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                O registro em blockchain <strong className="text-foreground">não substitui</strong> o registro 
                no INPI (Instituto Nacional da Propriedade Industrial). São proteções complementares.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-background border">
                  <h4 className="font-semibold text-foreground mb-2">Registro Blockchain</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Prova de anterioridade imediata</li>
                    <li>✓ Timestamp imutável</li>
                    <li>✓ Verificação pública</li>
                    <li>✓ Suporte em disputas judiciais</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-background border">
                  <h4 className="font-semibold text-foreground mb-2">Registro INPI</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Proteção legal oficial</li>
                    <li>✓ Direito exclusivo de uso</li>
                    <li>✓ Ação contra infratores</li>
                    <li>✓ Validade de 10 anos (renovável)</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm">
                <strong className="text-foreground">Recomendamos:</strong> Faça o registro blockchain 
                imediatamente para garantir sua prova de anterioridade, e em paralelo solicite o 
                registro no INPI para proteção legal completa.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Pronto para começar?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
            Faça seu primeiro registro em minutos e tenha sua prova de anterioridade garantida.
          </p>
          <Button size="lg" asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Link to="/cadastro">
              Criar Conta Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
