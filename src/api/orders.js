import api from './axios';

export const getOrders = async () => {
    const response = await api.get('/api/orders');
    return response.data;
};

export const createOrder = async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
};

export const trackOrder = async (orderNo) => {
    const response = await api.get(`/api/orders/track/${orderNo}`);
    return response.data;
};

// --- 新增退貨 API 函式 ---
export const processOrderReturn = async (returnData) => {
    const response = await api.post('/api/orders/return', returnData);
    return response.data;
};

export const exportOrdersCSV = async (start, end) => {
    const response = await api.get('/api/csv/export/orders', { 
        params: { start, end },
        responseType: 'blob' 
    });
    return response.data;
};
