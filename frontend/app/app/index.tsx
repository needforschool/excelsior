// app/index.tsx
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Landing from '@/screens/Landing';
import { useRouter } from 'expo-router';

export default function Index() {
    const { isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    // Si on est déjà connecté, on va direct /dashboard
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isLoading, isAuthenticated]);

    return !isLoading ? <Landing /> : null;
}
