// theme.ts
export const colors = {
  background: '#1A0B1A', // deep romantic purple-black
  backgroundLight: '#2D1B2E',
  surface: '#FFF9FB',
  primary: '#FF6B8B', // soft pink (accent)
  primaryDark: '#E85575',
  textPrimary: '#FFFFFF',
  textSecondary: '#FFD1DC',
  textDark: '#2D1B2E',
  border: '#FFB7C5',
  shadow: '#FF6B8B',
  overlay: 'rgba(0,0,0,0.5)',
};

export const typography = {
  title: {
    fontSize: 36,
    fontWeight: '700' as const,
  },
  roundNumber: {
    fontSize: 36,
    fontWeight: '700' as const,
  },
  leftText: {
    fontSize: 32,
    fontWeight: '600' as const,
  },
  rightText: {
    fontSize: 32,
    fontWeight: '600' as const,
  },
  buttonIcon: 28,
};

export const spacing = {
  buttonSize: 60,
  buttonBorderRadius: 30,
  iconSize: 28,
};
