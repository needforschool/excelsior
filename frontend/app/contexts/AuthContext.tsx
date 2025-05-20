import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

type AuthContextType = {
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            const storedToken = await SecureStore.getItemAsync('jwt');
            console.log('🔐 Token loaded:', storedToken);
            if (storedToken) {
                setToken(storedToken);
            }
            setIsLoading(false);
        };
        loadToken();
    }, []);

    const login = async (newToken: string) => {
        await SecureStore.setItemAsync('jwt', newToken);
        setToken(newToken);
        router.replace('/dashboard');
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('jwt');
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                isAuthenticated: !!token,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
