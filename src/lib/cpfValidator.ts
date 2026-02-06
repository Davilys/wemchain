/**
 * CPF Validation utilities
 * Validates Brazilian CPF numbers using the official algorithm
 */

/**
 * Validates a CPF number using the official algorithm
 * @param cpf - CPF string (with or without formatting)
 * @returns true if valid, false otherwise
 */
export function isValidCPF(cpf: string): boolean {
  // Remove non-digits
  const numbers = cpf.replace(/\D/g, "");

  // Must have exactly 11 digits
  if (numbers.length !== 11) {
    return false;
  }

  // Check for known invalid patterns (all same digits)
  const invalidPatterns = [
    "00000000000",
    "11111111111",
    "22222222222",
    "33333333333",
    "44444444444",
    "55555555555",
    "66666666666",
    "77777777777",
    "88888888888",
    "99999999999",
  ];

  if (invalidPatterns.includes(numbers)) {
    return false;
  }

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(numbers[9])) {
    return false;
  }

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(numbers[10])) {
    return false;
  }

  return true;
}

/**
 * Validates a CNPJ number using the official algorithm
 * @param cnpj - CNPJ string (with or without formatting)
 * @returns true if valid, false otherwise
 */
export function isValidCNPJ(cnpj: string): boolean {
  // Remove non-digits
  const numbers = cnpj.replace(/\D/g, "");

  // Must have exactly 14 digits
  if (numbers.length !== 14) {
    return false;
  }

  // Check for known invalid patterns (all same digits)
  const invalidPatterns = [
    "00000000000000",
    "11111111111111",
    "22222222222222",
    "33333333333333",
    "44444444444444",
    "55555555555555",
    "66666666666666",
    "77777777777777",
    "88888888888888",
    "99999999999999",
  ];

  if (invalidPatterns.includes(numbers)) {
    return false;
  }

  // Validate first check digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(numbers[12])) {
    return false;
  }

  // Validate second check digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(numbers[13])) {
    return false;
  }

  return true;
}

/**
 * Validates a document (CPF or CNPJ) based on length
 * @param document - Document string (with or without formatting)
 * @returns object with isValid flag and error message if invalid
 */
export function validateDocument(document: string): { 
  isValid: boolean; 
  error?: string;
  type?: "CPF" | "CNPJ";
} {
  const numbers = document.replace(/\D/g, "");

  if (numbers.length === 0) {
    return { isValid: false, error: "Informe o CPF ou CNPJ" };
  }

  if (numbers.length <= 11) {
    if (numbers.length !== 11) {
      return { isValid: false, error: "CPF deve ter 11 dígitos" };
    }
    if (!isValidCPF(numbers)) {
      return { isValid: false, error: "CPF inválido. Verifique os números informados." };
    }
    return { isValid: true, type: "CPF" };
  }

  if (numbers.length !== 14) {
    return { isValid: false, error: "CNPJ deve ter 14 dígitos" };
  }
  if (!isValidCNPJ(numbers)) {
    return { isValid: false, error: "CNPJ inválido. Verifique os números informados." };
  }
  return { isValid: true, type: "CNPJ" };
}
