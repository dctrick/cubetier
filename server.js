import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

dotenv.config();

// Remove the block that checks for IS_DEV_SCRIPT and spawns npm run dev

const app = express();
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Tier points mapping
const tierPoints = {
  "LT5": 1,
  "HT5": 2,
  "LT4": 3,
  "HT4": 4,
  "LT3": 6,
  "HT3": 10,
  "LT2": 20,
  "HT2": 30,
  "LT1": 45,
  "HT1": 60
};

// Calculate points from tiers
const calculatePoints = (tier, macetier) => {
  const tierValue = tier ? tierPoints[tier.toUpperCase()] || 0 : 0;
  const macetierValue = macetier ? tierPoints[macetier.toUpperCase()] || 0 : 0;
  return tierValue + macetierValue;
};

// Get player title based on points
const getPlayerTitle = (points) => {
  if (points > 250) return "Combat Master";
  if (points >= 100) return "Combat Ace";
  if (points >= 50) return "Combat Specialist";
  if (points >= 20) return "Combat Cadet";
  if (points >= 10) return "Combat Novice";
  return "Rookie";
};

// Validate tier
const isValidTier = (tier) => {
  const validTiers = ["LT5", "HT5", "LT4", "HT4", "LT3", "HT3", "LT2", "HT2", "LT1", "HT1"];
  return validTiers.includes(tier.toUpperCase());
};

// API endpoint to add player
app.post('/api/players', async (req, res) => {
  try {
    const { playerName, tier, macetier, region } = req.body;
    
    // Validation
    if (!playerName || !playerName.trim()) {
      return res.status(400).json({ error: 'Player name is required' });
    }
    
    if (!region || !region.trim()) {
      return res.status(400).json({ error: 'Region is required' });
    }
    
    if (!tier.trim() && !macetier.trim()) {
      return res.status(400).json({ error: 'At least one tier is required' });
    }
    
    if (tier.trim() && !isValidTier(tier)) {
      return res.status(400).json({ error: 'Invalid tier format' });
    }
    
    if (macetier.trim() && !isValidTier(macetier)) {
      return res.status(400).json({ error: 'Invalid macetier format' });
    }
    
    // Calculate points and determine title
    const points = calculatePoints(tier, macetier);
    const playerTitle = getPlayerTitle(points);
    
    // Insert into database
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [result] = await connection.execute(
        'INSERT INTO players (playerName, playerTitle, points, tierClass, region, maceTier) VALUES (?, ?, ?, ?, ?, ?)',
        [
          playerName.trim(),
          playerTitle,
          points,
          tier.trim() || null,
          region.trim(),
          macetier.trim() || null
        ]
      );
      
      res.status(201).json({
        message: 'Player added successfully',
        player: {
          id: result.insertId,
          playerName: playerName.trim(),
          playerTitle,
          points,
          tierClass: tier.trim() || null,
          maceTier: macetier.trim() || null,
          region: region.trim()
        }
      });
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('Error adding player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all players endpoint
app.get('/api/players', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM players ORDER BY id DESC, tierClass DESC, region ASC, rank ASC, maceTier ASC'
      );
      
      res.json(rows);
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update player endpoint
app.put('/api/players/:id', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    const { playerName, tier, macetier, region } = req.body;
    
    if (isNaN(playerId)) {
      return res.status(400).json({ error: 'Invalid player ID' });
    }
    
    // Validation
    if (!playerName || !playerName.trim()) {
      return res.status(400).json({ error: 'Player name is required' });
    }
    
    if (!region || !region.trim()) {
      return res.status(400).json({ error: 'Region is required' });
    }
    
    if (!tier.trim() && !macetier.trim()) {
      return res.status(400).json({ error: 'At least one tier is required' });
    }
    
    if (tier.trim() && !isValidTier(tier)) {
      return res.status(400).json({ error: 'Invalid tier format' });
    }
    
    if (macetier.trim() && !isValidTier(macetier)) {
      return res.status(400).json({ error: 'Invalid macetier format' });
    }
    
    // Calculate points and determine title
    const points = calculatePoints(tier, macetier);
    const playerTitle = getPlayerTitle(points);
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [result] = await connection.execute(
        'UPDATE players SET playerName = ?, playerTitle = ?, points = ?, tierClass = ?, region = ?, maceTier = ? WHERE id = ?',
        [
          playerName.trim(),
          playerTitle,
          points,
          tier.trim() || null,
          region.trim(),
          macetier.trim() || null,
          playerId
        ]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      res.json({
        message: 'Player updated successfully',
        player: {
          id: playerId,
          playerName: playerName.trim(),
          playerTitle,
          points,
          tierClass: tier.trim() || null,
          maceTier: macetier.trim() || null,
          region: region.trim()
        }
      });
      
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete player endpoint
app.delete('/api/players/:id', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    
    if (isNaN(playerId)) {
      return res.status(400).json({ error: 'Invalid player ID' });
    }
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [result] = await connection.execute(
        'DELETE FROM players WHERE id = ?',
        [playerId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      res.json({ message: 'Player deleted successfully' });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
