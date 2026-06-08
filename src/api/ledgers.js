import axios from './axios';

export const getStockLedger = async (params = {}) => {
    const response = await axios.get('/api/ledgers', { params });
    return response.data;
};
