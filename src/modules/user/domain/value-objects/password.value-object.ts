import * as bcrypt from 'bcrypt';
import { ValueObject } from './value-object.base';

export class Password extends ValueObject<string> {
  private static readonly MIN_LENGTH = 8;
  private static readonly BCRYPT_ROUNDS = 10;
  private readonly isHashed: boolean;

  private constructor(value: string, isHashed: boolean = false) {
    super(value);
    this.isHashed = isHashed;
  }

  public static create(plainPassword: string): Password {
    if (!plainPassword || plainPassword.trim().length === 0) {
      throw new Error('Password cannot be empty');
    }

    if (plainPassword.length < this.MIN_LENGTH) {
      throw new Error(
        `Password must be at least ${this.MIN_LENGTH} characters long`,
      );
    }

    if (!/[a-zA-Z]/.test(plainPassword)) {
      throw new Error('Password must contain at least one letter');
    }

    if (!/\d/.test(plainPassword)) {
      throw new Error('Password must contain at least one number');
    }

    return new Password(plainPassword, false);
  }

  public static fromHash(hashedPassword: string): Password {
    return new Password(hashedPassword, true);
  }

  public async hash(): Promise<Password> {
    if (this.isHashed) {
      return this;
    }

    const hashedPassword = await bcrypt.hash(
      this.value,
      Password.BCRYPT_ROUNDS,
    );

    return new Password(hashedPassword, true);
  }

  public async compare(plainPassword: string): Promise<boolean> {
    if (!this.isHashed) {
      throw new Error('Cannot compare against an unhashed password');
    }

    return bcrypt.compare(plainPassword, this.value);
  }

  public getIsHashed(): boolean {
    return this.isHashed;
  }

  public equals(vo?: ValueObject<string>): boolean {
    return this === vo;
  }
}
