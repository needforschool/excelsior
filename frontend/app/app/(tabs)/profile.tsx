import * as React from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    ScrollView,
} from 'react-native';
import {
    Avatar,
    Title,
    Paragraph,
    useTheme,
    TextInput,
    Button,
    Switch,
    Card,
    Text,
} from 'react-native-paper';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

// --- Composants de chaque onglet -----------------
const InformationsForm: React.FC = () => {
    const [firstName, setFirstName] = React.useState('Jean');
    const [lastName, setLastName]   = React.useState('Dupont');
    const [email] = React.useState('jean.dupont@example.com');
    const [phone, setPhone]         = React.useState('+33 6 12 34 56 78');
    const [address, setAddress]     = React.useState('10 Rue de Paris, 75002 Paris');

    return (
        <ScrollView contentContainerStyle={styles.formContainer}>
            <TextInput
                label="Prénom"
                value={firstName}
                onChangeText={setFirstName}
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="Nom"
                value={lastName}
                onChangeText={setLastName}
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
            <TextInput
                label="Téléphone"
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
            />
            <TextInput
                label="Adresse"
                value={address}
                onChangeText={setAddress}
                mode="outlined"
                multiline
                style={styles.input}
            />
            <Button mode="contained" onPress={() => {/* submit */}} style={styles.button}>
                Mettre à jour
            </Button>
        </ScrollView>
    );
};

const SecurityForm: React.FC = () => (
    <ScrollView contentContainerStyle={styles.formContainer}>
        <Paragraph>Changer le mot de passe pour sécuriser votre compte.</Paragraph>
        <Button mode="outlined" icon="lock-reset" onPress={() => {}} style={styles.button}>
            Modifier le mot de passe
        </Button>

        <Paragraph style={{ marginTop: 16 }}>
            Authentification à deux facteurs
        </Paragraph>
        <Button mode="outlined" icon="shield-key" onPress={() => {}} style={styles.button}>
            Configurer la 2FA
        </Button>
    </ScrollView>
);

const PaymentsForm: React.FC = () => (
    <ScrollView contentContainerStyle={styles.formContainer}>
        <Card style={{ marginBottom: 16 }}>
            <Card.Title
                title="•••• •••• •••• 4242"
                subtitle="Expire le 12/25"
                left={() => <Avatar.Icon size={40} icon="credit-card-outline" />}
                right={() => (
                    <Button
                        icon="delete"
                        onPress={() => {}}
                        compact
                    />
                )}
            />
        </Card>
        <Button mode="outlined" icon="plus" onPress={() => {}} style={styles.button}>
            Ajouter un moyen de paiement
        </Button>
    </ScrollView>
);

const NotificationsForm: React.FC = () => {
    const [emailNotif, setEmailNotif] = React.useState(true);
    const [pushNotif, setPushNotif]   = React.useState(true);
    const [smsNotif, setSmsNotif]     = React.useState(false);
    const [newslett, setNewslett]     = React.useState(false);

    return (
        <ScrollView contentContainerStyle={styles.formContainer}>
            {[
                { label: 'Notifications par email', value: emailNotif, setter: setEmailNotif },
                { label: 'Notifications push',     value: pushNotif,   setter: setPushNotif   },
                { label: 'SMS',                     value: smsNotif,    setter: setSmsNotif    },
                { label: 'Newsletter',              value: newslett,    setter: setNewslett    },
            ].map(({ label, value, setter }) => (
                <View key={label} style={styles.switchRow}>
                    <Text>{label}</Text>
                    <Switch value={value} onValueChange={setter} />
                </View>
            ))}
            <Button mode="contained" onPress={() => {}} style={styles.button}>
                Enregistrer les préférences
            </Button>
        </ScrollView>
    );
};
// -------------------------------------------------

type Route = { key: string; title: string };

export default function ProfileScreen() {
    const theme = useTheme();
    const layout = Dimensions.get('window');

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState<Route[]>([
        { key: 'infos',         title: 'Infos perso'   },
        { key: 'securite',      title: 'Sécurité'      },
        { key: 'paiements',     title: 'Paiements'     },
        { key: 'notifications', title: 'Notifications' },
    ]);

    const renderScene = SceneMap({
        infos:         InformationsForm,
        securite:      SecurityForm,
        paiements:     PaymentsForm,
        notifications: NotificationsForm,
    });

    return (
        <View style={styles.container}>
            {/* En-tête */}
            <View style={styles.header}>
                <Avatar.Text
                    size={80}
                    label="JD"
                    style={{ backgroundColor: theme.colors.backdrop }}
                    color={theme.colors.primary}
                />
                <Title style={styles.name}>Jean Dupont</Title>
                <Paragraph>Membre depuis mai 2023</Paragraph>
            </View>

            {/* Onglets */}
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={props => (
                    <TabBar
                        {...props}
                        style={styles.tabBar}
                        indicatorStyle={{ backgroundColor: '#317ac1' }}
                        activeColor="#317ac1"
                        inactiveColor={theme.colors.backdrop}
                        scrollEnabled={false}
                        tabStyle={styles.tab}
                        labelStyle={styles.label}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: '#FFF',
    },
    name: {
        marginTop: 12,
        fontSize: 20,
        fontWeight: 'bold',
    },
    tabBar: {
        backgroundColor: '#FFF',
        elevation: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    tab: {
        width: 'auto',
    },
    label: {
        textTransform: 'none',
        fontSize: 14,
        fontWeight: '600',
    },
    formContainer: {
        padding: 16,
    },
    input: {
        marginBottom: 12,
    },
    button: {
        marginTop: 12,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
});
