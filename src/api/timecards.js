import axios from './axios';

export const getMyTimecards = async () => {
    const response = await axios.get('/api/timecards/my');
    return response.data;
};

export const clockIn = async () => {
    const response = await axios.post('/api/timecards/clock-in');
    return response.data;
};

export const clockOut = async () => {
    const response = await axios.post('/api/timecards/clock-out');
    return response.data;
};
