import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const whatsappNumber = "5511911120225"; // WebMarcas: (11) 91112-0225
  const whatsappMessage = encodeURIComponent(
    "Olá! Gostaria de saber mais sobre o registro de marcas em blockchain da WebMarcas."
  );

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <MessageCircle className="h-7 w-7 text-white" fill="white" />
    </a>
  );
}
