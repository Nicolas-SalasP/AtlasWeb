import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            return null;
        }
    });

    const [loading, setLoading] = useState(!user);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const response = await api.get('/user');
                
                let userData = response.data.data || response.data;
                
                if (userData && userData.role_id) {
                    userData.role_id = Number(userData.role_id);
                }

                setUser(userData);
                
                const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
                storage.setItem('user_data', JSON.stringify(userData));

            } catch (error) {
                if (error.response && error.response.status === 401) {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email, password, remember) => {
        try {
            const response = await api.post('/login', { 
                email, 
                password,
                remember_me: remember
            });

            let token = response.data.token || response.data.access_token;
            if (!token && response.data.data) {
                token = response.data.data.token || response.data.data.access_token;
            }

            let userData = response.data.user;
            if (!userData && response.data.data) {
                userData = response.data.data.user || response.data.data;
            }
            if (!userData && response.data.id) {
                userData = response.data;
            }

            if (!token || !userData) {
                throw new Error("No se pudo encontrar el token o el usuario en la respuesta del servidor.");
            }

            if (userData.role_id) {
                userData.role_id = Number(userData.role_id);
            }

            const storage = remember ? localStorage : sessionStorage;
            storage.setItem('token', token);
            storage.setItem('user_data', JSON.stringify(userData));

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            setUser(userData);
            return userData;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error(error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user_data');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user_data');
            
            delete api.defaults.headers.common['Authorization'];
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