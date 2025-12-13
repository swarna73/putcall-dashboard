import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
  email?: string;
}

/**
 * Validates email format using regex
 */
function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates email domain has MX records (real email server)
 */
async function validateEmailDomain(email: string): Promise<boolean> {
  try {
    const domain = email.split('@')[1];
    const addresses = await resolveMx(domain);
    return addresses && addresses.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Validates email format and domain
 */
export async function validateEmail(email: string): Promise<EmailValidationResult> {
  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // Check if empty
  if (!normalizedEmail) {
    return {
      valid: false,
      error: 'Email address is required',
    };
  }

  // Check format
  if (!validateEmailFormat(normalizedEmail)) {
    return {
      valid: false,
      error: 'Invalid email format',
    };
  }

  // Check for disposable email domains
  const disposableDomains = [
    'tempmail.com',
    'guerrillamail.com',
    '10minutemail.com',
    'throwaway.email',
    'mailinator.com',
    'temp-mail.org',
    'yopmail.com',
  ];

  const domain = normalizedEmail.split('@')[1];
  if (disposableDomains.includes(domain)) {
    return {
      valid: false,
      error: 'Disposable email addresses are not allowed',
    };
  }

  // Verify domain has MX records
  const domainValid = await validateEmailDomain(normalizedEmail);
  if (!domainValid) {
    return {
      valid: false,
      error: 'Email domain does not exist or cannot receive emails',
    };
  }

  return {
    valid: true,
    email: normalizedEmail,
  };
}
