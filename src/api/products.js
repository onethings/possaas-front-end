import api from './axios';

export const getProducts = async () => {
    const response = await api.get('/api/products');
    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
};

export const adjustStock = async (productId, changeQty, reason) => {
    const response = await api.post('/api/products/adjust', {
        productId,
        changeQty,
        reason,
    });
    return response.data;
};
export const createProduct = async (productData) => {
    const response = await api.post('/api/products', productData);
    return response.data;
};

export const updateProduct = async (id, productData) => {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
};

export const deleteProducts = async (productIds) => {
    const response = await api.delete('/api/products/batch', { data: { productIds } });
    return response.data;
};

export const exportProductsCSV = async () => {
    const response = await api.get('/api/products/export/csv', { responseType: 'blob' });
    return response.data;
};

export const importProductsCSV = async (csvData) => {
    const response = await api.post('/api/products/import/csv', { csvData });
    return response.data;
};
