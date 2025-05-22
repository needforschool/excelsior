import * as React from 'react';
import {
    View,
    Dimensions,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import {
    Text,
    TextInput,
    Button,
    Switch,
    Avatar,
    Card,
    Title,
    Paragraph,
    useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface DaySlot {
    day: string;
    enabled: boolean;
    from: string;
    to: string;
}

interface Provider {
    id: number;
    id_user: number;
    name: string;
    description: string;
    short_description: string;
    type: string;
    latitude: number;
    longitude: number;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    // éventuellement slots, radiusKm, publicDescription
}

export default function ParametrageScreen() {
    const theme = useTheme();
    const layout = Dimensions.get('window');
    const { apiFetch } = useApi();
    const { user, isLoading: authLoading } = useAuth();

    // Tabs
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'infos', title: 'Infos Pro' },
        { key: 'planning', title: 'Planning' },
        { key: 'public', title: 'Profil Public' },
    ]);

    // Etats
    const [loading, setLoading] = React.useState(true);
    const [provider, setProvider] = React.useState<Provider | null>(null);
    const [slots, setSlots] = React.useState<DaySlot[]>([]);
    const [radius, setRadius] = React.useState('10');
    const [publicText, setPublicText] = React.useState('');

    React.useEffect(() => {
        (async () => {
            if (!user) return;
            try {
                // 1) récupérer le provider lié
                const data: Provider = await apiFetch(`/providers/${user.id}`);
                setProvider(data);
                // 2) initialiser les settings si présents
                if ((data as any).slots) setSlots((data as any).slots);
                if ((data as any).radiusKm != null)
                    setRadius(String((data as any).radiusKm));
                // short_description
                setPublicText(data.short_description);
            } catch (err) {
                console.warn('Erreur chargement provider', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    // PATCH générique pour settings
    const savePart = async (part: any) => {
        if (!provider) return;
        try {
            await apiFetch(`/provider/${provider.id}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(part),
            });
            Alert.alert('Succès', 'Mise à jour enregistrée');
        } catch (err: any) {
            Alert.alert('Erreur', err.message || 'Impossible de sauvegarder');
        }
    };

    // --- Infos Pro ---
    const InfosRoute = () => (
        <ScrollView contentContainerStyle={styles.formContainer}>
            <TextInput
                label="Nom de l'entreprise"
                value={provider!.name}
                disabled
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="Type de service"
                value={provider!.type}
                disabled
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="Description interne"
                value={provider!.description}
                onChangeText={(t) =>
                    setProvider((p) =>
                        p ? { ...p, description: t } : p
                    )
                }
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
            />
            <TextInput
                label="Rayon d’action (km)"
                value={radius}
                onChangeText={setRadius}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
            />
            <Button
                mode="contained"
                onPress={() =>
                    savePart({
                        description: provider!.description,
                        radiusKm: Number(radius),
                    })
                }
                style={styles.button}
            >
                Enregistrer
            </Button>
        </ScrollView>
    );

    // --- Planning ---
    const PlanningRoute = () => (
        <ScrollView contentContainerStyle={styles.formContainer}>
            {slots.map((slot, i) => (
                <View key={slot.day} style={styles.slotRow}>
                    <Switch
                        value={slot.enabled}
                        onValueChange={(v) => {
                            const next = [...slots];
                            next[i].enabled = v;
                            setSlots(next);
                        }}
                    />
                    <Text style={styles.slotDay}>{slot.day}</Text>
                    {slot.enabled && (
                        <>
                            <TextInput
                                label="De"
                                value={slot.from}
                                onChangeText={(t) => {
                                    const next = [...slots];
                                    next[i].from = t;
                                    setSlots(next);
                                }}
                                mode="outlined"
                                style={[styles.input, styles.timeInput]}
                            />
                            <TextInput
                                label="À"
                                value={slot.to}
                                onChangeText={(t) => {
                                    const next = [...slots];
                                    next[i].to = t;
                                    setSlots(next);
                                }}
                                mode="outlined"
                                style={[styles.input, styles.timeInput]}
                            />
                        </>
                    )}
                </View>
            ))}
            <Button
                mode="contained"
                onPress={() => savePart({ slots })}
                style={styles.button}
            >
                Enregistrer
            </Button>
        </ScrollView>
    );

    // --- Profil Public ---
    const PublicRoute = () => (
        <ScrollView contentContainerStyle={styles.formContainer}>
            <Card style={styles.previewCard}>
                <Card.Title
                    title="Aperçu public"
                    left={(props) => (
                        <Avatar.Icon
                            {...props}
                            icon="account-circle"
                            style={{ backgroundColor: theme.colors.backdrop }}
                            color={theme.colors.primary}
                        />
                    )}
                />
                <Card.Content>
                    <Title>{provider!.name}</Title>
                    <Paragraph style={styles.shortDesc}>
                        {publicText || 'Aucune description publique.'}
                    </Paragraph>
                    <Paragraph style={styles.meta}>
                        Inscrit le{' '}
                        {new Date(provider!.created_at).toLocaleDateString('fr-FR')}
                    </Paragraph>
                </Card.Content>
            </Card>

            <Text style={styles.sectionTitle}>Modifier la description</Text>
            <TextInput
                value={publicText}
                onChangeText={setPublicText}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
            />
            <Button
                mode="contained"
                onPress={() => savePart({ publicDescription: publicText })}
                style={styles.button}
            >
                Enregistrer
            </Button>
        </ScrollView>
    );

    if (authLoading || loading || !provider) {
        return (
            <View style={[styles.centered, styles.container]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // Initiales pour l'avatar (header)
    const initials = provider.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <SafeAreaView style={styles.container}>
            {/* En-tête */}
            <View style={styles.header}>
                <Avatar.Text
                    size={80}
                    label={initials}
                    style={{ backgroundColor: theme.colors.backdrop }}
                    color={theme.colors.primary}
                />
                <Text variant="titleMedium" style={styles.name}>
                    {provider.name}
                </Text>
                <Text variant="bodyMedium" style={styles.sub}>
                    {provider.type.charAt(0).toUpperCase() + provider.type.slice(1)}
                </Text>
            </View>

            {/* Tabs */}
            <TabView
                navigationState={{ index, routes }}
                renderScene={SceneMap({
                    infos: InfosRoute,
                    planning: PlanningRoute,
                    public: PublicRoute,
                })}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={(props) => (
                    <TabBar
                        {...props}
                        indicatorStyle={{ backgroundColor: theme.colors.primary }}
                        style={styles.tabBar}
                        labelStyle={styles.tabLabel}
                        activeColor={theme.colors.primary}
                        inactiveColor={theme.colors.backdrop}
                    />
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        alignItems: 'center',
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        marginBottom: 8,
    },
    name: { fontWeight: 'bold', marginTop: 8 },
    sub: { color: '#555', marginTop: 4 },

    tabBar: { backgroundColor: '#FFF', elevation: 2 },
    tabLabel: { fontSize: 14, fontWeight: '600' },

    formContainer: { padding: 16 },
    input: { marginBottom: 16 },
    sectionTitle: { marginBottom: 8, fontWeight: '600' },

    previewCard: { marginBottom: 24 },
    shortDesc: { marginVertical: 8 },
    meta: { color: '#888', fontSize: 12 },

    button: { marginBottom: 32 },

    slotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    slotDay: { width: 80, marginHorizontal: 8 },
    timeInput: { width: 80 },
});
