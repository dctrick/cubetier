import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditIcon, TrashIcon, TrophyIcon, GlobeIcon, AwardIcon, RefreshCwIcon, SearchIcon } from 'lucide-react';

interface Player {
  id: number;
  playerName: string;
  playerTitle: string;
  rank: string;
  points: number;
  tierClass: string;
  maceTier: string;
  region: string;
}

const PlayersPage = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try external API first, fallback to local if needed
      let response;
      try {
        response = await fetch('https://tiers.cubenetwork.fun/api/players');
      } catch (externalError) {
        // Fallback to local API
        response = await fetch('http://localhost:3001/api/players');
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      
      const data = await response.json();
      const playersData = Array.isArray(data) ? data : data.players || [];
      setPlayers(playersData);
      setFilteredPlayers(playersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (playerId: number, playerName: string) => {
    if (!confirm(`Are you sure you want to delete ${playerName}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/players/${playerId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete player');
      }

      setPlayers(players.filter(p => p.id !== playerId));
    } catch (err) {
      alert(`Error deleting player: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (player: Player) => {
    // Store player data for editing
    localStorage.setItem('editingPlayer', JSON.stringify(player));
    navigate(`/form?edit=${player.id}`);
  };

  // Filter players based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPlayers(players);
    } else {
      const filtered = players.filter(player =>
        player.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.playerTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (player.tierClass && player.tierClass.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (player.maceTier && player.maceTier.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPlayers(filtered);
    }
  }, [searchTerm, players]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <RefreshCwIcon className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading players...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchPlayers}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gray-800/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-700/15 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Player Management</h1>
          <p className="text-gray-400 mb-6">Manage all registered players</p>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/80 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {searchTerm ? 'No players found matching your search' : 'No players found'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="bg-black/60 backdrop-blur-lg rounded-xl border border-gray-800 p-6 transition-all duration-300 hover:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{player.playerName}</h3>
                        <p className="text-gray-400 text-sm">{player.playerTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{player.points}</p>
                        <p className="text-gray-400 text-sm">Points</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <TrophyIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-white font-medium">Tier</p>
                          <p className="text-gray-400">{player.tierClass || 'Not set'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <AwardIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-white font-medium">Mace Tier</p>
                          <p className="text-gray-400">{player.maceTier || 'Not set'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <GlobeIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-white font-medium">Region</p>
                          <p className="text-gray-400">{player.region}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-6">
                    <button
                      onClick={() => handleEdit(player)}
                      className="bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 hover:text-blue-300 p-2 rounded-lg transition-all duration-200 border border-blue-800/50 hover:border-blue-700"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(player.id, player.playerName)}
                      className="bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 p-2 rounded-lg transition-all duration-200 border border-red-800/50 hover:border-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersPage;
