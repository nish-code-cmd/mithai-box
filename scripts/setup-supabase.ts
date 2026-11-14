import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// Helper to load .env.local if not loaded by runner
function loadEnvLocal() {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

async function main() {
  loadEnvLocal();
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL or SUPABASE_DB_URL environment variable is missing.');
    console.error('Please provide your Supabase Postgres connection string.');
    process.exit(1);
  }

  console.log('🔄 Connecting to Supabase PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully!');

    // Read the master SQL migration script
    const sqlPath = path.join(__dirname, '../supabase/migrations/20261114_production_master.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Migration file not found at: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('🚀 Running database schema setup (tables, triggers, policies, and seed data)...');

    await client.query(sql);

    console.log('🎉 SUCCESS! All tables, RLS policies, triggers, categories, and products created!');

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n📊 Verified Tables in Public Schema:');
    res.rows.forEach((r, idx) => {
      console.log(`  ${idx + 1}. ${r.table_name}`);
    });

    const prodCount = await client.query('SELECT count(*) FROM public.products;');
    const catCount = await client.query('SELECT count(*) FROM public.categories;');
    console.log(`\n📦 Seed Summary: ${catCount.rows[0].count} categories, ${prodCount.rows[0].count} products pre-seeded.\n`);

    await client.end();
  } catch (error: any) {
    console.error('❌ Database migration failed:', error.message);
    process.exit(1);
  }
}

main();
