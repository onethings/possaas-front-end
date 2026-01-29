import api from './axios';

export const login = async (username, password, tenantId = null) => {
    const data = { username, password };
    if (tenantId) data.tenantId = tenantId;

    const response = await api.post('/api/users/login', data);
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};
