/**
 * Document formatting utilities for CPF and CNPJ
 * Use these functions across the application for consistent formatting
 */

/**
 * Format a CPF number with mask: 000.000.000-00
 */
export function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  return numbers
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/**
 * Format a CNPJ number with mask: 00.000.000/0000-00
 */
export function formatCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 14);
  return numbers
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

/**
 * Format a document (CPF or CNPJ) based on its type
 */
export function formatDocument(value: string, type: "CPF" | "CNPJ"): string {
  if (type === "CPF") {
    return formatCPF(value);
  }
  return formatCNPJ(value);
}

/**
 * Get only the numbers from a formatted document string
 */
export function getDocumentNumbers(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Validate if a CPF has the correct format (11 digits)
 */
export function isValidCPFFormat(value: string): boolean {
  const numbers = value.replace(/\D/g, "");
  return numbers.length === 11;
}

/**
 * Validate if a CNPJ has the correct format (14 digits)
 */
export function isValidCNPJFormat(value: string): boolean {
  const numbers = value.replace(/\D/g, "");
  return numbers.length === 14;
}

/**
 * Validate if a document has the correct format based on type
 */
export function isValidDocumentFormat(value: string, type: "CPF" | "CNPJ"): boolean {
  if (type === "CPF") {
    return isValidCPFFormat(value);
  }
  return isValidCNPJFormat(value);
}

/**
 * Get the placeholder for a document input based on type
 */
export function getDocumentPlaceholder(type: "CPF" | "CNPJ"): string {
  return type === "CPF" ? "000.000.000-00" : "00.000.000/0000-00";
}

/**
 * Get the max length for a formatted document input based on type
 */
export function getDocumentMaxLength(type: "CPF" | "CNPJ"): number {
  return type === "CPF" ? 14 : 18;
}

/**
 * Format a document for display (auto-detect CPF or CNPJ based on length)
 */
export function formatDocumentForDisplay(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 11) {
    return formatCPF(numbers);
  }
  return formatCNPJ(numbers);
}
