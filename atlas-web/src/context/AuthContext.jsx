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
            console.error("Error al parsear usuario del storage", e);
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
                const userData = response.data.data || response.data;
                
                if (userData && userData.role_id) {
                    userData.role_id = Number(userData.role_id);
                }

                setUser(userData);
                const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
                storage.setItem('user_data', JSON.stringify(userData));

            } catch (error) {
                console.error("Error verificando sesión:", error);
                if (error.response && error.response.status === 401) {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const register = async (formData) => {
        try {
            const response = await api.post('/register', formData);
            const { user: userData, access_token } = response.data;
            
            if (!access_token || !userData) {
                throw new Error("Respuesta de registro incompleta");
            }
            localStorage.setItem('token', access_token);
            localStorage.setItem('user_data', JSON.stringify(userData));
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            
            setUser(userData);
            return userData;
        } catch (error) {
            console.error("Error en registro:", error);
            throw error;
        }
    };

    const login = async (email, password, remember) => {
        try {
            const response = await api.post('/login', { 
                email, 
                password,
                remember_me: remember
            });

            console.log("📡 RESPUESTA SERVIDOR LOGIN:", response.data);
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
                console.error("❌ Estructura recibida:", response.data);
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
            console.error("Error en función login:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Error al cerrar sesión en servidor (ignorando):", error);
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
        <AuthContext.Provider value={{ user, login, logout, register, loading, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};