import { Link } from "react-router-dom";
import { Shield, Music, Code, Palette, Building2, Briefcase, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const audiences = [
  {
    icon: Palette,
    title: "Designers & Criativos",
    description: "Proteja logotipos, identidades visuais, layouts e artes antes de apresentar aos clientes.",
  },
  {
    icon: Music,
    title: "Músicos & Compositores",
    description: "Registre letras, partituras, gravações e produções musicais com prova de autoria imediata.",
  },
  {
    icon: Code,
    title: "Desenvolvedores & Startups",
    description: "Garanta a propriedade intelectual do seu código-fonte, algoritmos e inovações tecnológicas.",
  },
  {
    icon: Building2,
    title: "Empresas & Marcas",
    description: "Proteja marcas, nomes comerciais, documentos estratégicos e segredos industriais.",
  },
  {
    icon: Briefcase,
    title: "Advogados & Escritórios",
    description: "Produza provas de anterioridade técnica robustas e verificáveis para processos judiciais.",
  },
  {
    icon: Shield,
    title: "Qualquer Criador",
    description: "Textos, fotos, vídeos, planilhas — qualquer arquivo digital pode ser registrado e protegido.",
  },
];

export function BlogTargetAudience() {
  return (
    <section className="py-20 border-t border-border/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <Sparkles className="h-4 w-4" />
            Para quem é a WebMarcas?
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Proteção digital para{" "}
            <span className="text-primary">todos os criadores</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A WebMarcas foi criada para qualquer pessoa ou empresa que precisa
            comprovar a autoria e anterioridade de ativos digitais.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {audiences.map((item) => (
            <Card
              key={item.title}
              className="group hover:border-primary/30 transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/cadastro">
            <Button size="lg" className="rounded-xl text-base px-10">
              Faça seu 1º Registro Grátis
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-3">
            Sem cartão de crédito. Primeiro registro gratuito.
          </p>
        </div>
      </div>
    </section>
  );
}
