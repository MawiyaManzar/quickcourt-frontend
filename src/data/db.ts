import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@bore.pub:4724/quickcourt';

export const pool = new Pool({
  connectionString,
  ssl: false
});

// Helper function to query the database
export const query = (text: string, params?: any[]) => pool.query(text, params);
