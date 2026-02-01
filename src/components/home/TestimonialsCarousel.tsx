import { useLanguage } from "@/contexts/LanguageContext";
import { Star, Quote } from "lucide-react";

// Import testimonial photos
import robertoAlmeida from "@/assets/testimonials/roberto-almeida.jpg";
import julianaCosta from "@/assets/testimonials/juliana-costa.jpg";
import fernandoSilva from "@/assets/testimonials/fernando-silva.jpg";
import patriciaSantos from "@/assets/testimonials/patricia-santos.jpg";
import ricardoNunes from "@/assets/testimonials/ricardo-nunes.jpg";
import amandaRibeiro from "@/assets/testimonials/amanda-ribeiro.jpg";
import brunoCardoso from "@/assets/testimonials/bruno-cardoso.jpg";
import carlaMendes from "@/assets/testimonials/carla-mendes.jpg";
import diegoOliveira from "@/assets/testimonials/diego-oliveira.jpg";
import elenaFerreira from "@/assets/testimonials/elena-ferreira.jpg";
import gabrielSantos from "@/assets/testimonials/gabriel-santos.jpg";
import helenaLima from "@/assets/testimonials/helena-lima.jpg";
import igorMartins from "@/assets/testimonials/igor-martins.jpg";
import joanaPereira from "@/assets/testimonials/joana-pereira.jpg";
import kleberRocha from "@/assets/testimonials/kleber-rocha.jpg";
import larissaDias from "@/assets/testimonials/larissa-dias.jpg";
import marcosTavares from "@/assets/testimonials/marcos-tavares.jpg";
import nataliaGomes from "@/assets/testimonials/natalia-gomes.jpg";
import otavioSilva from "@/assets/testimonials/otavio-silva.jpg";
import paulaVieira from "@/assets/testimonials/paula-vieira.jpg";

const testimonials = [
  {
    name: "Roberto Almeida",
    role: "Fundador, Tech Solutions",
    text: "Excelente atendimento e muito profissionais. O acompanhamento pelo painel do cliente é muito prático. Nota 10!",
    photo: robertoAlmeida,
    social: "instagram",
  },
  {
    name: "Juliana Costa",
    role: "Proprietária, Bella Moda",
    text: "Tinha medo do processo ser complicado, mas a equipe explicou tudo direitinho. Minha marca foi aprovada sem problemas!",
    photo: julianaCosta,
    social: "whatsapp",
  },
  {
    name: "Fernando Silva",
    role: "Empresário, FS Importados",
    text: "Atendimento impecável do início ao fim. Minha marca está protegida e posso expandir meu negócio com tranquilidade.",
    photo: fernandoSilva,
    social: "instagram",
  },
  {
    name: "Patricia Santos",
    role: "CEO, PS Cosméticos",
    text: "Consegui proteger minha marca! A plataforma é tudo muito fácil e acessível.",
    photo: patriciaSantos,
    social: "whatsapp",
  },
  {
    name: "Ricardo Nunes",
    role: "CEO, RN Tecnologia",
    text: "Investimento que vale cada centavo. A segurança de ter minha marca registrada não tem preço.",
    photo: ricardoNunes,
    social: "whatsapp",
  },
  {
    name: "Amanda Ribeiro",
    role: "Proprietária, AR Boutique",
    text: "Equipe muito atenciosa e competente. Me senti segura durante todo o processo de registro.",
    photo: amandaRibeiro,
    social: "whatsapp",
  },
  {
    name: "Bruno Cardoso",
    role: "Empreendedor",
    text: "O melhor custo-benefício do mercado. Processo rápido, transparente e sem burocracia.",
    photo: brunoCardoso,
    social: "instagram",
  },
  {
    name: "Carla Mendes",
    role: "Designer, CM Studio",
    text: "Como designer, preciso proteger meus trabalhos. A WebMarcas me deu essa segurança de forma simples e rápida.",
    photo: carlaMendes,
    social: "instagram",
  },
  {
    name: "Diego Oliveira",
    role: "CEO, DO Tech",
    text: "Registro em blockchain é o futuro. Parabéns à equipe pela inovação e praticidade.",
    photo: diegoOliveira,
    social: "whatsapp",
  },
  {
    name: "Elena Ferreira",
    role: "Advogada, EF Advocacia",
    text: "Recomendo aos meus clientes. A prova de anterioridade em blockchain é muito sólida juridicamente.",
    photo: elenaFerreira,
    social: "instagram",
  },
  {
    name: "Gabriel Santos",
    role: "Músico Independente",
    text: "Finalmente posso registrar minhas músicas de forma acessível. Antes era muito caro e burocrático.",
    photo: gabrielSantos,
    social: "instagram",
  },
  {
    name: "Helena Lima",
    role: "Escritora",
    text: "Registrei meu livro antes de publicar. Agora tenho prova oficial da minha autoria.",
    photo: helenaLima,
    social: "whatsapp",
  },
  {
    name: "Igor Martins",
    role: "Desenvolvedor, IM Software",
    text: "Uso para registrar meus códigos-fonte. Proteção essencial para quem desenvolve software.",
    photo: igorMartins,
    social: "whatsapp",
  },
  {
    name: "Joana Pereira",
    role: "Fotógrafa Profissional",
    text: "Minhas fotos agora estão protegidas. O certificado digital é muito profissional.",
    photo: joanaPereira,
    social: "instagram",
  },
  {
    name: "Kleber Rocha",
    role: "Arquiteto, KR Projetos",
    text: "Registro todos os meus projetos arquitetônicos. Indispensável para proteger propriedade intelectual.",
    photo: kleberRocha,
    social: "whatsapp",
  },
  {
    name: "Larissa Dias",
    role: "Youtuber",
    text: "Protejo meus roteiros e conteúdos antes de publicar. Nunca mais terei problema com cópias.",
    photo: larissaDias,
    social: "instagram",
  },
  {
    name: "Marcos Tavares",
    role: "Inventor",
    text: "Antes de patentear, registro aqui para ter prova de anterioridade. Estratégia perfeita!",
    photo: marcosTavares,
    social: "whatsapp",
  },
  {
    name: "Natália Gomes",
    role: "Designer de Moda",
    text: "Minhas coleções agora têm data comprovada de criação. Essencial para o mundo da moda.",
    photo: nataliaGomes,
    social: "instagram",
  },
  {
    name: "Otávio Silva",
    role: "Produtor Musical",
    text: "A cada beat que crio, já registro. Proteção instantânea e certificado profissional.",
    photo: otavioSilva,
    social: "whatsapp",
  },
  {
    name: "Paula Vieira",
    role: "Empreendedora Digital",
    text: "Registro meus cursos online antes de lançar. Segurança total para meu negócio digital.",
    photo: paulaVieira,
    social: "instagram",
  },
];

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <div className="flex-shrink-0 w-[300px] md:w-[340px] p-5 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing select-none">
      {/* Stars and Quote */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
          ))}
        </div>
        <Quote className="h-6 w-6 text-primary/30" />
      </div>

      {/* Testimonial Text */}
      <p className="text-foreground/90 text-sm leading-relaxed mb-4 min-h-[60px]">
        "{testimonial.text}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <img 
          src={testimonial.photo} 
          alt={testimonial.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-border"
          draggable={false}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-sm truncate">{testimonial.name}</span>
            {testimonial.social === "whatsapp" ? (
              <svg className="h-3.5 w-3.5 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5 text-pink-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            )}
          </div>
          <span className="text-muted-foreground text-xs truncate block">{testimonial.role}</span>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsCarousel() {
  const { language } = useLanguage();

  const getTitle = () => {
    switch (language) {
      case "en":
        return "What our clients say";
      case "es":
        return "Lo que dicen nuestros clientes";
      default:
        return "O que nossos clientes dizem";
    }
  };

  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 mb-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <span className="text-sm font-semibold text-primary">
              {language === "en" ? "Testimonials" : language === "es" ? "Testimonios" : "Depoimentos"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            {getTitle()}
          </h2>
        </div>
      </div>

      {/* Infinite Scroll Container */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Row 1 - Left to Right - Draggable */}
        <div 
          className="flex gap-4 mb-4 animate-scroll-left-fast overflow-x-auto scrollbar-hide hover:[animation-play-state:paused] cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={(e) => {
            const el = e.currentTarget;
            el.style.animationPlayState = 'paused';
            const startX = e.pageX - el.offsetLeft;
            const scrollLeft = el.scrollLeft;
            const onMouseMove = (e: MouseEvent) => {
              const x = e.pageX - el.offsetLeft;
              el.scrollLeft = scrollLeft - (x - startX);
            };
            const onMouseUp = () => {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
              el.style.animationPlayState = 'running';
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }}
        >
          {[...testimonials.slice(0, 10), ...testimonials.slice(0, 10), ...testimonials.slice(0, 10)].map((testimonial, index) => (
            <TestimonialCard key={`row1-${index}`} testimonial={testimonial} />
          ))}
        </div>

        {/* Row 2 - Right to Left - Draggable */}
        <div 
          className="flex gap-4 animate-scroll-right-fast overflow-x-auto scrollbar-hide hover:[animation-play-state:paused] cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={(e) => {
            const el = e.currentTarget;
            el.style.animationPlayState = 'paused';
            const startX = e.pageX - el.offsetLeft;
            const scrollLeft = el.scrollLeft;
            const onMouseMove = (e: MouseEvent) => {
              const x = e.pageX - el.offsetLeft;
              el.scrollLeft = scrollLeft - (x - startX);
            };
            const onMouseUp = () => {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
              el.style.animationPlayState = 'running';
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }}
        >
          {[...testimonials.slice(10, 20), ...testimonials.slice(10, 20), ...testimonials.slice(10, 20)].map((testimonial, index) => (
            <TestimonialCard key={`row2-${index}`} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
