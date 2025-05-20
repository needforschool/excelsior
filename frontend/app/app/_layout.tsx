// app/_layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
    },
};

export default function RootLayout() {
    return (
        <AuthProvider>
            <PaperProvider theme={theme}>
                <Slot />
            </PaperProvider>
        </AuthProvider>
    );
}
