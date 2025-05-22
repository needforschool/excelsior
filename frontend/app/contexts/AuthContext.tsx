import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import IUser from "@/types/user";
import Constants from "expo-constants";

const apiUrl = Constants.expoConfig?.extra?.API_URL;

type AuthContextType = {
    token: string | null;
    user: IUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            const storedToken = await SecureStore.getItemAsync('jwt');
            console.log('🔐 Token loaded:', storedToken);
            if (storedToken) {
                setToken(storedToken);
                await fetchAndSetUser(storedToken);
            }
            setIsLoading(false);
        };
        loadToken();
    }, []);

    const fetchAndSetUser = async (jwt: string) => {
        try {
            const resp = await fetch(`${apiUrl}/users/me`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${jwt}` },
            });
            console.log('User response:', resp);
            if (!resp.ok) throw new Error('Impossible de récupérer le profil');
            const u: IUser = await resp.json();
            console.log('User data:', u);
            // if u containe {"detail": "User not found"} than logout
            if (u.detail === 'User not found') {
                setUser(null);
                setToken(null);
                await logout();
                return null;
            }
            setUser(u);
            return u;
        } catch (e) {
            console.warn('AuthContext: fetch user failed', e);
            setUser(null);
            return null;
        }
    };

    const login = async (newToken: string) => {
        await SecureStore.setItemAsync('jwt', newToken);
        setToken(newToken);
        const u = await fetchAndSetUser(newToken);
        if (u?.role === 'prestataire') {
            router.replace('/prestataire');
        } else {
            router.replace('/dashboard');
        }
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
                user
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
