import { Email, Password } from '../value-objects';

export class User {
  private readonly id: string;
  private email: Email;
  private password: Password;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: string,
    email: Email,
    password: Password,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  public static async create(email: Email, password: Password): Promise<User> {
    if (password.getIsHashed()) {
      throw new Error('Cannot create user with already hashed password');
    }

    const hashedPassword = await password.hash();
    const id = this.generateId();
    const now = new Date();
    return new User(id, email, hashedPassword, now, now);
  }

  /**
   * @param id - ID del usuario en BD
   * @param email - Email del usuario
   * @param password - Password ya hasheada
   * @param createdAt - Fecha de creación original
   * @param updatedAt - Fecha de última actualización
   * @returns Una instancia de User reconstituida
   */
  public static reconstitute(
    id: string,
    email: Email,
    password: Password,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    return new User(id, email, password, createdAt, updatedAt);
  }
  public changeEmail(newEmail: Email): void {
    if (this.email.equals(newEmail)) {
      throw new Error('New email is the same as current email');
    }
    this.email = newEmail;
    this.updatedAt = new Date();
  }
  public async changePassword(
    oldPassword: string,
    newPassword: Password,
  ): Promise<void> {
    const isOldPasswordCorrect = await this.password.compare(oldPassword);
    if (!isOldPasswordCorrect) {
      throw new Error('Current password is incorrect');
    }
    if (newPassword.getIsHashed()) {
      throw new Error('New password must not be hashed');
    }
    this.password = await newPassword.hash();
    this.updatedAt = new Date();
  }
  public async verifyPassword(plainPassword: string): Promise<boolean> {
    return this.password.compare(plainPassword);
  }
  public getId(): string {
    return this.id;
  }

  public getEmail(): Email {
    return this.email;
  }

  public getPassword(): Password {
    return this.password;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
  public toPlainObject(): {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      email: this.email.getValue(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
  private static generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
