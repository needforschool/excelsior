import * as React from 'react';
import {
    View,
    Dimensions,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import {
    Avatar,
    Text,
    useTheme,
    TextInput,
    Button,
    Switch,
} from 'react-native-paper';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useApi } from '@/lib/api';
import { SecurityForm } from '@/components/forms/SecurityForm'

// --- Forms ---------------------
interface InfosProps {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    onSave: (newData: { firstName: string; lastName: string, email: string, phone: string }) => void;
}
const InformationsForm: React.FC<InfosProps> = (props) => {
    const [firstName, setFirstName] = React.useState(props.firstName);
    const [lastName, setLastName] = React.useState(props.lastName);
    const [phone, setPhone] = React.useState(props.phone);
    const [email, setEmail] = React.useState(props.email);

    return (
        <View style={styles.formContainer}>
            <TextInput
                label="Nom"
                value={lastName}
                onChangeText={setLastName}
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="Prénom"
                value={firstName}
                onChangeText={setFirstName}
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                disabled
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="Téléphone"
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                style={styles.input}
            />
            <Button
                mode="contained"
                onPress={() => props.onSave({ firstName, lastName, email, phone })}
                style={styles.button}
            >
                Mettre à jour
            </Button>
        </View>
    );
};

const PaymentsForm: React.FC = () => (
    <View style={styles.formContainer}>
        <Button mode="outlined" icon="plus" style={styles.button}>
            Ajouter un moyen de paiement
        </Button>
    </View>
);

interface NotificationsProps {
    settings: Record<string, boolean>;
    onToggle: (key: string, value: boolean) => void;
}
const NotificationsForm: React.FC<NotificationsProps> = ({ settings, onToggle }) => {
    return (
        <View style={styles.formContainer}>
            {Object.entries(settings).map(([label, value]) => (
                <View key={label} style={styles.switchRow}>
                    <Text variant="bodyMedium">{label}</Text>
                    <Switch value={value} onValueChange={(v) => onToggle(label, v)} />
                </View>
            ))}
            <Button mode="contained" style={styles.button}>
                Enregistrer les préférences
            </Button>
        </View>
    );
};


export default function ProfileScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { logout } = useAuth();
    const { apiFetch } = useApi();

    const [profile, setProfile] = React.useState<{
        firstName: string;
        lastName: string;
        phone: string;
        email: string;
        created_at: string;
        updated_at: string;
    } | null>(null);
    const [loading, setLoading] = React.useState(true);

    // Notification settings state
    const [notifSettings, setNotifSettings] = React.useState({
        'Notifications par email': true,
        'Notifications push': true,
        SMS: false,
        Newsletter: false,
    });

    // Tabs state
    const layout = Dimensions.get('window');
    const [index, setIndex] = React.useState(0);
    const routes = React.useMemo(
        () => [
            { key: 'infos', title: 'Infos perso' },
            { key: 'securite', title: 'Sécurité' },
            { key: 'paiements', title: 'Paiements' },
            { key: 'notifications', title: 'Notifications' },
        ],
        []
    );

    React.useEffect(() => {
        (async () => {
            try {
                const data = await apiFetch('/users/me');
                setProfile({
                    lastName: data.lastName,
                    firstName: data.firstName,
                    email: data.email,
                    phone: data.phone,
                    created_at: data.created_at,
                    updated_at: data.updated_at,
                });
            } catch (err) {
                console.warn('Chargement du profil échoué', err);
                setProfile({
                    lastName: '',
                    firstName: '',
                    email: '',
                    phone: '',
                    created_at: '',
                    updated_at: '',
                });
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleLogout = async () => {
        await logout();
        router.replace('/');
    };

    const handleSaveName = async (data: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    }) => {
        // Exemple PUT /users/me
        try {
            await apiFetch('/users/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                    email: data.email,
                }),
            });
            setProfile((p) => p && { ...p });
            alert('Profil mis à jour !');
        } catch {
            alert('Erreur lors de la mise à jour du profil.');
        }
    };

    const handleToggleNotif = (key: string, value: boolean) => {
        setNotifSettings((s) => ({ ...s, [key]: value }));
    };

    if (loading || !profile) {
        return (
            <View style={[styles.centered, styles.container]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const renderScene = SceneMap({
        infos: () => (
            <InformationsForm
                firstName={profile.firstName}
                lastName={profile.lastName}
                phone={profile.phone}
                email={profile.email}
                onSave={handleSaveName} />
        ),
        securite: SecurityForm,
        paiements: PaymentsForm,
        notifications: () => (
            <NotificationsForm settings={notifSettings} onToggle={handleToggleNotif} />
        ),
    });

    const timeStampToLocalDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Avatar.Text
                    size={80}
                    label={profile.firstName[0] + profile.lastName[0]}
                    style={{ backgroundColor: theme.colors.backdrop }}
                    color={theme.colors.primary}
                />
                <Text variant="titleMedium" style={styles.name}>
                    {profile.firstName} {profile.lastName}
                </Text>
                <Text variant="bodyMedium">Membre depuis le {timeStampToLocalDate(profile.created_at)}</Text>
            </View>

            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={(props) => (
                    <TabBar
                        {...props}
                        style={styles.tabBar}
                        indicatorStyle={{ backgroundColor: '#317ac1' }}
                        activeColor="#317ac1"
                        inactiveColor={theme.colors.backdrop}
                        scrollEnabled={false}
                        tabStyle={styles.tab}
                        renderLabel={({ route, color }) => (
                            <Text style={[styles.label, { color }]}>{route.title}</Text>
                        )}
                    />
                )}
            />

            <View style={styles.logoutContainer}>
                <Button mode="outlined" icon="logout" onPress={handleLogout} style={styles.button}>
                    Se déconnecter
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', paddingVertical: 24, marginTop: 15 },
    name: { marginTop: 12, fontWeight: 'bold' },
    tabBar: { backgroundColor: '#FFF', elevation: 0, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    tab: { width: 'auto' },
    label: { textTransform: 'none', fontSize: 14, fontWeight: '600' },
    formContainer: { padding: 16 },
    input: { marginBottom: 12 },
    button: { marginTop: 12 },
    text: { marginBottom: 12 },
    marginTop: { marginTop: 16 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    logoutContainer: { padding: 16, borderTopWidth: 1, borderTopColor: '#EEE', backgroundColor: '#FFF' }
});