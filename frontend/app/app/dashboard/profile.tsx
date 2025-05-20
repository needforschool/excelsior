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

// --- Forms ---------------------
interface InfosProps {
    name: string;
    email: string;
    onSave: (newName: string) => Promise<void>;
}
const InformationsForm: React.FC<InfosProps> = ({ name, email, onSave }) => {
    const [newName, setNewName] = React.useState(name);

    return (
        <View style={styles.formContainer}>
            <TextInput
                label="Nom complet"
                value={newName}
                onChangeText={setNewName}
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="Email"
                value={email}
                disabled
                mode="outlined"
                style={styles.input}
            />
            <Button
                mode="contained"
                onPress={() => onSave(newName)}
                style={styles.button}
            >
                Mettre à jour
            </Button>
        </View>
    );
};

const SecurityForm: React.FC = () => (
    <View style={styles.formContainer}>
        <Text variant="bodyMedium" style={styles.text}>Changer le mot de passe pour sécuriser votre compte.</Text>
        <Button mode="outlined" icon="lock-reset" style={styles.button}>
            Modifier le mot de passe
        </Button>
        <Text variant="bodyMedium" style={[styles.text, styles.marginTop]}>Authentification à deux facteurs</Text>
        <Button mode="outlined" icon="shield-key" style={styles.button}>
            Configurer la 2FA
        </Button>
    </View>
);

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

// ------------------------------
export default function ProfileScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { logout } = useAuth();
    const { apiFetch } = useApi();

    const [profile, setProfile] = React.useState<{ name: string; email: string } | null>(null);
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
                setProfile({ name: data.name || '', email: data.email || '' });
            } catch (err) {
                console.warn('Chargement du profil échoué', err);
                setProfile({ name: '', email: '' });
            } finally {
                setLoading(false);
            }
        })();
    }, [apiFetch]);

    const handleLogout = async () => {
        await logout();
        router.replace('/');
    };

    const handleSaveName = async (newName: string) => {
        // Exemple PUT /users/me
        try {
            await apiFetch('/users/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName }),
            });
            setProfile((p) => p && { ...p, name: newName });
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
            <InformationsForm name={profile.name} email={profile.email} onSave={handleSaveName} />
        ),
        securite: SecurityForm,
        paiements: PaymentsForm,
        notifications: () => (
            <NotificationsForm settings={notifSettings} onToggle={handleToggleNotif} />
        ),
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Avatar.Text
                    size={80}
                    label={profile.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    style={{ backgroundColor: theme.colors.backdrop }}
                    color={theme.colors.primary}
                />
                <Text variant="titleMedium" style={styles.name}>{profile.name}</Text>
                <Text variant="bodyMedium">Membre depuis mai 2023</Text>
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