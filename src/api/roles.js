import api from './axios';

export const getRoles = async () => {
    const response = await api.get('/api/roles');
    return response.data;
};

export const createRole = async (data) => {
    const response = await api.post('/api/roles', data);
    return response.data;
};

export const updateRole = async (id, data) => {
    const response = await api.put(`/api/roles/${id}`, data);
    return response.data;
};

export const deleteRole = async (id) => {
    const response = await api.delete(`/api/roles/${id}`);
    return response.data;
};
