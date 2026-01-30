import axios from './axios';

export const getSuppliers = async () => {
    const response = await axios.get('/api/suppliers');
    return response.data;
};

export const createSupplier = async (data) => {
    const response = await axios.post('/api/suppliers', data);
    return response.data;
};

export const updateSupplier = async (id, data) => {
    const response = await axios.put(`/api/suppliers/${id}`, data);
    return response.data;
};

export const deleteSupplier = async (id) => {
    const response = await axios.delete(`/api/suppliers/${id}`);
    return response.data;
};
