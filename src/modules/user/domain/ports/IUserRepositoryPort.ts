import { User } from '../entities';
import { Email } from '../value-objects';

export interface IUserRepositoryPort {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  existsByEmail(email: Email): Promise<boolean>;
  delete(id: string): Promise<void>;
  findAll(page: number, limit: number): Promise<User[]>;
}
