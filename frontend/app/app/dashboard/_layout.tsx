// app/dashboard/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function DashboardLayout() {
    const colorScheme = useColorScheme();
    const inactiveTint = Colors[colorScheme].tabIconDefault;

    return (
        <Tabs
            initialRouteName="index"            // Écran par défaut quand tu ouvres /dashboard
            screenOptions={{
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarActiveTintColor: '#317ac1',
                tabBarInactiveTintColor: inactiveTint,
                tabBarStyle: Platform.select({
                    ios: { position: 'absolute' },
                    default: {},
                }),
            }}
        >
            {/* Ordre garanti par la position de ces <Tabs.Screen> */}
            <Tabs.Screen
                name="index"                      // correspond à app/dashboard/index.tsx
                options={{
                    title: 'Accueil',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="home" size={28} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="services"                   // correspond à app/dashboard/services.tsx
                options={{
                    title: 'Services',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="wrench" size={28} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="orders"                     // correspond à app/dashboard/orders.tsx
                options={{
                    title: 'Commandes',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="clipboard-outline" size={28} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"                    // correspond à app/dashboard/profile.tsx
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account" size={28} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
