import api from './axios';

export const getStores = async () => {
    const response = await api.get('/api/stores');
    return response.data;
};

export const createStore = async (data) => {
    const response = await api.post('/api/stores', data);
    return response.data;
};

export const updateStore = async (id, data) => {
    const response = await api.put(`/api/stores/${id}`, data);
    return response.data;
};

export const deleteStore = async (id) => {
    const response = await api.delete(`/api/stores/${id}`);
    return response.data;
};
