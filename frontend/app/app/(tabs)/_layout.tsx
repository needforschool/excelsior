import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const { tabIconDefault: inactiveTint } = Colors[colorScheme ?? 'light'];

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarActiveTintColor: '#317ac1',      // couleur d’accentuation fixe
                tabBarInactiveTintColor: inactiveTint, // couleur inactive issue du thème
                tabBarStyle: Platform.select({
                    ios: { position: 'absolute' },
                    default: {},
                }),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="home" size={28} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="services"
                options={{
                    title: 'Services',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="wrench" size={28} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Commandes',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="clipboard-outline" size={28} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="account"  // <- nouvelle icône profil
                            size={28}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
