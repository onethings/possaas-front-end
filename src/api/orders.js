// src/api/orders.js
import api from './axios'; // 保持你原有的 axios 實例匯入路徑

/**
 * 獲取當前租戶的訂單列表
 * @param {Object} params - 支援條件篩選：{ shiftId, start, end, status }
 */
export const getOrders = async (params) => {
    // 讓 GET 請求可以帶入 URL 查詢參數，方便按班次或日期範圍撈資料
    const response = await api.get('/api/orders', { params });
    return response.data;
};

/**
 * 建立新訂單 (收銀結帳)
 * @param {Object} orderData 
 */
export const createOrder = async (orderData) => {
    try {
        const response = await api.post('/api/orders', orderData);
        return response.data;
    } catch (error) {
        // 抓取後端噴出的核心業務邏輯錯誤（如：庫存不足、班次已關閉）
        const errorMsg = error.response?.data?.message || '';
        if (errorMsg.includes('庫存不足') || errorMsg.includes('不存在') || errorMsg.includes('班次')) {
            throw new Error(errorMsg); 
        }
        throw error;
    }
};

export const trackOrder = async (orderNo) => {
    const response = await api.get(`/api/orders/track/${orderNo}`);
    return response.data;
};

/**
 * 處理部分或全額退貨 API
 * @param {Object} returnData 
 * @param {string} returnData.orderNo - 原始訂單號
 * @param {Array}  returnData.itemsToReturn - 退貨項目 snapshot 陣列
 * @param {string} returnData.reason - 退貨原因
 * @param {string} returnData.shiftId - 【重要安全校驗】當前收銀班次 ID
 * @param {string} returnData.paymentMethod - 退款管道，預設為 'cash'
 */
export const processOrderReturn = async (returnData) => {
    try {
        const response = await api.post('/api/orders/return', returnData);
        return response.data; // 後端成功回傳會帶有更新後的訂單狀態與精確的 returnRecord 物件
    } catch (error) {
        throw new Error(error.response?.data?.message || '退貨處理失敗');
    }
};

export const getOrderReturns = async (orderNo) => {
    const response = await api.get(`/api/orders/${orderNo}/returns`);
    return response.data;
};

export const exportOrdersCSV = async (start, end) => {
    const response = await api.get('/api/csv/export/orders', { 
        params: { start, end },
        responseType: 'blob' 
    });
    return response.data;
};