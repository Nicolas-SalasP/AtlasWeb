import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            if (token) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await api.get('/me');
                    setUser(response.data);
                } catch (error) {
                    console.error("Sesión expirada");
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password, remember) => {
        const response = await api.post('/login', { email, password });
        const { token, user } = response.data.data; 

        if (remember) {
            localStorage.setItem('token', token);
        } else {
            sessionStorage.setItem('token', token);
        }

        setUser(user);
        
        return user;
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error(error);
        } finally {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            setUser(null);
            window.location.href = '/login'; 
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};