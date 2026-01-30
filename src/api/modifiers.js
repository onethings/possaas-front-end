import api from './axios';

export const getModifiers = async () => {
    const response = await api.get('/api/modifiers');
    return response.data;
};

export const createModifier = async (data) => {
    const response = await api.post('/api/modifiers', data);
    return response.data;
};
