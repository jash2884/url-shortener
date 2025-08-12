// db.js
import pg from "pg";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const { Pool } = pg;

// The pool will use the connection string from the .env file
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If deploying to a platform like Render, you might need this
  ssl: {
    rejectUnauthorized: false,
  },
});

export default {
  query: (text, params) => pool.query(text, params),
};
