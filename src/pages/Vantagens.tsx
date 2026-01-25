import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Scale,
  Shield,
  Clock,
  FileSearch,
  Globe,
  Lock,
  CheckCircle2,
  ArrowRight,
  Gavel,
  FileText,
  Users
} from "lucide-react";

const advantages = [
  {
    icon: Clock,
    title: "Prova de Anterioridade",
    description: "O timestamp da blockchain comprova de forma inquestionável quando você registrou sua marca, servindo como evidência em disputas de prioridade.",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    icon: Lock,
    title: "Imutabilidade",
    description: "Uma vez registrado na blockchain, o hash não pode ser alterado ou removido. É uma prova permanente e à prova de adulteração.",
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    icon: Globe,
    title: "Verificação Pública",
    description: "Qualquer pessoa pode verificar a autenticidade do registro na blockchain pública, sem necessidade de intermediários.",
    color: "text-green-500",
    bg: "bg-green-500/10"
  },
  {
    icon: FileSearch,
    title: "Integridade do Documento",
    description: "O hash SHA-256 garante que qualquer alteração no documento original será detectada, provando a integridade do arquivo.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10"
  },
  {
    icon: Shield,
    title: "Proteção Imediata",
    description: "Enquanto o processo no INPI pode levar meses, o registro em blockchain é instantâneo, garantindo proteção desde o primeiro momento.",
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  },
  {
    icon: Scale,
    title: "Valor Probatório",
    description: "Tribunais brasileiros já reconhecem registros em blockchain como prova válida em processos de propriedade intelectual.",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  }
];

const legalCases = [
  {
    title: "Disputas de Autoria",
    description: "Comprove que você criou determinada obra, logo ou marca antes de terceiros alegarem autoria.",
    icon: Gavel,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Contratos e Acordos",
    description: "Registre versões de contratos com timestamp para comprovar quando acordos foram estabelecidos.",
    icon: FileText,
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    title: "Parcerias Empresariais",
    description: "Documente ideias e projetos antes de apresentá-los a potenciais parceiros ou investidores.",
    icon: Users,
    color: "text-green-500",
    bg: "bg-green-500/10"
  }
];

const comparisonItems = [
  { feature: "Prova de anterioridade", blockchain: true, traditional: false },
  { feature: "Registro instantâneo", blockchain: true, traditional: false },
  { feature: "Custo acessível", blockchain: true, traditional: false },
  { feature: "Verificação pública", blockchain: true, traditional: false },
  { feature: "Imutabilidade garantida", blockchain: true, traditional: false },
  { feature: "Proteção legal oficial (INPI)", blockchain: false, traditional: true },
  { feature: "Direito exclusivo de uso", blockchain: false, traditional: true },
  { feature: "Ação judicial direta", blockchain: false, traditional: true },
];

export default function Vantagens() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Scale className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Fundamento Jurídico</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Vantagens <span className="text-primary">Jurídicas</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Entenda como o registro em blockchain fortalece a proteção legal da sua marca
          </p>
          <p className="text-sm text-muted-foreground/60 max-w-xl mx-auto">
            Uma solução do{" "}
            <a href="https://www.webpatentes.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Grupo WebPatentes
            </a>
            {" "}— 15 anos de expertise em Propriedade Intelectual
          </p>
        </div>
      </section>

      {/* Main Advantages */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Por que registrar em <span className="text-primary">Blockchain</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Benefícios únicos que nenhum outro método de registro oferece
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {advantages.map((advantage, index) => (
              <Card key={index} className="card-premium group">
                <CardHeader>
                  <div className={`h-14 w-14 rounded-2xl ${advantage.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <advantage.icon className={`h-7 w-7 ${advantage.color}`} />
                  </div>
                  <CardTitle className="text-xl tracking-tight">{advantage.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {advantage.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Use Cases */}
      <section className="py-20 md:py-28 bg-card border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Casos de <span className="text-primary">Uso Jurídico</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Situações onde o registro blockchain faz a diferença
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {legalCases.map((item, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                <div className={`h-16 w-16 rounded-2xl ${item.bg} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`h-8 w-8 ${item.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Blockchain vs <span className="text-primary">Registro Tradicional</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Proteções complementares, não substitutivas
            </p>
          </div>

          <Card className="max-w-3xl mx-auto card-premium overflow-hidden">
            <div className="grid grid-cols-3 bg-muted/50 font-semibold">
              <div className="p-4 border-b border-r border-border">Característica</div>
              <div className="p-4 border-b border-r border-border text-center text-primary">Blockchain</div>
              <div className="p-4 border-b border-border text-center">INPI</div>
            </div>
            {comparisonItems.map((item, index) => (
              <div key={index} className="grid grid-cols-3">
                <div className="p-4 border-b border-r border-border text-sm">{item.feature}</div>
                <div className="p-4 border-b border-r border-border text-center">
                  {item.blockchain ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
                <div className="p-4 border-b border-border text-center">
                  {item.traditional ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </div>
            ))}
          </Card>

          <div className="mt-8 max-w-2xl mx-auto space-y-4">
            <p className="text-center text-muted-foreground">
              <strong className="text-foreground">Recomendação:</strong> Combine ambos os registros para 
              proteção máxima. O blockchain garante a prova de anterioridade imediata, enquanto o INPI 
              confere os direitos legais oficiais.
            </p>
            
            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
              <p className="text-sm text-center text-muted-foreground">
                <strong className="text-foreground">⚠️ Aviso Jurídico:</strong> Este certificado constitui prova técnica de 
                anterioridade, <strong>não substituindo o registro de marca junto ao INPI</strong>. Para registro 
                oficial, acesse{" "}
                <a 
                  href="https://www.webpatentes.com.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  WebPatentes
                </a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Basis */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Fundamento Legal
              </h2>
            </div>

            <div className="space-y-6">
              {[
                {
                  title: "Marco Civil da Internet (Lei 12.965/2014)",
                  desc: "Estabelece princípios para uso da internet no Brasil, incluindo a preservação da estabilidade, segurança e funcionalidade da rede, que fundamenta o uso de tecnologias como blockchain."
                },
                {
                  title: "Código de Processo Civil (Art. 369)",
                  desc: '"As partes têm o direito de empregar todos os meios legais, bem como os moralmente legítimos, ainda que não especificados neste Código, para provar a verdade dos fatos em que se funda o pedido ou a defesa."'
                },
                {
                  title: "Jurisprudência",
                  desc: "Tribunais brasileiros vêm reconhecendo cada vez mais o valor probatório de registros em blockchain, especialmente em casos envolvendo propriedade intelectual, contratos e autoria de obras."
                }
              ].map((item, index) => (
                <Card key={index} className="bg-primary-foreground/5 border-primary-foreground/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-primary-foreground tracking-tight">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-primary-foreground/80">
                      {item.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
            Proteja sua marca agora
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Não espere uma disputa para se arrepender de não ter registrado.
          </p>
          <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl shadow-lg">
            <Link to="/cadastro">
              Fazer Meu Registro
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
