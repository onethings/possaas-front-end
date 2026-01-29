import api from './axios';

export const login = async (tenantId, username, password) => {
    const response = await api.post('/api/users/login', {
        tenantId,
        username,
        password,
    });
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};
