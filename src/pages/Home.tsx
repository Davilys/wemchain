import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  Clock, 
  FileCheck, 
  Lock, 
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe,
  FileText,
  Award,
  Database
} from "lucide-react";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 mb-8">
              <Database className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-secondary font-body">
                Tecnologia Blockchain para Propriedade Intelectual
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Proteja sua criação com{" "}
              <span className="text-secondary">registro em blockchain</span>
            </h1>

            {/* Subtitle */}
            <p className="font-body text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Garanta prova de anterioridade imutável para suas marcas, logotipos, obras autorais e documentos. 
              Hash criptográfico + timestamp verificável na blockchain.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                asChild 
                size="lg" 
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-body font-semibold text-lg px-8 py-6"
              >
                <Link to="/verificar">
                  <Shield className="mr-2 h-5 w-5" />
                  Verificar Certificado
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="border-primary/50 text-foreground hover:bg-primary/10 font-body font-semibold text-lg px-8 py-6"
              >
                <Link to="/cadastro">
                  Registrar por R$149
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 border border-primary/20">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground font-body">
                Registro instantâneo • Prova imutável • Certificado PDF
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* What is Blockchain Registration */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              O que é Registro em <span className="text-secondary">Blockchain</span>?
            </h2>
            <p className="font-body text-muted-foreground text-lg">
              Uma tecnologia que cria uma prova digital imutável da existência do seu arquivo em determinada data e hora, 
              servindo como evidência jurídica de anterioridade.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background border-border hover:border-secondary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                  <FileCheck className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">Hash Criptográfico</h3>
                <p className="font-body text-muted-foreground">
                  Seu arquivo é convertido em uma "impressão digital" única (SHA-256) que identifica o conteúdo de forma exclusiva.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-border hover:border-secondary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">Timestamp Imutável</h3>
                <p className="font-body text-muted-foreground">
                  O hash é gravado na blockchain com data e hora exatas, criando um registro permanente e inalterável.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-border hover:border-secondary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">Certificado Digital</h3>
                <p className="font-body text-muted-foreground">
                  Você recebe um certificado PDF com todos os dados do registro, TXID e QR Code para verificação.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What You Can Register */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              O que você pode <span className="text-secondary">registrar</span>?
            </h2>
            <p className="font-body text-muted-foreground text-lg">
              Qualquer arquivo digital pode ser registrado na blockchain para comprovar sua existência em determinada data.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Marcas", desc: "Logotipos, nomes e identidades visuais" },
              { icon: FileText, title: "Obras Autorais", desc: "Textos, músicas, códigos e designs" },
              { icon: Globe, title: "Documentos", desc: "Contratos, projetos e relatórios" },
              { icon: Zap, title: "Invenções", desc: "Protótipos, ideias e inovações" },
            ].map((item, index) => (
              <Card key={index} className="bg-card border-border hover:border-secondary/50 transition-colors group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                    <item.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Vantagens do Registro em <span className="text-secondary">Blockchain</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { title: "Prova de Anterioridade", desc: "Comprove que seu arquivo existia antes de qualquer disputa" },
              { title: "Imutável e Permanente", desc: "Uma vez registrado, ninguém pode alterar ou apagar" },
              { title: "Verificação Pública", desc: "Qualquer pessoa pode verificar a autenticidade do registro" },
              { title: "Validade Jurídica", desc: "Aceito como prova técnica em processos judiciais (CPC Art. 369)" },
              { title: "Registro Instantâneo", desc: "Seu arquivo é registrado em minutos, não em meses" },
              { title: "Custo Acessível", desc: "Muito mais barato que outros métodos de proteção" },
            ].map((item, index) => (
              <div key={index} className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-display text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="font-body text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-16 bg-primary/5 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
              <FileText className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-500 font-body">Aviso Jurídico Importante</span>
            </div>
            <p className="font-body text-muted-foreground">
              O registro em blockchain constitui <strong className="text-foreground">prova técnica de anterioridade</strong>, 
              não substituindo o registro de marca junto ao INPI. Para proteção completa da sua marca, 
              recomendamos também o{" "}
              <a 
                href="https://www.webpatentes.com.br" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary hover:underline"
              >
                registro oficial no INPI através da WebPatentes
              </a>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <img 
              src={webmarcasLogo} 
              alt="WebMarcas" 
              className="h-16 w-16 mx-auto mb-6 object-contain"
            />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Proteja sua criação <span className="text-secondary">agora</span>
            </h2>
            <p className="font-body text-muted-foreground text-lg mb-8">
              Registre seu arquivo na blockchain em minutos e garanta prova de anterioridade imutável.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-body font-semibold"
              >
                <Link to="/cadastro">
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="border-border text-foreground hover:bg-muted font-body"
              >
                <Link to="/como-funciona">
                  Saiba Como Funciona
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
