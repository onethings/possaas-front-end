import api from './axios';

export const getTenants = async () => {
    const response = await api.get('/api/tenants');
    return response.data;
};

export const registerTenant = async (tenantData) => {
    const response = await api.post('/api/tenants/register', tenantData);
    return response.data;
};
