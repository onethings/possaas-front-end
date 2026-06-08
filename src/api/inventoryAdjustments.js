import axios from './axios';

export const createAdjustment = async (data) => {
    const response = await axios.post('/api/inventory-adjustments', data);
    return response.data;
};

export const getAdjustments = async (params = {}) => {
    const response = await axios.get('/api/inventory-adjustments', { params });
    return response.data;
};
