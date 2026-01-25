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
    title: "Você envia o arquivo",
    description: "Faça upload do seu arquivo (marca, logotipo, documento, arte) através da nossa plataforma segura.",
    details: [
      "Formatos aceitos: PDF, PNG, JPG, JPEG, SVG, MP4, ZIP",
      "Tamanho máximo: 10MB por arquivo",
      "Seu arquivo fica armazenado de forma privada e segura"
    ]
  },
  {
    icon: Hash,
    number: "02",
    title: "Geramos uma impressão digital (hash)",
    description: "Nosso sistema cria uma assinatura única do seu arquivo usando criptografia de nível bancário.",
    details: [
      "O hash é como uma 'impressão digital' única do arquivo",
      "Qualquer alteração no arquivo gera um hash diferente",
      "Seu arquivo original nunca é exposto publicamente"
    ]
  },
  {
    icon: Link2,
    number: "03",
    title: "O hash é registrado na blockchain",
    description: "Registramos o hash permanentemente na blockchain Polygon, com data e hora exatas.",
    details: [
      "Transação pública e verificável por qualquer pessoa",
      "Data e hora registradas de forma imutável",
      "Custo de transação mínimo (frações de centavo)"
    ]
  },
  {
    icon: FileText,
    number: "04",
    title: "Você recebe um certificado",
    description: "Emitimos um certificado profissional contendo todos os dados do seu registro blockchain.",
    details: [
      "Hash criptográfico do arquivo",
      "ID da transação na blockchain (TXID)",
      "Link para verificação pública",
      "QR Code para validação instantânea"
    ]
  }
];

const techDetails = [
  {
    icon: Shield,
    title: "SHA-256",
    description: "Algoritmo de hash criptográfico usado por bancos e governos mundialmente."
  },
  {
    icon: Lock,
    title: "Blockchain Polygon",
    description: "Rede blockchain de alta performance, econômica e sustentável."
  },
  {
    icon: Clock,
    title: "Timestamp Imutável",
    description: "Data e hora gravadas permanentemente como prova de anterioridade."
  },
  {
    icon: Eye,
    title: "Verificação Pública",
    description: "Qualquer pessoa pode verificar a autenticidade do registro."
  }
];

export default function ComoFunciona() {
  return (
    <Layout>
      <section className="bg-gradient-hero py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Como Funciona o Registro em <span className="text-primary">Blockchain</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-body">
            Processo simples e seguro para proteger sua marca com tecnologia de ponta
          </p>
        </div>
      </section>

      <section className="py-16 bg-primary/5 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
              Você não precisa entender blockchain
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Nossa plataforma traduz toda a complexidade técnica em um processo simples. 
              O resultado é uma <strong className="text-foreground">prova de anterioridade</strong> que 
              comprova que você tinha aquele arquivo em determinada data.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {processSteps.map((step, index) => (
              <div key={index} className="relative pb-12 last:pb-0">
                {index < processSteps.length - 1 && (
                  <div className="absolute left-8 top-20 w-0.5 h-[calc(100%-5rem)] bg-border" />
                )}
                <div className="flex gap-6 md:gap-10">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                      <span className="font-display text-xl font-bold text-primary-foreground">{step.number}</span>
                    </div>
                  </div>
                  <Card className="flex-1 border-border bg-card">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <step.icon className="h-6 w-6 text-primary" />
                        <CardTitle className="font-display text-2xl">{step.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base text-muted-foreground font-body">{step.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground font-body">
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

      <section className="py-20 md:py-28 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {techDetails.map((tech, index) => (
              <Card key={index} className="border-border bg-card text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <tech.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">{tech.title}</h3>
                  <p className="text-sm text-muted-foreground font-body">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Pronto para começar?
          </h2>
          <Button size="lg" asChild className="bg-background text-foreground hover:bg-background/90 font-body">
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