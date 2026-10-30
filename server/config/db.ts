import pg from 'pg';
import { newDb, DataType } from 'pg-mem';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

export interface QueryResult<T = any> {
  rows: T[];
  rowCount?: number;
}

export interface IDatabase {
  query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
}

let activeDb: IDatabase;

// Initialize Database
async function initDatabase(): Promise<IDatabase> {
  const databaseUrl = process.env.DATABASE_URL;

  // Attempt real PostgreSQL connection if DATABASE_URL is defined and not default placeholder
  if (databaseUrl && !databaseUrl.includes('username:password') && !databaseUrl.includes('localhost:5432/nexusai')) {
    try {
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });

      // Quick test query
      await pool.query('SELECT 1');
      console.log(' Connected to external PostgreSQL database via pg Pool');

      // Initialize tables
      await pool.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tickets (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            category VARCHAR(50) NOT NULL CHECK (category IN ('IT_SUPPORT', 'HR_REQUEST', 'FACILITIES', 'GENERAL')),
            status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
            priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS chats (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'model')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      return pool;
    } catch (err) {
      console.warn(' External PostgreSQL not reachable, initializing embedded in-memory PostgreSQL engine...', err);
    }
  }

  // Fallback to high-performance embedded pg-mem engine
  console.log('⚡ Initializing embedded PostgreSQL engine (pg-mem) with full SQL conformance...');
  const memDb = newDb({
    autoCreateForeignKeyIndices: true,
  });

  // Register uuid-ossp extension
  memDb.registerExtension('uuid-ossp', (schema) => {
    schema.registerFunction({
      name: 'uuid_generate_v4',
      returns: DataType.text,
      impure: true,
      implementation: () => randomUUID(),
    });
  });

  // Schema DDL execution
  memDb.public.none(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL CHECK (category IN ('IT_SUPPORT', 'HR_REQUEST', 'FACILITIES', 'GENERAL')),
        status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
        priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'model')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const pgAdapter = memDb.adapters.createPg();
  const pool = new pgAdapter.Pool();

  // Seed demo enterprise user & initial tickets if empty
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);
  const demoUserId = '00000000-0000-4000-8000-000000000001';

  try {
    await pool.query(
      `INSERT INTO users (id, email, password_hash, full_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [demoUserId, 'alex.morgan@nexusai.corp', defaultPasswordHash, 'Alex Morgan']
    );

    // Initial tickets for demo user
    await pool.query(
      `INSERT INTO tickets (id, user_id, title, description, category, status, priority)
       VALUES 
       ($1, $2, 'Ergonomic Curved Monitor Request', 'Dual 27-inch 4K setup requested for Engineering productivity & workspace ergonomics.', 'IT_SUPPORT', 'IN_PROGRESS', 'MEDIUM'),
       ($3, $2, 'Annual Parental Leave Policy Inquiry & Dates', 'Requested 8 weeks paid parental leave for upcoming child birth starting next month.', 'HR_REQUEST', 'RESOLVED', 'HIGH'),
       ($4, $2, '4th Floor Conference Room AC Adjustment', 'Conference room 4B HVAC is cooling excessively down to 62°F. Requested calibration to 71°F.', 'FACILITIES', 'OPEN', 'LOW')
       ON CONFLICT (id) DO NOTHING`,
      [
        '00000000-0000-4000-8000-000000000011',
        demoUserId,
        '00000000-0000-4000-8000-000000000012',
        '00000000-0000-4000-8000-000000000013',
      ]
    );

    // Initial chat history
    await pool.query(
      `INSERT INTO chats (id, user_id, message, role)
       VALUES 
       ($1, $2, 'Hi NexusAI! Can you tell me what the company policy is regarding parental leave?', 'user'),
       ($3, $2, 'Under our Enterprise People & Culture Guidelines, all full-time employees are eligible for up to 12 weeks of fully paid parental leave within the first 12 months of birth or adoption. You can submit your planned schedule directly through me anytime.', 'model')
       ON CONFLICT (id) DO NOTHING`,
      [
        '00000000-0000-4000-8000-000000000021',
        demoUserId,
        '00000000-0000-4000-8000-000000000022',
      ]
    );
  } catch (seedErr) {
    console.error('Error seeding demo data:', seedErr);
  }

  console.log(' PostgreSQL database initialized with enterprise schema & demo data ready.');
  return pool as unknown as IDatabase;
}

// Global query wrapper
export const db = {
  async query<T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
    if (!activeDb) {
      activeDb = await initDatabase();
    }
    return activeDb.query<T>(text, params);
  },
};

export default db;
