import React, { useEffect, useState, useRef } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
    Text,
    ActivityIndicator,
    Dimensions,
    Modal, Linking,
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
    Appbar
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApi } from '@/lib/api';
import MapView, { Marker, UrlTile, Circle } from 'react-native-maps';
import IProvider from "@/types/provider";

export default function ProviderDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useTheme();
    const router = useRouter();
    const { apiFetch } = useApi();
    const mapRef = useRef<MapView>(null);

    const [provider, setProvider] = useState<IProvider>(null);
    const [providerService, setProviderService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const data = await apiFetch(`/providers/${id}`);
                setProvider(data);
                let datatype = "";
                if (data.type === "childcare") {
                    datatype = "child-assistance"
                } else {
                    datatype = data.type
                }
                const providerServiceData = await apiFetch(`/${datatype}s/provider/${data.id}`);
                console.log('Provider Service Data:', providerServiceData);
                setProviderService(providerServiceData);
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

    const renderMap = (mapStyle: ViewStyle) => (
        <MapView
            ref={mapRef}
            style={mapStyle}
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
                title={provider.user.firstName + ' ' + provider.user.lastName}
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
            <Appbar.Header elevated>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Détails du prestataire" />
            </Appbar.Header>
            <ScrollView contentContainerStyle={styles.container}>
                <Card elevation={4} style={styles.card}>
                    <Card.Content>
                        <View style={styles.header}>
                            <View style={styles.headerText}>
                                <Title style={styles.title}>{provider.name}</Title>
                                <Text style={styles.subtitle}>
                                    {provider.user.firstName} {provider.user.lastName}
                                </Text>
                            </View>
                        </View>
                        <List.Section>
                            <List.Item
                                title={provider.user.phone}
                                description="Téléphone"
                                left={(props) => <List.Icon {...props} icon="phone" />}
                                onPress={() => Linking.openURL(`tel:${provider.user.phone}`)}
                            />
                            <List.Item
                                title={provider.user.email}
                                description="Email"
                                left={(props) => <List.Icon {...props} icon="email" />}
                                onPress={() => Linking.openURL(`mailto:${provider.user.email}`)}
                            />
                        </List.Section>
                    </Card.Content>
                </Card>

                <Card elevation={2} style={styles.mapCard}>
                    <View style={styles.mapContainer}>
                        {renderMap(styles.map)}
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
                        onPress={() => {
                            const service_json = encodeURIComponent(JSON.stringify(providerService));
                            const provider_json = encodeURIComponent(JSON.stringify(provider));
                            router.push(`/services/provider/${id}/schedule?service=${service_json}&provider=${provider_json}`);
                        }}
                        style={styles.actionButton}
                    >
                        Prendre rendez-vous
                    </Button>
                </View>

                {/* Modal plein écran */}
                <Modal visible={fullscreen} animationType="slide">
                    <View style={styles.fullscreenMapContainer}>
                        {renderMap(StyleSheet.absoluteFillObject)}
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
    fullscreenMapContainer: {
        flex: 1,
        // (optionnel) si vous voulez un fond :
        backgroundColor: '#fff',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 16,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
});