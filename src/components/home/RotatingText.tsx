import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const rotatingWords = [
  { key: "marca", pt: "Marca", en: "Brand", es: "Marca", ptPrefix: "Registre Sua" },
  { key: "logo", pt: "Logo", en: "Logo", es: "Logo", ptPrefix: "Registre Sua" },
  { key: "livro", pt: "Livro", en: "Book", es: "Libro", ptPrefix: "Registre Seu" },
  { key: "musica", pt: "Música", en: "Music", es: "Música", ptPrefix: "Registre Sua" },
];

export function RotatingText() {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % rotatingWords.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getCurrentWord = () => {
    const word = rotatingWords[currentIndex];
    switch (language) {
      case "en":
        return word.en;
      case "es":
        return word.es;
      default:
        return word.pt;
    }
  };

  const getPrefix = () => {
    const word = rotatingWords[currentIndex];
    switch (language) {
      case "en":
        return "Register Your";
      case "es":
        return "Registre Su";
      default:
        return word.ptPrefix;
    }
  };

  return (
    <div className="text-center">
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight">
        <span className="text-primary block mb-2 md:mb-4">
          {language === "en" ? "For only R$49.00" : language === "es" ? "Por solo R$49,00" : "Por apenas R$49,00"}
        </span>
        <span className="text-foreground">
          {getPrefix()}{" "}
          <span
            className={`inline-block text-primary transition-all duration-300 ${
              isAnimating
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            {getCurrentWord()}
          </span>
        </span>
      </h1>
    </div>
  );
}
