import api from './axios';

export const getCustomers = async () => {
    const response = await api.get('/api/customers');
    return response.data;
};

export const createCustomer = async (customerData) => {
    const response = await api.post('/api/customers', customerData);
    return response.data;
};

export const updateCustomer = async (id, customerData) => {
    const response = await api.patch(`/api/customers/${id}`, customerData);
    return response.data;
};

export const deleteCustomer = async (id) => {
    const response = await api.delete(`/api/customers/${id}`);
    return response.data;
};
