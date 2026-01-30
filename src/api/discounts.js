import axios from './axios';

export const getDiscounts = async () => {
    const response = await axios.get('/api/discounts');
    return response.data;
};

export const createDiscount = async (data) => {
    const response = await axios.post('/api/discounts', data);
    return response.data;
};

export const deleteDiscount = async (id) => {
    const response = await axios.delete(`/api/discounts/${id}`);
    return response.data;
};
