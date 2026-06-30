import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDB(): Promise<Database> {
  if (db) {
    return db;
  }

  const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'study-buddy.db');
db = await open({
  filename: dbPath,
  driver: sqlite3.Database,
});
  await db.exec('PRAGMA foreign_keys = ON');
  return db;
}

export async function runQuery(query: string, params: any[] = []): Promise<any> {
  const database = await getDB();
  return database.run(query, params);
}

export async function getOne(query: string, params: any[] = []): Promise<any> {
  const database = await getDB();
  return database.get(query, params);
}

export async function getAll(query: string, params: any[] = []): Promise<any[]> {
  const database = await getDB();
  return database.all(query, params);
}

export async function transaction(callback: () => Promise<void>): Promise<void> {
  const database = await getDB();
  try {
    await database.exec('BEGIN TRANSACTION');
    await callback();
    await database.exec('COMMIT');
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }
}