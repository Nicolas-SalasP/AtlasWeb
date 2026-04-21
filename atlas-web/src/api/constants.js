const isProduction = import.meta.env.MODE === 'production';

export const API_URL = isProduction 
    ? 'https://api.tenri.cl/api' 
    : 'http://127.0.0.1:8000/api';

export const BASE_URL = isProduction
    ? 'https://api.tenri.cl'
    : 'http://127.0.0.1:8000';