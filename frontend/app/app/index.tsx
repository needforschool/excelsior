// app/index.tsx
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Landing from '@/screens/Landing';
import { useRouter } from 'expo-router';

export default function Index() {
    const { isLoading, isAuthenticated, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            if (user?.role === 'client') {
                router.replace('/dashboard');
            } else if (user?.role === 'provider') {
                router.replace('/prestataire');
            } else {
                console.warn('Unknown user role:', user?.role);
            }
        }
    }, [isLoading, isAuthenticated]);

    return !isLoading ? <Landing /> : null;
}
