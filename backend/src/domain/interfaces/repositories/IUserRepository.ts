import { User } from '../../entities/User.js';

/**
 * IUserRepository interface - abstracts user data persistence.
 * Follows Interface Segregation Principle with focused methods.
 */
export interface IUserRepository {
    /**
     * Find a user by their unique ID
     */
    findById(id: string): Promise<User | null>;

    /**
     * Find a user by their email address
     */
    findByEmail(email: string): Promise<User | null>;

    /**
     * Persist a new user or update an existing one
     */
    save(user: User): Promise<User>;

    /**
     * Delete a user by their ID
     */
    delete(id: string): Promise<void>;

    /**
     * Check if email already exists
     */
    existsByEmail(email: string): Promise<boolean>;
}
