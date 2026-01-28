import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const whatsappNumber = "5511911120225";
  const whatsappMessage = encodeURIComponent(t("footer.whatsapp.message"));

  return (
    <footer className="bg-card border-t border-border/30">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img src={webmarcasLogo} alt="WebMarcas" className="h-10 w-10 object-contain" />
              <span className="text-xl font-bold text-foreground tracking-tight">
                <span>Web</span>
                <span className="text-primary">Marcas</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("footer.description")}
            </p>
            <a 
              href="https://www.webpatentes.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
            >
              {t("footer.company")} →
            </a>
          </div>

          {/* Links Rápidos */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold">{t("footer.quickLinks")}</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/como-funciona" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                {t("footer.howItWorks")}
              </Link>
              <Link to="/servicos" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                {t("footer.services")}
              </Link>
              <Link to="/vantagens" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                {t("footer.advantages")}
              </Link>
              <Link to="/verificar-registro" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                {t("footer.publicVerification")}
              </Link>
              <Link to="/verificar" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                {t("footer.verifyHash")}
              </Link>
            </nav>
          </div>

          {/* Área do Cliente */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold">{t("footer.clientArea")}</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                {t("footer.accessAccount")}
              </Link>
              <Link to="/cadastro" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                {t("footer.createAccount")}
              </Link>
              <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                {t("footer.myRecords")}
              </Link>
              <Link to="/privacidade" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                {t("footer.privacy")}
              </Link>
            </nav>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold">{t("footer.contact")}</h4>
            <div className="flex flex-col gap-3">
              <a 
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                (11) 91112-0225
              </a>
              <a 
                href="tel:+5511911120225"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                <Phone className="h-4 w-4" />
                (11) 91112-0225
              </a>
              <a 
                href="mailto:ola@webmarcas.net"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                <Mail className="h-4 w-4" />
                ola@webmarcas.net
              </a>
              <div className="flex items-start gap-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>São Paulo, SP - Brasil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transparency Notice */}
        <div className="border-t border-border/30 mt-12 pt-6">
          <p className="text-center text-muted-foreground/60 text-xs italic max-w-2xl mx-auto leading-relaxed">
            {t("footer.disclaimer")}
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/30 mt-6 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p className="text-muted-foreground/60 text-sm">
              © {currentYear} WebMarcas. {t("footer.copyright")}
            </p>
            <span className="hidden md:inline text-muted-foreground/40">|</span>
            <a 
              href="https://www.webpatentes.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground/60 hover:text-primary transition-colors text-sm"
            >
              Grupo WebPatentes
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link to="/termos-de-uso" className="text-muted-foreground/60 hover:text-primary transition-colors text-sm">
              {t("footer.terms")}
            </Link>
            <Link to="/politica-privacidade" className="text-muted-foreground/60 hover:text-primary transition-colors text-sm">
              {t("footer.privacyPolicy")}
            </Link>
            <Link to="/politica-blockchain" className="text-muted-foreground/60 hover:text-primary transition-colors text-sm">
              {t("footer.blockchainPolicy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
