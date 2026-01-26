import knex, { Knex } from 'knex';
import { config } from '../../config/index.js';
import { logger } from '../../shared/utils/logger.js';

/**
 * MySQL database connection using Knex.js query builder.
 * Singleton pattern ensures single connection pool.
 */
class MySQLConnection {
    private static instance: Knex | null = null;

    private constructor() { }

    static getInstance(): Knex {
        if (!MySQLConnection.instance) {
            MySQLConnection.instance = knex({
                client: 'mysql2',
                connection: {
                    host: config.database.host,
                    port: config.database.port,
                    user: config.database.user,
                    password: config.database.password,
                    database: config.database.name,
                },
                pool: {
                    min: 2,
                    max: 10,
                    acquireTimeoutMillis: 30000,
                    createTimeoutMillis: 30000,
                    destroyTimeoutMillis: 5000,
                    idleTimeoutMillis: 30000,
                    reapIntervalMillis: 1000,
                    createRetryIntervalMillis: 100,
                },
                acquireConnectionTimeout: 10000,
            });

            // Test connection
            MySQLConnection.instance.raw('SELECT 1')
                .then(() => {
                    logger.info('✅ Database connection established');
                })
                .catch((err) => {
                    logger.error('❌ Database connection failed:', err);
                });
        }

        return MySQLConnection.instance;
    }

    static async disconnect(): Promise<void> {
        if (MySQLConnection.instance) {
            await MySQLConnection.instance.destroy();
            MySQLConnection.instance = null;
            logger.info('Database connection closed');
        }
    }
}

export const db = MySQLConnection.getInstance();
export { MySQLConnection };
