import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';

export const screenOptions = {
    tabBarStyle: { display: 'none' },
};

const mockProviders = {
    '1': {
        name: 'ExpressGo',
        description: 'Livraison express en 2h dans toute la ville.',
        phone: '06 00 00 00 01',
        email: 'contact@expressgo.fr',
    },
    '2': {
        name: 'RapidBox',
        description: 'Livraison de colis sécurisée avec suivi en temps réel.',
        phone: '06 00 00 00 02',
        email: 'contact@rapidbox.fr',
    },
};

export default function ProviderDetail() {
    const { id } = useLocalSearchParams();

    const provider = mockProviders[id as keyof typeof mockProviders];

    if (!provider) {
        return (
            <View style={styles.centered}>
                <Text style={{ color: 'red' }}>Prestataire introuvable</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title>{provider.name}</Title>
                    <Paragraph>{provider.description}</Paragraph>
                    <Paragraph>Téléphone : {provider.phone}</Paragraph>
                    <Paragraph>Email : {provider.email}</Paragraph>
                </Card.Content>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    card: { borderRadius: 12 },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
