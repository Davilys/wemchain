import { Newspaper, Sparkles } from "lucide-react";

export function BlogHero() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
          <Sparkles className="h-4 w-4" />
          Blog WebMarcas
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
          Blockchain, Propriedade Intelectual
          <br />
          <span className="text-primary">& Proteção Digital</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          Artigos, guias e novidades sobre registro em blockchain, prova de anterioridade e proteção de ativos digitais.
        </p>
      </div>
    </section>
  );
}
