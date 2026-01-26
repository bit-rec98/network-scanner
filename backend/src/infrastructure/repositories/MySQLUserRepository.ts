import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository.js';
import { User, UserRole } from '../../domain/entities/User.js';
import { db } from '../database/MySQLConnection.js';

/**
 * MySQLUserRepository - MySQL implementation of IUserRepository.
 * Follows Repository Pattern for data access abstraction.
 */
export class MySQLUserRepository implements IUserRepository {
    private readonly tableName = 'users';

    async findById(id: string): Promise<User | null> {
        const row = await db(this.tableName)
            .where('id', id)
            .first();

        return row ? this.mapToEntity(row) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const row = await db(this.tableName)
            .where('email', email)
            .first();

        return row ? this.mapToEntity(row) : null;
    }

    async save(user: User): Promise<User> {
        const id = user.id || uuidv4();
        const data = {
            id,
            email: user.email,
            password_hash: user.passwordHash,
            role: user.role,
            created_at: user.createdAt,
            updated_at: new Date(),
        };

        await db(this.tableName)
            .insert(data)
            .onConflict('id')
            .merge(['email', 'password_hash', 'role', 'updated_at']);

        return User.create({
            ...user.toJSON(),
            id,
        });
    }

    async delete(id: string): Promise<void> {
        await db(this.tableName)
            .where('id', id)
            .delete();
    }

    async existsByEmail(email: string): Promise<boolean> {
        const result = await db(this.tableName)
            .where('email', email)
            .count('* as count')
            .first();

        return (result?.count as number) > 0;
    }

    private mapToEntity(row: Record<string, unknown>): User {
        return User.create({
            id: row.id as string,
            email: row.email as string,
            passwordHash: row.password_hash as string,
            role: row.role as UserRole,
            createdAt: new Date(row.created_at as string),
            updatedAt: new Date(row.updated_at as string),
        });
    }
}
