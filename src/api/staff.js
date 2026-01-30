import api from './axios';

export const getStaff = async () => {
    const response = await api.get('/api/users');
    return response.data;
};

export const registerStaff = async (staffData) => {
    const response = await api.post('/api/users/register-staff', staffData);
    return response.data;
};

export const updateStaffStatus = async (id, status) => {
    const response = await api.patch(`/api/users/${id}/status`, { status });
    return response.data;
};
