import api from './axios';

export const getApiKeys = async () => {
    const response = await api.get('/api/developer/keys');
    return response.data;
};

export const createApiKey = async (name) => {
    const response = await api.post('/api/developer/keys', { name });
    return response.data;
};

export const deleteApiKey = async (keyId) => {
    const response = await api.delete(`/api/developer/keys/${keyId}`);
    return response.data;
};
