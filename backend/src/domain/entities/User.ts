/**
 * User entity representing a registered user in the system.
 * Following the Single Responsibility Principle - only manages user data.
 */
export interface UserProps {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export enum UserRole {
    ADMIN = 'admin',
    VIEWER = 'viewer',
}

export class User {
    private constructor(private readonly props: UserProps) { }

    static create(props: UserProps): User {
        return new User(props);
    }

    static createNew(email: string, passwordHash: string, role: UserRole = UserRole.VIEWER): User {
        const now = new Date();
        return new User({
            id: '', // Will be set by repository
            email,
            passwordHash,
            role,
            createdAt: now,
            updatedAt: now,
        });
    }

    get id(): string {
        return this.props.id;
    }

    get email(): string {
        return this.props.email;
    }

    get passwordHash(): string {
        return this.props.passwordHash;
    }

    get role(): UserRole {
        return this.props.role;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    isAdmin(): boolean {
        return this.role === UserRole.ADMIN;
    }

    toJSON(): UserProps {
        return { ...this.props };
    }
}
