import React, { useEffect, useState, useRef } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
    Text,
    ActivityIndicator,
    Dimensions,
    Modal,
    TouchableOpacity,
} from 'react-native';
import {
    Card,
    Title,
    Paragraph,
    List,
    Avatar,
    Button,
    IconButton,
    useTheme,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApi } from '@/lib/api';
import MapView, { Marker, UrlTile, Circle } from 'react-native-maps';

export default function ProviderDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useTheme();
    const router = useRouter();
    const { apiFetch } = useApi();
    const mapRef = useRef<MapView>(null);

    const [provider, setProvider] = useState<{
        name: string;
        description: string;
        phone: string;
        email: string;
        latitude: number;
        longitude: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const data = await apiFetch(`/providers/${id}`);
                setProvider({
                    name: data.name,
                    description: data.description,
                    phone: data.phone,
                    email: data.email,
                    latitude: data.latitude,
                    longitude: data.longitude,
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !provider) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centered}>
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                        {error ?? 'Prestataire introuvable'}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const RADIUS_METERS = 10000;
    const region = {
        latitude: provider.latitude,
        longitude: provider.longitude,
        latitudeDelta: (RADIUS_METERS / 111000) * 2,
        longitudeDelta:
            ((RADIUS_METERS / 111000) * 2) *
            (Dimensions.get('window').width / Dimensions.get('window').height),
    };

    const renderMap = () => (
        <MapView
            ref={mapRef}
            style={styles.map}
            provider={undefined}
            initialRegion={region}
            loadingEnabled
        >
            <UrlTile
                urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
                subdomains={["a", "b", "c"]}
            />
            <Marker
                coordinate={{ latitude: provider.latitude, longitude: provider.longitude }}
                title={provider.name}
            />
            <Circle
                center={{ latitude: provider.latitude, longitude: provider.longitude }}
                radius={RADIUS_METERS}
                strokeColor="rgba(0, 123, 255, 0.8)"
                fillColor="rgba(0, 123, 255, 0.2)"
            />
        </MapView>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.container}>
                <Card elevation={4} style={styles.card}>
                    <Card.Content>
                        <View style={styles.header}>
                            <Avatar.Text
                                size={64}
                                label={provider.name.charAt(0).toUpperCase()}
                                style={{ backgroundColor: theme.colors.primary }}
                                color={theme.colors.onPrimary}
                            />
                            <View style={styles.headerText}>
                                <Title style={styles.title}>{provider.name}</Title>
                                <Paragraph style={styles.subtitle}>
                                    {provider.description}
                                </Paragraph>
                            </View>
                        </View>
                        <List.Section>
                            <List.Item
                                title={provider.phone}
                                description="Téléphone"
                                left={(props) => <List.Icon {...props} icon="phone" />}
                            />
                            <List.Item
                                title={provider.email}
                                description="Email"
                                left={(props) => <List.Icon {...props} icon="email" />}
                            />
                        </List.Section>
                    </Card.Content>
                </Card>

                <Card elevation={2} style={styles.mapCard}>
                    <View style={styles.mapContainer}>
                        {renderMap()}
                        <IconButton
                            icon={fullscreen ? "fullscreen-exit" : "fullscreen"}
                            size={24}
                            style={styles.fullscreenButton}
                            onPress={() => setFullscreen(true)}
                        />
                    </View>
                    <Card.Content>
                        <Paragraph style={styles.mapCaption}>Rayon de déplacement (~10 km)</Paragraph>
                    </Card.Content>
                </Card>

                <View style={styles.actions}>
                    <Button
                        mode="contained"
                        onPress={() => router.push(`/services/provider/${id}/schedule`)}
                        style={styles.actionButton}
                    >
                        Prendre rendez-vous
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={() => router.push(`/services/provider/${id}/schedule`)}
                        style={styles.actionButton}
                    >
                        Voir l'agenda
                    </Button>
                </View>

                {/* Modal plein écran */}
                <Modal visible={fullscreen} animationType="slide">
                    <View style={styles.fullscreenMapContainer}>
                        {renderMap()}
                        <IconButton
                            icon="close"
                            size={28}
                            style={styles.closeButton}
                            onPress={() => setFullscreen(false)}
                        />
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
}

const { width } = Dimensions.get('window');
const MAP_HEIGHT = 200;

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { padding: 16 },
    card: { borderRadius: 12, marginVertical: 8 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    headerText: { marginLeft: 16, flex: 1 },
    title: { fontSize: 22, fontWeight: 'bold' },
    subtitle: { color: 'gray', marginTop: 4 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16 },
    mapCard: { borderRadius: 12, overflow: 'hidden', marginVertical: 16 },
    mapContainer: { position: 'relative' },
    map: { width: width - 32, height: MAP_HEIGHT },
    fullscreenButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
    mapCaption: { marginTop: 8, textAlign: 'center', color: 'gray' },
    actions: { marginTop: 24, flexDirection: 'row', justifyContent: 'space-around' },
    actionButton: { flex: 1, marginHorizontal: 8 },
    fullscreenMapContainer: { flex: 1 },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 16,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
});