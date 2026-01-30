import axios from './axiosConfig';

export const getMyTimecards = async () => {
    const response = await axios.get('/timecards/my');
    return response.data;
};

export const clockIn = async () => {
    const response = await axios.post('/timecards/clock-in');
    return response.data;
};

export const clockOut = async () => {
    const response = await axios.post('/timecards/clock-out');
    return response.data;
};
