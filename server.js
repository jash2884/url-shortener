// server.js
import express from "express";
import { nanoid } from "nanoid";
import db from "./db.js";
import cors from "cors"; // 1. Import cors

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // 2. Use cors middleware
app.use(express.json());

// === API Endpoints ===

// 1. POST /api/shorten -> Shorten a new URL
app.post("/api/shorten", async (req, res) => {
  const { longUrl } = req.body;

  // Basic validation for the long URL
  if (!longUrl || !longUrl.startsWith("http")) {
    return res
      .status(400)
      .json({ error: "A valid longUrl starting with http/https is required." });
  }

  const shortCode = nanoid(8); // Generate an 8-character code

  try {
    const query =
      "INSERT INTO urls(short_code, long_url) VALUES($1, $2) RETURNING short_code";
    const result = await db.query(query, [shortCode, longUrl]);

    // Construct the full short URL to return to the user
    const shortUrl = `${req.protocol}://${req.get("host")}/${
      result.rows[0].short_code
    }`;

    res.status(201).json({ shortUrl });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 2. GET /:shortCode -> Redirect to the original URL
app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    const query = "SELECT long_url FROM urls WHERE short_code = $1";
    const result = await db.query(query, [shortCode]);

    if (result.rows.length > 0) {
      const { long_url } = result.rows[0];
      // Redirect the user
      return res.redirect(301, long_url);
    } else {
      return res.status(404).send("URL not found.");
    }
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Internal server error.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
