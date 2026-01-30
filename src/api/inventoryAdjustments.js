import axios from './axiosConfig';

export const createAdjustment = async (data) => {
    const response = await axios.post('/inventory-adjustments', data);
    return response.data;
};
