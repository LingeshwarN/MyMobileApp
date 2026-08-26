import {API_BASE_URL} from './client';
import {movies as fallbackMovies, Movie} from '../data/movies';
import {genres as fallbackGenres, Genre} from '../data/genres';

// Experiment 7: Retrieve movie and genre data using Fetch API with fallback to local sample data
export const fetchMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/movies`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Fetch API error, returning sample movies data:', error);
    return fallbackMovies;
  }
};

export const fetchGenres = async (): Promise<Genre[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/genres`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Fetch API error, returning sample genres data:', error);
    return fallbackGenres;
  }
};
