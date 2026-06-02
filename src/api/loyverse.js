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

export const fixLoyverseOrderDates = async () => {
    const response = await api.post('/api/loyverse/fix-dates');
    return response.data;
};

export const importAllLoyverse = async () => {
    const response = await api.post('/api/loyverse/import/all');
    return response.data;
};
