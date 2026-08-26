import {TextStyle} from 'react-native';

export const Typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  h3: {
    fontSize: 22,
    fontWeight: '700',
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  small: {
    fontSize: 10,
    fontWeight: '400',
  },
  button: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
};
