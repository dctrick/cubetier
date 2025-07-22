import React, { useState, useEffect } from 'react';
import { UserIcon, TrophyIcon, MapIcon, GlobeIcon, AwardIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { insertPlayer, isValidTier } from '../utils/database';

const FormPage = () => {
  const [playerName, setPlayerName] = useState('');
  const [tier, setTier] = useState('');
  const [macetier, setMacetier] = useState('');
  const [region, setRegion] = useState('');
  const [errors, setErrors] = useState({
    playerName: '',
    tier: '',
    macetier: '',
    region: '',
    tierRequired: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);

  // Check if we're editing a player
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
      const editingPlayer = localStorage.getItem('editingPlayer');
      if (editingPlayer) {
        const player = JSON.parse(editingPlayer);
        setPlayerName(player.playerName);
        setTier(player.tierClass || '');
        setMacetier(player.maceTier || '');
        setRegion(player.region);
        setIsEditing(true);
        setEditingPlayerId(player.id);
        localStorage.removeItem('editingPlayer');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    const newErrors = {
      playerName: '',
      tier: '',
      macetier: '',
      region: '',
      tierRequired: ''
    };
    
    // Validate required fields
    if (!playerName.trim()) newErrors.playerName = 'Player name is required';
    if (!region.trim()) newErrors.region = 'Region is required';
    
    // Validate that at least one tier is filled
    if (!tier.trim() && !macetier.trim()) {
      newErrors.tierRequired = 'At least one tier (Tier or Macetier) is required';
    }
    
    // Validate tier formats if provided
    if (tier.trim() && !isValidTier(tier)) {
      newErrors.tier = 'Invalid tier. Use: LT5, HT5, LT4, HT4, LT3, HT3, LT2, HT2, LT1, HT1';
    }
    
    if (macetier.trim() && !isValidTier(macetier)) {
      newErrors.macetier = 'Invalid macetier. Use: LT5, HT5, LT4, HT4, LT3, HT3, LT2, HT2, LT1, HT1';
    }
    
    setErrors(newErrors);
    
    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    
    if (!hasErrors) {
      try {
        if (isEditing && editingPlayerId) {
          // Update existing player
          const response = await fetch(`http://localhost:3001/api/players/${editingPlayerId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              playerName: playerName.trim(),
              tier: tier.trim(),
              macetier: macetier.trim(),
              region: region.trim()
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update player');
          }
        } else {
          // Insert new player
          await insertPlayer({
            playerName: playerName.trim(),
            tier: tier.trim(),
            macetier: macetier.trim(),
            region: region.trim()
          });
        }
        
        setSubmitSuccess(true);
        
        // Reset form
        setPlayerName('');
        setTier('');
        setMacetier('');
        setRegion('');
        setIsEditing(false);
        setEditingPlayerId(null);
        
        // Clear URL params
        window.history.replaceState({}, '', '/form');
        
      } catch (error) {
        console.error('Error submitting form:', error);
        alert(`Error submitting form: ${error.message}`);
      }
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4">
      <div className="absolute w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gray-800/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-700/15 rounded-full filter blur-3xl"></div>
      </div>
      <div className="relative z-10 w-full max-w-md backdrop-blur-lg backdrop-filter bg-black/60 rounded-2xl border border-gray-900 shadow-2xl p-8 transition-all duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isEditing ? 'Edit Player' : 'Add New Player'}
          </h1>
          <p className="text-gray-500">
            {isEditing ? 'Update the player information below' : 'Enter the player information below'}
          </p>
          {submitSuccess && (
            <div className="mt-4 p-3 bg-green-900/30 border border-green-800 rounded-lg">
              <p className="text-green-400 text-sm flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4" />
                Player successfully added!
              </p>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="playerName" className="text-sm font-medium text-gray-400 block">
              Player Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-600" />
              </div>
              <input 
                id="playerName" 
                type="text" 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)} 
                className={`w-full pl-10 pr-4 py-3 bg-black/80 border ${errors.playerName ? 'border-red-800' : 'border-gray-800'} rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all duration-200`} 
                placeholder="Enter player name" 
              />
            </div>
            {errors.playerName && <p className="text-red-600 text-sm mt-1">{errors.playerName}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="tier" className="text-sm font-medium text-gray-400 block">
              Tier <span className="text-gray-600">(Optional - but one tier required)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <TrophyIcon className="h-5 w-5 text-gray-600" />
              </div>
              <input 
                id="tier" 
                type="text" 
                value={tier} 
                onChange={(e) => setTier(e.target.value.toUpperCase())} 
                className={`w-full pl-10 pr-4 py-3 bg-black/80 border ${errors.tier ? 'border-red-800' : 'border-gray-800'} rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all duration-200`} 
                placeholder="LT5, HT5, LT4, HT4, etc." 
              />
            </div>
            {errors.tier && <p className="text-red-600 text-sm mt-1">{errors.tier}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="macetier" className="text-sm font-medium text-gray-400 block">
              Macetier <span className="text-gray-600">(Optional - but one tier required)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AwardIcon className="h-5 w-5 text-gray-600" />
              </div>
              <input 
                id="macetier" 
                type="text" 
                value={macetier} 
                onChange={(e) => setMacetier(e.target.value.toUpperCase())} 
                className={`w-full pl-10 pr-4 py-3 bg-black/80 border ${errors.macetier ? 'border-red-800' : 'border-gray-800'} rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all duration-200`} 
                placeholder="LT5, HT5, LT4, HT4, etc." 
              />
            </div>
            {errors.macetier && <p className="text-red-600 text-sm mt-1">{errors.macetier}</p>}
          </div>

          {errors.tierRequired && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <XCircleIcon className="h-4 w-4" />
                {errors.tierRequired}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="region" className="text-sm font-medium text-gray-400 block">
              Region
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GlobeIcon className="h-5 w-5 text-gray-600" />
              </div>
              <input 
                id="region" 
                type="text" 
                value={region} 
                onChange={(e) => setRegion(e.target.value)} 
                className={`w-full pl-10 pr-4 py-3 bg-black/80 border ${errors.region ? 'border-red-800' : 'border-gray-800'} rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all duration-200`} 
                placeholder="Enter region" 
              />
            </div>
            {errors.region && <p className="text-red-600 text-sm mt-1">{errors.region}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 shadow-lg hover:shadow-gray-700/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? (isEditing ? 'Updating...' : 'Submitting...')
              : (isEditing ? 'Update Player' : 'Add Player')
            }
          </button>
        </form>
        
        <div className="mt-10 text-center">
          <div className="inline-flex items-center justify-center w-full">
            <hr className="w-full h-px bg-gray-800 border-0" />
            <span className="absolute px-3 text-xs font-medium text-gray-500 bg-black/80 backdrop-blur-sm">
              Premium Access
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPage;
