import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    ActivityIndicator,
    Text,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Title, Paragraph, useTheme } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import Constants from 'expo-constants';
import IProvider from "@/types/provider";

const apiUrl = Constants.expoConfig?.extra?.API_URL;

async function fetchProviders(slug: string) {
    const response = await fetch(`${apiUrl}/providers/type/${slug}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.detail || 'Erreur réseau');
    }
    return data;
}

const slugToName = (slug: string) => {
    const names: { [key: string]: string } = {
        moving: 'Déménagement',
        transport: 'Transport et Livraison',
        cleaning: 'Nettoyage de véhicules',
        repair: 'Dépannage automobile',
        childcare: "Garde d'enfants",
    };
    return names[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
}

export default function ServiceProvidersScreen() {
    const theme = useTheme();
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const [providers, setProviders] = useState<IProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        (async () => {
            try {
                const data = await fetchProviders(slug);
                console.log(data);
                setProviders(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [slug]);

    const handlePress = (id: string) => {
        router.push(`/services/provider/${id}`);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    Erreur : {error}
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    Prestataires pour {slugToName(slug)}
                </Text>
            </View>

            <FlatList
                data={providers}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => handlePress(item.id)}
                        style={({ pressed }) => [
                            styles.cardContainer,
                            pressed && { opacity: 0.8 },
                        ]}
                    >
                        <Card elevation={4} style={styles.card}>
                            <Card.Content>
                                <Title style={{ color: theme.colors.primary }}>
                                    {item.user.firstName} {item.user.lastName}
                                </Title>
                                <Paragraph style={{ color: theme.colors.text }}>
                                    {item.user.email}
                                </Paragraph>
                            </Card.Content>
                        </Card>
                    </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#DDD',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    list: {
        padding: 16,
    },
    cardContainer: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
    },
    separator: {
        height: 12,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
    },
});
