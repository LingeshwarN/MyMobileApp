import React, {createContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
}

interface UserContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (userData: UserProfile, token: string) => void;
  logout: () => void;
  updateUser: (userData: UserProfile) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const UserProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate user session from AsyncStorage on startup (Experiment 6 & 8)
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('userProfile');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Default fallback user so app works smoothly immediately
          const defaultUser = {
            name: 'Lingesh',
            email: 'lingesh@cinebooks.com',
            phone: '9876543210',
            address: '123 Cinema Street, Chennai',
            avatar: 'https://picsum.photos/seed/lingesh/200/200',
          };
          setUser(defaultUser);
        }
      } catch (e) {
        console.error('Failed to load session:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (userData: UserProfile, newToken: string) => {
    setUser(userData);
    setToken(newToken);
    await AsyncStorage.setItem('userToken', newToken);
    await AsyncStorage.setItem('userProfile', JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userProfile');
  };

  const updateUser = async (userData: UserProfile) => {
    setUser(userData);
    await AsyncStorage.setItem('userProfile', JSON.stringify(userData));
  };

  return (
    <UserContext.Provider value={{user, token, isLoading, login, logout, updateUser}}>
      {children}
    </UserContext.Provider>
  );
};
