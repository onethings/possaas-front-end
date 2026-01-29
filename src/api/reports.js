import api from './axios';

export const getReportSummary = async () => {
    const response = await api.get('/api/reports/summary');
    return response.data;
};

export const getDailyReport = async (date) => {
    const response = await api.get(`/api/reports/daily?date=${date}`);
    return response.data;
};
