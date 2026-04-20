export const COLORS = {
  background: '#0A0A0F',
  surface: '#16161F',
  elevated: '#1E1E2A',
  border: '#2A2A3A',
  primary: '#00D68F',
  cyan: '#4ECDC4',
  gold: '#FFB800',
  red: '#FF4757',
  white: '#FFFFFF',
  secondaryText: '#A0A0B0',
  mutedText: '#606070',
  overlay: 'rgba(0,0,0,0.7)',
  primaryGlow: 'rgba(0,214,143,0.15)',
  primaryGlow2: 'rgba(0,214,143,0.3)',
  cyanGlow: 'rgba(78,205,196,0.15)',
  goldGlow: 'rgba(255,184,0,0.15)',
  redGlow: 'rgba(255,71,87,0.15)',

  // Rank colors
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  goldRank: '#FFD700',
  diamond: '#4FC3F7',
  emerald: '#00E676',
  champion: '#E040FB',

  // Rank glows
  bronzeGlow: 'rgba(205,127,50,0.3)',
  silverGlow: 'rgba(192,192,192,0.3)',
  goldRankGlow: 'rgba(255,215,0,0.3)',
  diamondGlow: 'rgba(79,195,247,0.3)',
  emeraldGlow: 'rgba(0,230,118,0.3)',
  championGlow: 'rgba(224,64,251,0.3)',
};

export const getRankColor = (rank: string): string => {
  switch (rank) {
    case 'Bronze': return COLORS.bronze;
    case 'Silver': return COLORS.silver;
    case 'Gold': return COLORS.goldRank;
    case 'Diamond': return COLORS.diamond;
    case 'Emerald': return COLORS.emerald;
    case 'Champion': return COLORS.champion;
    default: return COLORS.bronze;
  }
};

export const getRankGlow = (rank: string): string => {
  switch (rank) {
    case 'Bronze': return COLORS.bronzeGlow;
    case 'Silver': return COLORS.silverGlow;
    case 'Gold': return COLORS.goldRankGlow;
    case 'Diamond': return COLORS.diamondGlow;
    case 'Emerald': return COLORS.emeraldGlow;
    case 'Champion': return COLORS.championGlow;
    default: return COLORS.bronzeGlow;
  }
};
