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
    TextInput,        // ← on l’importe bien ici
    Button,
    Switch,
    Avatar,
    Card,
    Title,
    Paragraph,
    useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
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
}

export default function ParametrageScreen() {
    const theme = useTheme();
    const layout = Dimensions.get('window');
    const { apiFetch } = useApi();
    const { user, isLoading: authLoading } = useAuth();

    // TabView state
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'infos', title: 'Infos Pro' },
        { key: 'planning', title: 'Planning' },
        { key: 'public', title: 'Profil Public' },
    ]);

    // Chargement + données
    const [loading, setLoading] = React.useState(true);
    const [provider, setProvider] = React.useState<Provider | null>(null);
    const [slots, setSlots] = React.useState<DaySlot[]>([]);
    const [publicText, setPublicText] = React.useState('');
    const [radius, setRadius] = React.useState('10');

    React.useEffect(() => {
        (async () => {
            if (!user) return;
            try {
                // 1) récupérer le provider
                const p: Provider = await apiFetch(`/providers/${user.id}`);
                setProvider(p);
                setPublicText(p.short_description);

                // 2) récupérer les dispo métier
                const datatype = p.type === 'childcare' ? 'child-assistance' : p.type;
                const arr: any[] = await apiFetch(`/${datatype}s/provider/${p.id}`);
                const svc = Array.isArray(arr) ? arr[0] : arr;

                // 3) mapper les availabilities
                const avail = svc.availabilities || {};
                const days = [
                    'monday','tuesday','wednesday',
                    'thursday','friday','saturday','sunday'
                ];
                const mapped: DaySlot[] = days.map((d) => {
                    const times = avail[d] || {};
                    // on prend le premier créneau actif pour from/to
                    const active = Object.entries(times).find(([_, ok]) => ok) || ['', false];
                    return {
                        day: d.charAt(0).toUpperCase() + d.slice(1),
                        enabled: Object.values(times).some(v => v),
                        from: active[1] ? active[0] : '',
                        to:   active[1] ? active[0] : '',
                    };
                });
                setSlots(mapped);
            } catch (err) {
                console.warn('Erreur chargement provider/settings', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    // PATCH générique
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
                            setSlots((s) => {
                                const next = [...s];
                                next[i].enabled = v;
                                return next;
                            });
                        }}
                    />
                    <Text style={styles.slotDay}>{slot.day}</Text>
                    {slot.enabled && (
                        <>
                            <TextInput
                                label="De (hh:mm)"
                                value={slot.from}
                                onChangeText={(t) => {
                                    // autoriser 00:00 à 23:59
                                    const clean = t.replace(/[^0-9:]/g,'');
                                    setSlots((s) => {
                                        const next = [...s];
                                        next[i].from = clean;
                                        return next;
                                    });
                                }}
                                mode="outlined"
                                style={[styles.input, styles.timeInput]}
                            />
                            <TextInput
                                label="À  (hh:mm)"
                                value={slot.to}
                                onChangeText={(t) => {
                                    const clean = t.replace(/[^0-9:]/g,'');
                                    setSlots((s) => {
                                        const next = [...s];
                                        next[i].to = clean;
                                        return next;
                                    });
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
                onPress={() => savePart({ availabilities: slots })}
                style={styles.button}
            >
                Enregistrer le planning
            </Button>
        </ScrollView>
    );

    // --- Profil Public ---
    const PublicRoute = () => (
        <ScrollView contentContainerStyle={styles.formContainer}>
            <Text style={styles.sectionTitle}>Description publique</Text>
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

    // loader
    if (authLoading || loading || !provider) {
        return (
            <View style={[styles.centered, styles.container]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // initials
    const initials = provider.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0,2)
        .toUpperCase();

    return (
        <SafeAreaView style={styles.container}>
            {/* header */}
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
                    {provider.type}
                </Text>
            </View>

            {/* tabs */}
            <TabView
                navigationState={{ index, routes }}
                renderScene={SceneMap({
                    infos: InfosRoute,
                    planning: PlanningRoute,
                    public: PublicRoute,
                })}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={props => (
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
    container: { flex:1, backgroundColor:'#FFF' },
    centered: { flex:1, justifyContent:'center', alignItems:'center' },

    header: {
        alignItems:'center', paddingVertical:16,
        borderBottomWidth:1, borderBottomColor:'#EEE'
    },
    name:{marginTop:8, fontWeight:'bold'},
    sub:{color:'#555'},

    tabBar:{backgroundColor:'#FFF'},
    tabLabel:{fontSize:14,fontWeight:'600'},

    formContainer:{padding:16},
    input:{marginBottom:12},
    timeInput:{width:100, marginRight:8},
    button:{marginTop:16},

    slotRow:{
        flexDirection:'row',
        alignItems:'center',
        marginBottom:12,
        flexWrap:'wrap'
    },
    slotDay:{width:80, marginRight:8},

    sectionTitle:{fontWeight:'600', marginBottom:8},
});
