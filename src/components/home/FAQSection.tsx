"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Shield,
  Clock,
  Lock,
  FileCheck,
  Scale,
  Search,
  Hash,
  Timer,
  ImageIcon,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  question: string;
  answer: string | React.ReactNode;
  highlighted?: boolean;
}

const faqData: FAQItem[] = [
  {
    id: "blockchain-registro",
    icon: Shield,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    question: "O que é registro em blockchain?",
    answer:
      "Blockchain é uma tecnologia de registro distribuído que cria um histórico imutável e transparente. Ao registrar seu arquivo, geramos um hash criptográfico único que é gravado permanentemente na rede, comprovando que você possuía aquele conteúdo em determinada data.",
  },
  {
    id: "prova-anterioridade",
    icon: Clock,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
    question: "Como funciona a prova de anterioridade?",
    answer:
      "Quando você faz um registro, capturamos a data e hora exata (timestamp) e o hash do seu arquivo. Essa informação é gravada na blockchain, criando uma prova irrefutável de que aquele conteúdo existia naquele momento, antes de qualquer outro registro posterior.",
  },
  {
    id: "permanente-imutavel",
    icon: Lock,
    iconColor: "text-green-500",
    iconBg: "bg-green-500/10",
    question: "Meu registro é permanente e imutável?",
    answer:
      "Sim. Uma vez confirmado na blockchain, o registro não pode ser alterado, excluído ou falsificado. A tecnologia garante que a prova permanecerá íntegra e verificável por tempo indeterminado.",
  },
  {
    id: "tipos-arquivos",
    icon: FileCheck,
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-500/10",
    question: "Quais tipos de arquivos posso registrar?",
    answer:
      "Você pode registrar imagens (logos, artes), documentos (contratos, PDFs), código-fonte, vídeos, músicas, planilhas e qualquer arquivo digital. O sistema aceita diversos formatos e tamanhos.",
  },
  {
    id: "validade-juridica",
    icon: Scale,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
    question: "O registro tem validade jurídica?",
    answer:
      "O registro em blockchain constitui prova técnica de anterioridade reconhecida em processos judiciais. É um documento complementar que pode ser utilizado como evidência em disputas de autoria e propriedade intelectual.",
  },
  {
    id: "verificar-registro",
    icon: Search,
    iconColor: "text-cyan-500",
    iconBg: "bg-cyan-500/10",
    question: "Como posso verificar meu registro?",
    answer:
      "Cada registro gera um certificado com QR Code e link de verificação pública. Qualquer pessoa pode acessar e confirmar a autenticidade do registro de forma independente, sem precisar de login.",
  },
  {
    id: "hash-criptografico",
    icon: Hash,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/10",
    question: "O que é um hash criptográfico?",
    answer:
      'É uma "impressão digital" única do seu arquivo, gerada por algoritmos matemáticos (SHA-256). Qualquer alteração mínima no arquivo gera um hash completamente diferente, garantindo a integridade do conteúdo original.',
  },
  {
    id: "tempo-confirmacao",
    icon: Timer,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-500/10",
    question: "Quanto tempo leva para confirmar o registro?",
    answer:
      "O registro é processado em poucos minutos. Após a confirmação na blockchain, você recebe o certificado digital em PDF por email e pode acessá-lo pelo painel a qualquer momento.",
  },
  {
    id: "marcas-logos",
    icon: ImageIcon,
    iconColor: "text-teal-500",
    iconBg: "bg-teal-500/10",
    question: "Posso registrar marcas e logos?",
    answer:
      "Sim, você pode registrar a imagem da sua marca ou logo como prova de anterioridade. Porém, para proteção legal completa de marca, recomendamos também o registro formal junto ao INPI.",
  },
  {
    id: "inpi-vs-blockchain",
    icon: Scale,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    question: "Qual a diferença entre registro no INPI e blockchain?",
    answer: (
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Scale className="h-4 w-4 text-muted-foreground" />
              INPI
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Registro oficial de marcas no Brasil</li>
              <li>• Processo burocrático (12-24 meses)</li>
              <li>• Confere direito exclusivo de uso</li>
              <li>• Custo mais elevado</li>
              <li>• Necessário para proteção jurídica completa</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Blockchain (WebMarcas)
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Prova técnica de anterioridade</li>
              <li>• Registro instantâneo (minutos)</li>
              <li>• Comprova existência em data específica</li>
              <li>• Custo acessível (R$49)</li>
              <li>• Complementa o registro no INPI</li>
            </ul>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <p className="text-sm font-medium text-foreground">
            <strong className="text-green-600 dark:text-green-400">
              Recomendação:
            </strong>{" "}
            Utilize ambos. O registro em blockchain garante prova imediata
            enquanto aguarda o processo do INPI, formando uma proteção completa
            para sua propriedade intelectual.
          </p>
        </div>
      </div>
    ),
    highlighted: true,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

export function FAQSection() {
  return (
    <section className="section-padding bg-background relative">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Perguntas <span className="text-primary">Frequentes</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Tire suas dúvidas sobre registro em blockchain e proteção de
              propriedade intelectual
            </p>
          </motion.div>

          {/* FAQ Accordion */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqData.map((faq) => (
                <motion.div key={faq.id} variants={itemVariants}>
                  <AccordionItem
                    value={faq.id}
                    className={cn(
                      "border rounded-xl px-4 md:px-6 bg-card transition-all duration-300",
                      "hover:shadow-md hover:border-primary/30",
                      "data-[state=open]:shadow-lg data-[state=open]:border-primary/40",
                      faq.highlighted &&
                        "border-primary/50 bg-gradient-to-r from-primary/5 to-transparent ring-1 ring-primary/20"
                    )}
                  >
                    <AccordionTrigger className="hover:no-underline py-5 gap-4">
                      <div className="flex items-center gap-4 text-left">
                        <div
                          className={cn(
                            "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300",
                            faq.iconBg
                          )}
                        >
                          <faq.icon
                            className={cn(
                              "h-5 w-5 md:h-6 md:w-6",
                              faq.iconColor
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            "font-semibold text-sm md:text-base text-foreground",
                            faq.highlighted && "text-primary"
                          )}
                        >
                          {faq.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 pl-14 md:pl-16 pr-2">
                      {typeof faq.answer === "string" ? (
                        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                          {faq.answer}
                        </p>
                      ) : (
                        faq.answer
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
