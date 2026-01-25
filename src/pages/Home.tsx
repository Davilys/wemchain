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
  ShieldCheck,
  Star,
  Users,
  TrendingUp
} from "lucide-react";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section - WebMarcas Premium Style */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="absolute inset-0 pattern-dots" />
        
        {/* Glowing orbs - subtle blue */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-primary/3 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 mb-10 animate-fade-up">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">
                Líder em Registro de Marcas no Brasil
              </span>
            </div>

            {/* Main Title - WebMarcas Style */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 md:mb-8 leading-[1.1] animate-fade-up delay-100 tracking-tight">
              <span className="text-foreground">Registre sua marca e</span>
              <br />
              <span className="text-primary text-shadow-glow">torne ela única!</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-up delay-200 px-4">
              Processo <span className="text-foreground font-medium">100% online</span>, protocolo em até 48h e garantia de registro.
              <br className="hidden sm:block" />
              <span className="text-foreground font-medium">Dono da marca é quem registra primeiro.</span> Proteja-se agora.
            </p>

            {/* CTA Buttons - Exact WebMarcas style */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-fade-up delay-300 px-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-xl shadow-lg btn-premium group w-full sm:w-auto"
              >
                <Link to="/verificar">
                  Consultar viabilidade
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="border-2 border-secondary bg-secondary/80 text-foreground hover:bg-secondary font-semibold text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-xl group w-full sm:w-auto"
              >
                <Link to="/cadastro">
                  Registrar por R$699
                </Link>
              </Button>
            </div>

            {/* Offer Badge - Red accent like reference */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary/60 border border-border/50 mb-12 animate-fade-up delay-400">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Oferta válida até <span className="text-red-500 font-bold">30/01</span>
              </span>
            </div>

            {/* Feature Cards Row - Matching WebMarcas exactly */}
            <div className="flex flex-wrap gap-4 justify-center items-center animate-fade-up delay-500 px-4 max-w-4xl mx-auto">
              {[
                { icon: Shield, color: "text-blue-500", bg: "bg-blue-500/10", label: "Proteção Total" },
                { icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", label: "Registro Rápido" },
                { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", label: "Garantia" },
                { icon: Award, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Certificado" },
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="relative flex flex-col items-center p-5 rounded-2xl bg-card border border-border/50 min-w-[140px] group hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Decorative corner gradient */}
                  <div className={`absolute top-0 right-0 w-16 h-16 ${item.bg} rounded-bl-[60px] rounded-tr-2xl opacity-50`} />
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-3 relative z-10`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground relative z-10">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-card to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-card relative border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              { value: "15.000+", label: "Marcas Registradas", icon: Shield },
              { value: "98%", label: "Taxa de Aprovação", icon: CheckCircle2 },
              { value: "48h", label: "Tempo de Protocolo", icon: Clock },
              { value: "10 anos", label: "Validade do Registro", icon: Award },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Blockchain Registration */}
      <section className="section-padding bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-bottom opacity-50" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Tecnologia Blockchain</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              O que é Registro em{" "}
              <span className="text-primary">Blockchain</span>?
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed px-4">
              Uma tecnologia que cria uma prova digital imutável da existência do seu arquivo em determinada data e hora, 
              servindo como evidência jurídica de anterioridade.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: FileCheck,
                title: "Hash Criptográfico",
                desc: 'Seu arquivo é convertido em uma "impressão digital" única (SHA-256) que identifica o conteúdo de forma exclusiva.',
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              {
                icon: Clock,
                title: "Timestamp Imutável",
                desc: "O hash é gravado na blockchain com data e hora exatas, criando um registro permanente e inalterável.",
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              {
                icon: Award,
                title: "Certificado Digital",
                desc: "Você recebe um certificado PDF com todos os dados do registro, TXID e QR Code para verificação.",
                color: "text-green-500",
                bg: "bg-green-500/10"
              }
            ].map((item, index) => (
              <Card 
                key={index} 
                className="card-premium group"
              >
                <CardContent className="p-6 md:p-8 text-center">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${item.bg} flex items-center justify-center mx-auto mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`h-8 w-8 md:h-10 md:w-10 ${item.color}`} />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Register */}
      <section className="section-padding bg-card relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Proteção Completa</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              O que você pode{" "}
              <span className="text-primary">registrar</span>?
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed px-4">
              Qualquer arquivo digital pode ser registrado na blockchain para comprovar sua existência em determinada data.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {[
              { icon: Shield, title: "Marcas", desc: "Logotipos, nomes e identidades visuais", color: "text-blue-500", bg: "bg-blue-500/10" },
              { icon: FileText, title: "Obras Autorais", desc: "Textos, músicas, códigos e designs", color: "text-purple-500", bg: "bg-purple-500/10" },
              { icon: Globe, title: "Documentos", desc: "Contratos, projetos e relatórios", color: "text-green-500", bg: "bg-green-500/10" },
              { icon: Zap, title: "Invenções", desc: "Protótipos, ideias e inovações", color: "text-yellow-500", bg: "bg-yellow-500/10" },
            ].map((item, index) => (
              <Card key={index} className="card-premium group">
                <CardContent className="p-4 md:p-6">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${item.bg} flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`h-6 w-6 md:h-7 md:w-7 ${item.color}`} />
                  </div>
                  <h3 className="text-base md:text-lg font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-background relative">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold text-green-500">Vantagens Exclusivas</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Vantagens do Registro em{" "}
              <span className="text-primary">Blockchain</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              { title: "Prova de Anterioridade", desc: "Comprove que seu arquivo existia antes de qualquer disputa", icon: Shield, color: "text-blue-500", bg: "bg-blue-500/10" },
              { title: "Imutável e Permanente", desc: "Uma vez registrado, ninguém pode alterar ou apagar", icon: Lock, color: "text-purple-500", bg: "bg-purple-500/10" },
              { title: "Verificação Pública", desc: "Qualquer pessoa pode verificar a autenticidade do registro", icon: Globe, color: "text-green-500", bg: "bg-green-500/10" },
              { title: "Validade Jurídica", desc: "Aceito como prova técnica em processos judiciais (CPC Art. 369)", icon: Award, color: "text-yellow-500", bg: "bg-yellow-500/10" },
              { title: "Registro Instantâneo", desc: "Seu arquivo é registrado em minutos, não em meses", icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10" },
              { title: "Custo Acessível", desc: "Muito mais barato que outros métodos de proteção", icon: BadgeCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
            ].map((item, index) => (
              <div 
                key={index} 
                className="flex gap-4 md:gap-5 p-4 md:p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`h-5 w-5 md:h-6 md:w-6 ${item.color}`} />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 md:py-16 bg-card relative border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-card flex items-center justify-center">
                    <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                ))}
              </div>
              <div>
                <div className="text-lg md:text-xl font-bold text-foreground">+15.000</div>
                <div className="text-xs md:text-sm text-muted-foreground">Clientes satisfeitos</div>
              </div>
            </div>
            
            <div className="h-px md:h-12 w-full md:w-px bg-border" />
            
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 md:h-6 md:w-6 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <div>
                <div className="text-lg md:text-xl font-bold text-foreground">4.9/5</div>
                <div className="text-xs md:text-sm text-muted-foreground">Avaliação média</div>
              </div>
            </div>
            
            <div className="h-px md:h-12 w-full md:w-px bg-border" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
              </div>
              <div>
                <div className="text-lg md:text-xl font-bold text-foreground">98%</div>
                <div className="text-xs md:text-sm text-muted-foreground">Taxa de aprovação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-12 md:py-16 bg-background relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative p-6 md:p-8 rounded-2xl bg-yellow-500/5 border border-yellow-500/20">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                  <FileText className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs md:text-sm font-bold text-yellow-500">Aviso Jurídico Importante</span>
                </div>
              </div>
              <p className="text-muted-foreground text-center pt-4 text-sm md:text-base leading-relaxed">
                O registro em blockchain constitui <strong className="text-foreground">prova técnica de anterioridade</strong>, 
                não substituindo o registro de marca junto ao INPI. Para proteção completa da sua marca, 
                recomendamos também o{" "}
                <a 
                  href="https://www.webpatentes.com.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  registro oficial no INPI através da WebPatentes
                </a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section-padding bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 md:mb-8 rounded-2xl bg-primary/10 flex items-center justify-center animate-float border border-primary/20">
              <img 
                src={webmarcasLogo} 
                alt="WebMarcas" 
                className="h-10 w-10 md:h-12 md:w-12 object-contain"
              />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight">
              Proteja sua criação{" "}
              <span className="text-primary">agora</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg mb-8 md:mb-10 leading-relaxed px-4">
              Registre seu arquivo na blockchain em minutos e garanta prova de anterioridade imutável.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-6 md:py-7 rounded-xl shadow-lg btn-premium group w-full sm:w-auto"
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
                className="border-2 border-border bg-card/50 text-foreground hover:bg-card font-semibold px-8 py-6 md:py-7 rounded-xl backdrop-blur-sm w-full sm:w-auto"
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
