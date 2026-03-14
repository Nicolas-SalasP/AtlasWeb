import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            return null;
        }
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/user');
                const userData = response.data.data || response.data;

                if (userData && userData.role_id) {
                    userData.role_id = Number(userData.role_id);
                }

                setUser(userData);
                localStorage.setItem('user_data', JSON.stringify(userData));
            } catch (error) {
                setUser(null);
                localStorage.removeItem('user_data');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const register = async (formData) => {
        try {
            await api.get('/sanctum/csrf-cookie');
            const response = await api.post('/register', formData);
            const payload = response.data.data || response.data;
            const userData = payload.user;

            localStorage.setItem('user_data', JSON.stringify(userData));
            setUser(userData);
            
            return payload; 
        } catch (error) {
            throw error;
        }
    };

    const login = async (email, password, remember) => {
        try {
            await api.get('/sanctum/csrf-cookie');
            const response = await api.post('/login', {
                email,
                password,
                remember_me: remember
            });

            let userData = response.data.user || (response.data.data && response.data.data.user) || response.data.data || response.data;

            if (userData && userData.role_id) {
                userData.role_id = Number(userData.role_id);
            }

            const storage = remember ? localStorage : sessionStorage;
            storage.setItem('user_data', JSON.stringify(userData));
            const payloadData = response.data.data || response.data;
            if (payloadData.requires_order_claim) {
                localStorage.setItem('pending_claims', JSON.stringify(payloadData.claimable_emails));
            } else {
                localStorage.removeItem('pending_claims');
            }

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
            console.error("Error al cerrar sesión (ignorando):", error);
        } finally {
            localStorage.clear();
            sessionStorage.clear();
            setUser(null);
            navigate('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};