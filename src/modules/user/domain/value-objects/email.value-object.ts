import { ValueObject } from './value-object.base';

export class Email extends ValueObject<string> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(value: string) {
    super(value);
  }

  public static create(email: string): Email {
    if (!email || email.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!this.EMAIL_REGEX.test(normalizedEmail)) {
      throw new Error(`Invalid email format: ${email}`);
    }
    if (normalizedEmail.length > 254) {
      throw new Error('Email is too long (max 254 characters)');
    }
    return new Email(normalizedEmail);
  }

  public getDomain(): string {
    return this.value.split('@')[1];
  }

  public getLocalPart(): string {
    return this.value.split('@')[0];
  }

  public isFromDomain(domain: string): boolean {
    return this.getDomain() === domain.toLowerCase();
  }
}
