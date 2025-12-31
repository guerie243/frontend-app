import api from './api';
import { User } from '../types';
import { toFormData } from '../utils/formDataHelper';

const hasFiles = (data: any) => {
    return Object.values(data).some(value =>
        (typeof value === 'string' && (value.startsWith('file://') || value.startsWith('content://'))) ||
        (Array.isArray(value) && value.some(v => typeof v === 'string' && (v.startsWith('file://') || v.startsWith('content://'))))
    );
};

export const userService = {
    getProfile: async () => {
        const response = await api.get<{ success: boolean; user: User }>('/users');
        return response.data.user;
    },

    updateProfile: async (data: Partial<User>) => {
        const payload = hasFiles(data) ? toFormData(data) : data;
        const config = hasFiles(data) ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

        const response = await api.patch<{ success: boolean; user: User }>('/users', payload, config);
        return response.data;
    }
};
