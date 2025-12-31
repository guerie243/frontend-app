import { create } from 'zustand';
import { User } from '../types';
import { userService } from '../services/userService';

interface UserState {
    user: User | null;
    isLoading: boolean;
    error: string | null;

    setUser: (user: User | null) => void;
    fetchUser: () => Promise<void>;
    clearStore: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user }),

    fetchUser: async () => {
        set({ isLoading: true, error: null });
        try {
            const user = await userService.getProfile();
            set({ user });
        } catch (error: any) {
            console.error('Error fetching user:', error);
            set({ error: error.message || 'Failed to fetch user' });
        } finally {
            set({ isLoading: false });
        }
    },

    clearStore: () => set({ user: null, isLoading: false, error: null }),
}));
