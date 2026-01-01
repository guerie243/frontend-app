import api from './api';
import { User } from '../types';
import { toFormData } from '../utils/formDataHelper';

const hasFiles = (data: any) => {
    return Object.values(data).some(value => {
        // Un simple string qui est une URI locale
        if (typeof value === 'string' && (value.startsWith('file://') || value.startsWith('content://') || value.startsWith('blob:'))) {
            return true;
        }
        // Un objet avec une propriété uri qui est une URI locale
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            const v = value as any;
            if (typeof v.uri === 'string' && (v.uri.startsWith('file://') || v.uri.startsWith('content://') || v.uri.startsWith('blob:'))) {
                return true;
            }
        }
        return false;
    });
};

export const userService = {
    getProfile: async () => {
        const response = await api.get<{ success: boolean; user: User }>('/users');
        return response.data.user;
    },

    updateProfile: async (data: Partial<User>) => {
        const payload = hasFiles(data) ? await toFormData(data) : data;
        const config = hasFiles(data) ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

        const response = await api.patch<{ success: boolean; user: User }>('/users', payload, config);
        return response.data;
    }
};
