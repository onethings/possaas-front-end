import axios from './axios';

export const getSuppliers = async () => {
    const response = await axios.get('/api/suppliers');
    return response.data;
};

export const createSupplier = async (data) => {
    const response = await axios.post('/api/suppliers', data);
    return response.data;
};
