import { useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';

export const screenOptions = {
    tabBarStyle: { display: 'none' }, // cache complètement la TabBar pour cette page
};

const mockProviders = {
    colis: [
        { id: '1', name: 'ExpressGo', description: 'Livraison express en 2h dans toute la ville.' },
        { id: '2', name: 'RapidBox', description: 'Livraison de colis sécurisée avec suivi en temps réel.' },
    ],
    demenagement: [
        { id: '1', name: 'MiniMove', description: 'Spécialiste des petits déménagements.' },
    ],
};

export default function ServiceProvidersScreen() {
    const { slug } = useLocalSearchParams();

    const providers = mockProviders[slug as keyof typeof mockProviders] || [];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Prestataires pour : {slug}</Text>

            <FlatList
                data={providers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title>{item.name}</Title>
                            <Paragraph>{item.description}</Paragraph>
                        </Card.Content>
                    </Card>
                )}
                contentContainerStyle={{ gap: 12 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    card: { borderRadius: 8 },
});
