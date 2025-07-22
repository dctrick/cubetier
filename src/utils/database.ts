/// <reference types="vite/client" />

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface PlayerData {
  playerName: string;
  tier: string;
  macetier: string;
  region: string;
}

export const insertPlayer = async (playerData: PlayerData) => {
  const response = await fetch(`${API_BASE_URL}/api/players`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(playerData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add player');
  }

  return await response.json();
};

export const calculatePoints = (tier: string, macetier: string): number => {
  const tierPoints: { [key: string]: number } = {
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

  const tierValue = tier ? tierPoints[tier.toUpperCase()] || 0 : 0;
  const macetierValue = macetier ? tierPoints[macetier.toUpperCase()] || 0 : 0;
  
  return tierValue + macetierValue;
};

export const getPlayerTitle = (points: number): string => {
  if (points > 250) return "Combat Master";
  if (points >= 100) return "Combat Ace";
  if (points >= 50) return "Combat Specialist";
  if (points >= 20) return "Combat Cadet";
  if (points >= 10) return "Combat Novice";
  return "Rookie";
};

export const isValidTier = (tier: string): boolean => {
  const validTiers = ["LT5", "HT5", "LT4", "HT4", "LT3", "HT3", "LT2", "HT2", "LT1", "HT1"];
  return validTiers.includes(tier.toUpperCase());
};
