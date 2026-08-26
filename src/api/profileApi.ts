import apiClient from './client';
import {promotions as fallbackPromotions, Promotion} from '../data/promotions';

// Experiment 7: Customer profile and promotional banner retrieved using Axios
export const fetchPromotionalBanners = async (): Promise<Promotion[]> => {
  try {
    const response = await apiClient.get('/promotions');
    return response.data;
  } catch (error) {
    console.warn('Axios fetch error, returning sample promotions:', error);
    return fallbackPromotions;
  }
};

export const fetchUserProfile = async (userId: string) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.warn('Axios fetch profile error:', error);
    return null;
  }
};

export const updateUserProfileApi = async (userId: string, data: any) => {
  try {
    const response = await apiClient.put(`/users/${userId}`, data);
    return response.data;
  } catch (error) {
    console.warn('Axios update profile error:', error);
    throw error;
  }
};
