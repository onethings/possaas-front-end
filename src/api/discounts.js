import axios from './axios';

export const getDiscounts = async () => {
    const response = await axios.get('/discounts');
    return response.data;
};

export const createDiscount = async (data) => {
    const response = await axios.post('/discounts', data);
    return response.data;
};

export const deleteDiscount = async (id) => {
    const response = await axios.delete(`/discounts/${id}`);
    return response.data;
};
