# Cubetiers Admin Panel

A premium admin panel for managing Cubetiers players with authentication and full CRUD operations.

## Features ✨

### 🔐 **Authentication**
- Private login using Gmail credentials from `cred.json`
- Session persistence with localStorage
- Protected routes - only accessible after login

### 🎯 **Navigation**
- **Add Player**: Create new player entries
- **Manage Players**: View, edit, and delete existing players
- **Logout**: Secure logout functionality

### 📊 **Player Management**
- **View Players**: Shows all players with their stats
- **Add Players**: Form with tier validation and point calculation
- **Edit Players**: Modify existing player information
- **Delete Players**: Remove players with confirmation

### 🏆 **Tier System**
- **Tier Points**: LT5(1), HT5(2), LT4(3), HT4(4), LT3(6), HT3(10), LT2(20), HT2(30), LT1(45), HT1(60)
- **Combined Points**: Tier + Macetier = Total Points
- **Auto Titles**: Rookie → Combat Novice → Combat Cadet → Combat Specialist → Combat Ace → Combat Master

### 🎨 **Premium UI**
- Clean black theme with blur effects
- Smooth transitions and hover states
- Responsive design
- Lucide React icons (no emojis)

## Database Schema 📋

```sql
CREATE TABLE players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  playerName VARCHAR(255),
  playerTitle VARCHAR(255),
  rank VARCHAR(255),
  points INT,
  tierClass VARCHAR(255),  -- Stores main tier
  maceTier VARCHAR(255),   -- Stores mace tier
  region VARCHAR(255)
);
```

## Setup Instructions 🚀

1. **Configure Database**:
   - Update `.env` with your database credentials
   - Ensure the `players` table exists

2. **Set Login Credentials**:
   - Update `cred.json` with your Gmail and password

3. **Run Application**:
   ```bash
   # Start backend server (port 3001)
   npm run server
   
   # Start frontend (port 5173)
   npm run dev
   ```

## API Endpoints 🔌

- `POST /api/players` - Create new player
- `GET /api/players` - Get all players
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

## External API Integration 🌐

The players list page can fetch data from:
- Primary: `https://tiers.cubenetwork.fun/api/players`
- Fallback: Local API endpoint

## Security Features 🛡️

- Credentials stored in gitignored files
- Session-based authentication
- Protected API endpoints
- Input validation and sanitization
- SQL injection prevention

## Usage Flow 📱

1. **Login** → Enter Gmail/password from cred.json
2. **Add Player** → Fill form with at least one tier
3. **View Players** → See all players with stats
4. **Edit Player** → Click edit button, modify, save
5. **Delete Player** → Click delete button, confirm
6. **Logout** → Secure logout to login screen

Ready to manage your Cubetiers players! 🎮
