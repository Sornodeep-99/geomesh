// index.js
require('dotenv').config();
const express = require('express');
const http = require('http'); // **NEW**: Import http module
const { WebSocketServer } = require('ws'); // **NEW**: Import WebSocketServer
const { Pool } = require('pg');
const cors = require('cors'); // **NEW**: Import cors


const app = express();
app.use(cors()); // **NEW**: Enable CORS for all routes


const server = http.createServer(app); // **NEW**: Create an HTTP server from our Express app
const wss = new WebSocketServer({ server }); // **NEW**: Attach WebSocket server to the HTTP server

const port = 3000;
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// **NEW**: WebSocket connection handling
wss.on('connection', ws => {
  console.log('✅ Client connected to WebSocket');
  ws.on('close', () => console.log('❌ Client disconnected'));
});

// **NEW**: Broadcast function
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// --- API ENDPOINTS ---
app.get('/api/posts', async (req, res) => {
  // ... GET endpoint code from Step 9 remains the same
  try {
    const { latitude, longitude, radius = 2000 } = req.query; 
    if (!latitude || !longitude) return res.status(400).json({ error: 'Latitude and longitude are required.' });
    const sql = `SELECT id, content, user_id, expires_at, ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude, ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as distance_meters FROM posts WHERE expires_at > NOW() AND ST_DWithin(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3) ORDER BY distance_meters ASC;`;
    const values = [longitude, latitude, radius];
    const { rows } = await pool.query(sql, values);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching nearby posts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { content, userId, expiresInMinutes, latitude, longitude } = req.body;
    if (!content || !userId || !expiresInMinutes || !latitude || !longitude) return res.status(400).json({ error: 'Missing required fields.' });
    const sql = `INSERT INTO posts (content, user_id, expires_at, location) VALUES ($1, $2, NOW() + ($3 * INTERVAL '1 minute'), ST_SetSRID(ST_MakePoint($4, $5), 4326)) RETURNING *;`;
    const values = [content, userId, expiresInMinutes, longitude, latitude];
    const result = await pool.query(sql, values);
    const newPost = result.rows[0]; // **NEW**: Get the created post

    broadcast({ type: 'NEW_POST', payload: newPost }); // **NEW**: Broadcast the new post

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- SERVER STARTUP ---
// **MODIFIED**: Use server.listen instead of app.listen
server.listen(port, () => {
  console.log(`🚀 Server with WebSocket running at http://localhost:${port}`);
});