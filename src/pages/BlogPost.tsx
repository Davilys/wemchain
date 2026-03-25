import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ArrowLeft, Calendar, Clock, User, Share2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { blogArticles } from "@/components/blog/blogData";

export default function BlogPost() {
  const { slug } = useParams();
  const article = blogArticles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-bold mb-4">Artigo não encontrado</h1>
          <Link to="/blog">
            <Button variant="outline">Voltar ao Blog</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Blog
          </Link>

          {/* Category badge */}
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-4">
            {article.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-10 pb-8 border-b border-border/40">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {article.readTime}
            </span>
          </div>

          {/* Cover image */}
          <div className="rounded-2xl overflow-hidden mb-10 aspect-video bg-gradient-to-br from-primary/20 via-primary/5 to-accent/10 flex items-center justify-center">
            <Shield className="h-20 w-20 text-primary/30" />
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {article.content.map((block, i) => {
              if (block.type === "h2")
                return (
                  <h2 key={i} className="text-2xl font-bold mt-10 mb-4">
                    {block.text}
                  </h2>
                );
              if (block.type === "h3")
                return (
                  <h3 key={i} className="text-xl font-semibold mt-8 mb-3">
                    {block.text}
                  </h3>
                );
              return (
                <p key={i} className="text-muted-foreground leading-relaxed mb-4">
                  {block.text}
                </p>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-center">
            <h3 className="text-2xl font-bold mb-3">
              Proteja seus ativos digitais agora
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Registre marcas, logos, músicas e qualquer arquivo digital com prova de anterioridade em blockchain.
            </p>
            <Link to="/cadastro">
              <Button size="lg" className="rounded-xl">
                Faça seu 1º Registro Grátis
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </Layout>
  );
}
