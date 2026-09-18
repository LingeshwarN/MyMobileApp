import React, {createContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiLogin, apiRegister} from '../services/api';

// ---------------------------------------------------------------------------
// Demo accounts — work offline, no backend / MongoDB needed
// ---------------------------------------------------------------------------
const DEMO_ACCOUNTS: Array<{email: string; password: string; profile: UserProfile}> = [
  {
    email: 'demo@cinebooks.com',
    password: 'Demo@1234',
    profile: {
      id: 'demo-1',
      name: 'Demo User',
      email: 'demo@cinebooks.com',
      phone: '9876543210',
      address: '123 Demo Street, Mumbai',
      avatar: 'https://picsum.photos/seed/demo1/200/200',
      city: 'Mumbai',
      gender: 'Male',
    },
  },
  {
    email: 'lingesh@cinebooks.com',
    password: 'Test@1234',
    profile: {
      id: 'demo-2',
      name: 'Lingesh',
      email: 'lingesh@cinebooks.com',
      phone: '9123456789',
      address: '456 Main Road, Chennai',
      avatar: 'https://picsum.photos/seed/demo2/200/200',
      city: 'Chennai',
      gender: 'Male',
    },
  },
  {
    email: 'admin@cinebooks.com',
    password: 'Admin@1234',
    profile: {
      id: 'demo-3',
      name: 'Admin',
      email: 'admin@cinebooks.com',
      phone: '9000000000',
      address: '1 Admin Lane, Bangalore',
      avatar: 'https://picsum.photos/seed/demo3/200/200',
      city: 'Bangalore',
      gender: 'Other',
    },
  },
];

function findDemoAccount(email: string, password: string) {
  return DEMO_ACCOUNTS.find(
    a => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
  );
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  city?: string;
  gender?: string;
}

interface UserContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (form: Record<string, string>) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<UserProfile>) => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {
    throw new Error('UserContext not ready');
  },
  register: async () => {
    throw new Error('UserContext not ready');
  },
  logout: async () => {},
  updateUser: async () => {},
});

function mapApiUser(u: any): UserProfile {
  return {
    id: u.id || u._id,
    name: u.name,
    email: u.email,
    phone: u.phone || u.mobile || '',
    address: u.address || '',
    avatar: u.avatar || 'https://picsum.photos/seed/cinebooks/200/200',
    city: u.city || '',
    gender: u.gender || '',
  };
}

export const UserProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Phase E: hydrate real session from AsyncStorage on startup
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('userProfile');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load session:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    // Check demo accounts first (works offline, no backend needed)
    const demo = findDemoAccount(email, password);
    if (demo) {
      setUser(demo.profile);
      setToken('demo-token');
      await AsyncStorage.setItem('userToken', 'demo-token');
      await AsyncStorage.setItem('userProfile', JSON.stringify(demo.profile));
      return demo.profile;
    }
    const res: {token: string; user: any} = await apiLogin(email, password);
    const profile = mapApiUser(res.user);
    setUser(profile);
    setToken(res.token);
    await AsyncStorage.setItem('userToken', res.token);
    await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
    return profile;
  };

  const register = async (form: Record<string, string>): Promise<UserProfile> => {
    // Check if registering with a demo email — just sign in directly
    const demo = DEMO_ACCOUNTS.find(
      a => a.email.toLowerCase() === (form.email || '').toLowerCase(),
    );
    if (demo) {
      setUser(demo.profile);
      setToken('demo-token');
      await AsyncStorage.setItem('userToken', 'demo-token');
      await AsyncStorage.setItem('userProfile', JSON.stringify(demo.profile));
      return demo.profile;
    }
    const res: {token: string; user: any} = await apiRegister(form);
    const profile = mapApiUser(res.user);
    setUser(profile);
    setToken(res.token);
    await AsyncStorage.setItem('userToken', res.token);
    await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
    return profile;
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userProfile');
  };

  const updateUser = async (userData: Partial<UserProfile>) => {
    const next = {...(user || {}), ...userData} as UserProfile;
    setUser(next);
    await AsyncStorage.setItem('userProfile', JSON.stringify(next));
    if (token && next.id) {
      try {
        const {updateUserProfile} = await import('../services/api');
        const updated = await updateUserProfile(next.id, {
          name: next.name,
          phone: next.phone,
          address: next.address,
          city: next.city,
          gender: next.gender,
        });
        setUser({...next, ...mapApiUser(updated)});
        await AsyncStorage.setItem(
          'userProfile',
          JSON.stringify({...next, ...mapApiUser(updated)}),
        );
      } catch (e) {
        // server sync is best-effort; profile is saved locally either way
      }
    }
  };

  return (
    <UserContext.Provider value={{user, token, isLoading, login, register, logout, updateUser}}>
      {children}
    </UserContext.Provider>
  );
};