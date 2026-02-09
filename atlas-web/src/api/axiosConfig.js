import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://api.atlasdigitaltech.cl/api';

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status } = error.response;

            if (status === 503) {
                if (window.location.pathname !== '/mantenimiento' && !window.location.pathname.startsWith('/admin')) {
                    window.location.href = '/mantenimiento';
                }
            }

            if (status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.clear();
            }
        }
        return Promise.reject(error);
    }
);

export default api;