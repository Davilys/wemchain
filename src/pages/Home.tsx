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
  Database,
  Sparkles,
  BadgeCheck,
  ShieldCheck
} from "lucide-react";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section - Premium */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-secondary/8 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/3 rounded-full blur-[120px]" />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-2 h-2 bg-secondary/30 rounded-full animate-float" />
          <div className="absolute top-40 right-32 w-1.5 h-1.5 bg-secondary/20 rounded-full animate-float delay-300" />
          <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-secondary/25 rounded-full animate-float delay-500" />
          <div className="absolute top-1/3 right-20 w-2 h-2 bg-primary/20 rounded-full animate-float delay-200" />
        </div>
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border-secondary/30 mb-10 animate-fade-up group cursor-default">
              <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
              <span className="text-sm font-semibold text-secondary font-body tracking-wide">
                Tecnologia Blockchain para Propriedade Intelectual
              </span>
              <BadgeCheck className="h-4 w-4 text-secondary" />
            </div>

            {/* Main Title - Premium Typography */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[1.1] animate-fade-up delay-100">
              <span className="text-foreground">Proteja sua criação com</span>
              <br />
              <span className="text-gradient-cyan text-shadow-glow">registro em blockchain</span>
            </h1>

            {/* Subtitle - Refined */}
            <p className="font-body text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-up delay-200">
              Garanta <span className="text-foreground font-medium">prova de anterioridade imutável</span> para suas marcas, logotipos, obras autorais e documentos. 
              <span className="text-secondary"> Hash criptográfico + timestamp verificável</span> na blockchain.
            </p>

            {/* CTA Buttons - Premium Style */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 animate-fade-up delay-300">
              <Button 
                asChild 
                size="lg" 
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-body font-bold text-base px-8 py-7 rounded-xl shadow-lg glow-cyan btn-premium group"
              >
                <Link to="/verificar">
                  <ShieldCheck className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Verificar Certificado
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="border-2 border-border bg-background/50 text-foreground hover:bg-primary/10 hover:border-primary/50 font-body font-bold text-base px-8 py-7 rounded-xl backdrop-blur-sm group"
              >
                <Link to="/cadastro">
                  Registrar por R$149
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {/* Trust Badges - Premium */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-up delay-400">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30 border border-border/50 backdrop-blur-sm">
                <Lock className="h-4 w-4 text-secondary" />
                <span className="text-sm text-muted-foreground font-body">Registro instantâneo</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30 border border-border/50 backdrop-blur-sm">
                <Shield className="h-4 w-4 text-secondary" />
                <span className="text-sm text-muted-foreground font-body">Prova imutável</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30 border border-border/50 backdrop-blur-sm">
                <FileText className="h-4 w-4 text-secondary" />
                <span className="text-sm text-muted-foreground font-body">Certificado PDF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-card to-transparent" />
      </section>

      {/* What is Blockchain Registration - Premium */}
      <section className="py-24 bg-card relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
              <Database className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-secondary font-body">Tecnologia</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              O que é Registro em{" "}
              <span className="text-gradient-cyan">Blockchain</span>?
            </h2>
            <p className="font-body text-muted-foreground text-lg leading-relaxed">
              Uma tecnologia que cria uma prova digital imutável da existência do seu arquivo em determinada data e hora, 
              servindo como evidência jurídica de anterioridade.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileCheck,
                title: "Hash Criptográfico",
                desc: 'Seu arquivo é convertido em uma "impressão digital" única (SHA-256) que identifica o conteúdo de forma exclusiva.',
                delay: "0"
              },
              {
                icon: Clock,
                title: "Timestamp Imutável",
                desc: "O hash é gravado na blockchain com data e hora exatas, criando um registro permanente e inalterável.",
                delay: "100"
              },
              {
                icon: Award,
                title: "Certificado Digital",
                desc: "Você recebe um certificado PDF com todos os dados do registro, TXID e QR Code para verificação.",
                delay: "200"
              }
            ].map((item, index) => (
              <Card 
                key={index} 
                className={`card-premium border-border/50 group animate-fade-up delay-${item.delay}`}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 icon-container">
                    <item.icon className="h-10 w-10 text-secondary" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-4 group-hover:text-secondary transition-colors">{item.title}</h3>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Register - Premium */}
      <section className="py-24 bg-background relative">
        <div className="absolute inset-0 bg-gradient-radial opacity-50" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary font-body">Proteção</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              O que você pode{" "}
              <span className="text-gradient-cyan">registrar</span>?
            </h2>
            <p className="font-body text-muted-foreground text-lg leading-relaxed">
              Qualquer arquivo digital pode ser registrado na blockchain para comprovar sua existência em determinada data.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Shield, title: "Marcas", desc: "Logotipos, nomes e identidades visuais", color: "from-blue-500/20 to-blue-500/5" },
              { icon: FileText, title: "Obras Autorais", desc: "Textos, músicas, códigos e designs", color: "from-purple-500/20 to-purple-500/5" },
              { icon: Globe, title: "Documentos", desc: "Contratos, projetos e relatórios", color: "from-green-500/20 to-green-500/5" },
              { icon: Zap, title: "Invenções", desc: "Protótipos, ideias e inovações", color: "from-amber-500/20 to-amber-500/5" },
            ].map((item, index) => (
              <Card key={index} className="card-premium border-border/50 group">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
                    <item.icon className="h-7 w-7 text-secondary" />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2 group-hover:text-secondary transition-colors">{item.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits - Premium */}
      <section className="py-24 bg-card relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-6">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success font-body">Vantagens</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Vantagens do Registro em{" "}
              <span className="text-gradient-cyan">Blockchain</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { title: "Prova de Anterioridade", desc: "Comprove que seu arquivo existia antes de qualquer disputa", icon: Shield },
              { title: "Imutável e Permanente", desc: "Uma vez registrado, ninguém pode alterar ou apagar", icon: Lock },
              { title: "Verificação Pública", desc: "Qualquer pessoa pode verificar a autenticidade do registro", icon: Globe },
              { title: "Validade Jurídica", desc: "Aceito como prova técnica em processos judiciais (CPC Art. 369)", icon: Award },
              { title: "Registro Instantâneo", desc: "Seu arquivo é registrado em minutos, não em meses", icon: Zap },
              { title: "Custo Acessível", desc: "Muito mais barato que outros métodos de proteção", icon: BadgeCheck },
            ].map((item, index) => (
              <div 
                key={index} 
                className="flex gap-5 p-6 rounded-2xl bg-background/50 border border-border/50 hover:border-secondary/30 hover:bg-background transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                  <item.icon className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold mb-2 group-hover:text-secondary transition-colors">{item.title}</h3>
                  <p className="font-body text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Disclaimer - Premium */}
      <section className="py-16 bg-background relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30">
                  <FileText className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-400 font-body">Aviso Jurídico Importante</span>
                </div>
              </div>
              <p className="font-body text-muted-foreground text-center pt-4 leading-relaxed">
                O registro em blockchain constitui <strong className="text-foreground">prova técnica de anterioridade</strong>, 
                não substituindo o registro de marca junto ao INPI. Para proteção completa da sua marca, 
                recomendamos também o{" "}
                <a 
                  href="https://www.webpatentes.com.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary hover:underline font-medium"
                >
                  registro oficial no INPI através da WebPatentes
                </a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final - Premium */}
      <section className="py-24 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center animate-float">
              <img 
                src={webmarcasLogo} 
                alt="WebMarcas" 
                className="h-12 w-12 object-contain"
              />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Proteja sua criação{" "}
              <span className="text-gradient-cyan">agora</span>
            </h2>
            <p className="font-body text-muted-foreground text-lg mb-10 leading-relaxed">
              Registre seu arquivo na blockchain em minutos e garanta prova de anterioridade imutável.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-body font-bold px-8 py-7 rounded-xl shadow-lg glow-cyan btn-premium group"
              >
                <Link to="/cadastro">
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="border-2 border-border bg-background/50 text-foreground hover:bg-muted font-body font-semibold px-8 py-7 rounded-xl backdrop-blur-sm"
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
