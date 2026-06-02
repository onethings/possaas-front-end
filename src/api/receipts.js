import api from './axios';

/**
 * 取得小票收據列表
 * @param {Object} params - { startDate, endDate, limit, page }
 */
export const getReceipts = async (params = {}) => {
    const response = await api.get('/api/receipts', { params });
    return response.data;
};

/**
 * 取得單筆收據
 */
export const getReceipt = async (id) => {
    const response = await api.get(`/api/receipts/${id}`);
    return response.data;
};

/**
 * 清空所有收據
 */
export const clearReceipts = async () => {
    const response = await api.delete('/api/receipts');
    return response.data;
};
