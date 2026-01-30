import axios from './axios';

export const getPurchaseOrders = async () => {
    const response = await axios.get('/purchase-orders');
    return response.data;
};

export const createPurchaseOrder = async (data) => {
    const response = await axios.post('/purchase-orders', data);
    return response.data;
};

export const receivePurchaseOrder = async (id) => {
    const response = await axios.post(`/purchase-orders/${id}/receive`);
    return response.data;
};
