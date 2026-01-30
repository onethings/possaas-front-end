import api from './axios';

export const getTenants = async () => {
    const response = await api.get('/api/tenants');
    return response.data;
};

export const registerTenant = async (tenantData) => {
    const response = await api.post('/api/tenants/register', tenantData);
    return response.data;
};

export const getMyTenant = async () => {
    const response = await api.get('/api/tenants/me');
    return response.data;
};

export const updateTenantConfig = async (config) => {
    const response = await api.patch('/api/tenants/config', { config });
    return response.data;
};

