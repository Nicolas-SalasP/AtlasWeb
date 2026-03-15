import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true,
    withXSRFToken: true
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status } = error.response;

            // 1. Manejo del Modo Mantenimiento
            if (status === 503) {
                if (window.location.pathname !== '/mantenimiento' && !window.location.pathname.startsWith('/admin')) {
                    window.location.href = '/mantenimiento';
                }
            }

            // 2. Manejo de Sesión Expirada o Inválida
            if (status === 401) {
                localStorage.removeItem('user_data');
                localStorage.removeItem('pending_claims');
                sessionStorage.clear();
                if (window.location.pathname !== '/login' && window.location.pathname !== '/registro') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;