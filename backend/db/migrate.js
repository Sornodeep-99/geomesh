// db/migrate.js
const path = require('path');
// Correctly point to the .env file in the project root
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); 

const fs = require('fs');
const { Pool } = require('pg');

// Let's check if the DATABASE_URL is being loaded correctly
console.log('Is DATABASE_URL loaded?', process.env.DATABASE_URL ? 'Yes' : 'No');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    const client = await pool.connect();
    console.log('🚀 Starting migration...');

    const sql = fs.readFileSync(__dirname + '/schema.sql', 'utf8');
    await client.query(sql);

    console.log('✅ Migration completed successfully!');
    client.release();
  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await pool.end();
  }
}

runMigration();