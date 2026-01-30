import axios from './axios';

export const createAdjustment = async (data) => {
    const response = await axios.post('/inventory-adjustments', data);
    return response.data;
};
