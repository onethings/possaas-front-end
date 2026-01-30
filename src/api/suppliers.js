import axios from './axios';

export const getSuppliers = async () => {
    const response = await axios.get('/suppliers');
    return response.data;
};

export const createSupplier = async (data) => {
    const response = await axios.post('/suppliers', data);
    return response.data;
};
