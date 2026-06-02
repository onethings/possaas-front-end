import api from './axios';

export const getLoyverseToken = async () => {
    const response = await api.get('/api/loyverse/token');
    return response.data;
};

export const saveLoyverseToken = async (accessToken) => {
    const response = await api.post('/api/loyverse/token', { accessToken });
    return response.data;
};

export const disconnectLoyverse = async () => {
    const response = await api.delete('/api/loyverse/token');
    return response.data;
};

export const importLoyverseCategories = async () => {
    const response = await api.post('/api/loyverse/import/categories');
    return response.data;
};

export const importLoyverseItems = async () => {
    const response = await api.post('/api/loyverse/import/items');
    return response.data;
};

export const importLoyverseCustomers = async () => {
    const response = await api.post('/api/loyverse/import/customers');
    return response.data;
};

export const importLoyverseDiscounts = async () => {
    const response = await api.post('/api/loyverse/import/discounts');
    return response.data;
};

export const importLoyverseModifiers = async () => {
    const response = await api.post('/api/loyverse/import/modifiers');
    return response.data;
};

export const importLoyverseSuppliers = async () => {
    const response = await api.post('/api/loyverse/import/suppliers');
    return response.data;
};

export const importLoyverseReceipts = async () => {
    const response = await api.post('/api/loyverse/import/receipts');
    return response.data;
};

export const importLoyverseInventory = async () => {
    const response = await api.post('/api/loyverse/import/inventory');
    return response.data;
};

export const getLoyverseTaskStatus = async (taskId) => {
    const response = await api.get(`/api/loyverse/task/${taskId}`);
    return response.data;
};

export const fixLoyverseOrderDates = async () => {
    const response = await api.post('/api/loyverse/fix-dates');
    return response.data;
};

export const reimportLoyverseReceipts = async () => {
    const response = await api.post('/api/loyverse/reimport-receipts');
    return response.data;
};

export const importLoyverseCsv = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/loyverse/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const importAllLoyverse = async () => {
    const response = await api.post('/api/loyverse/import/all');
    return response.data;
};

export const convertCsvReceipts = async () => {
    const response = await api.post('/api/loyverse/convert-csv-receipts');
    return response.data;
};
