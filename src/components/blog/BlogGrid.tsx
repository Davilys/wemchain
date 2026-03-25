import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { blogArticles } from "./blogData";

export function BlogGrid() {
  const featured = blogArticles.find((a) => a.featured);
  const rest = blogArticles.filter((a) => !a.featured);

  return (
    <section className="pb-20">
      <div className="container mx-auto px-4">
        {/* Featured article */}
        {featured && (
          <Link to={`/blog/${featured.slug}`} className="block group mb-12">
            <Card className="overflow-hidden border-primary/20 hover:border-primary/40 transition-all duration-300">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="aspect-video md:aspect-auto bg-gradient-to-br from-primary/20 via-primary/5 to-accent/10 flex items-center justify-center min-h-[240px]">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">⛓️</span>
                    </div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Destaque
                    </span>
                  </div>
                </div>
                <CardContent className="p-8 flex flex-col justify-center">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3 w-fit">
                    {featured.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {featured.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {featured.readTime}
                    </span>
                  </div>
                </CardContent>
              </div>
            </Card>
          </Link>
        )}

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((article) => (
            <Link key={article.slug} to={`/blog/${article.slug}`} className="group">
              <Card className="h-full flex flex-col overflow-hidden hover:border-primary/30 transition-all duration-300">
                {/* Thumb */}
                <div className="aspect-video bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center">
                  <span className="text-4xl opacity-40 group-hover:opacity-60 transition-opacity">
                    {categoryEmoji(article.category)}
                  </span>
                </div>
                <CardContent className="p-5 flex flex-col flex-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3 w-fit">
                    {article.category}
                  </span>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border/30">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {article.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function categoryEmoji(cat: string) {
  const map: Record<string, string> = {
    Blockchain: "🔗",
    Jurídico: "⚖️",
    "Guia Prático": "📘",
    Música: "🎵",
    Tecnologia: "💻",
    Design: "🎨",
    Comparativo: "📊",
    Tendências: "🚀",
  };
  return map[cat] || "📄";
}
