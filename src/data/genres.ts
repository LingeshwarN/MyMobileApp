export interface Genre {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const genres: Genre[] = [
  {id: '1', name: 'Action', icon: 'flame', color: '#FF5252'},
  {id: '2', name: 'Comedy', icon: 'happy', color: '#FFB300'},
  {id: '3', name: 'Drama', icon: 'heart', color: '#E040FB'},
  {id: '4', name: 'Horror', icon: 'skull', color: '#607D8B'},
  {id: '5', name: 'Romance', icon: 'rose', color: '#FF4081'},
  {id: '6', name: 'Sci-Fi', icon: 'planet', color: '#448AFF'},
  {id: '7', name: 'Thriller', icon: 'eye', color: '#FF6E40'},
  {id: '8', name: 'Animation', icon: 'color-palette', color: '#69F0AE'},
  {id: '9', name: 'Fantasy', icon: 'sparkles', color: '#B388FF'},
  {id: '10', name: 'Adventure', icon: 'compass', color: '#00BCD4'},
  {id: '11', name: 'Sports', icon: 'football', color: '#8BC34A'},
];
