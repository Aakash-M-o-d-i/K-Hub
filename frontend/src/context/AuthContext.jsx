import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('pyq_token'));
    const [loading, setLoading] = useState(true);
    const isAdmin = user?.role?.toLowerCase().includes('admin');

    useEffect(() => {
        const theme = user?.preferences?.interface_mode || 'system';
        const root = window.document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else if (theme === 'light') {
            root.classList.remove('dark');
        } else {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            if (systemTheme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }

        // Apply dynamic accent color
        const accent = user?.preferences?.accent_color || 'blue';
        const accentMap = {
            blue: '#3b82f6',
            emerald: '#10b981',
            amber: '#f59e0b',
            rose: '#f43f5e',
            indigo: '#6366f1',
            slate: '#475569'
        };
        root.style.setProperty('--color-primary', accentMap[accent] || accentMap.blue);
        root.style.setProperty('--color-accent', accentMap[accent] || accentMap.blue);
    }, [user?.preferences]);

    useEffect(() => {
        if (token) {
            api
                .get('/auth/me')
                .then((res) => setUser(res.data.user))
                .catch(() => {
                    setToken(null);
                    localStorage.removeItem('pyq_token');
                    localStorage.removeItem('pyq_user');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('pyq_token', newToken);
        localStorage.setItem('pyq_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        return newUser;
    };

    const register = async (name, email, password, departmentId, phoneNumber, semester) => {
        const res = await api.post('/auth/register', {
            name,
            email,
            password,
            department_id: departmentId,
            phone_number: phoneNumber,
            semester: parseInt(semester),
        });
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('pyq_token', newToken);
        localStorage.setItem('pyq_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        return newUser;
    };

    const googleLogin = async (credential, action = 'login') => {
        const res = await api.post('/auth/google', { credential, action });
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('pyq_token', newToken);
        localStorage.setItem('pyq_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        return newUser;
    };

    const logout = () => {
        localStorage.removeItem('pyq_token');
        localStorage.removeItem('pyq_user');
        setToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data.user);
            localStorage.setItem('pyq_user', JSON.stringify(res.data.user));
            return res.data.user;
        } catch (err) {
            console.error('Failed to refresh user:', err);
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, token, loading, login, register, googleLogin, logout, isAdmin, refreshUser }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}

export default AuthContext;
