export interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  backgroundColor: string;
}

export const promotions: Promotion[] = [
  {
    id: '1',
    title: '🎬 FLAT 50% OFF',
    subtitle: 'On your first booking! Use code: CINE50',
    color: '#FFFFFF',
    backgroundColor: '#6C3CE1',
  },
  {
    id: '2',
    title: '🍿 BUY 1 GET 1 FREE',
    subtitle: 'Every Wednesday on all movies',
    color: '#FFFFFF',
    backgroundColor: '#FF5252',
  },
  {
    id: '3',
    title: '⭐ PREMIUM EXPERIENCE',
    subtitle: 'Upgrade to IMAX at just ₹99 extra',
    color: '#1A1A2E',
    backgroundColor: '#FFB800',
  },
  {
    id: '4',
    title: '🎉 WEEKEND SPECIAL',
    subtitle: 'Family pack: 4 tickets at the price of 3',
    color: '#FFFFFF',
    backgroundColor: '#00C853',
  },
];
