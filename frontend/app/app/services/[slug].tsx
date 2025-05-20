import {router, useLocalSearchParams} from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';

export const screenOptions = {
    tabBarStyle: { display: 'none' }, // cache complètement la TabBar pour cette page
};

// fetch the correct api endpoint of the correct microservice
const fetchProviders = async (slug: string) => {
    const response = await fetch(`http://172.16.1.122:8080/api/providers/type/${slug}`);

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json();
}

export default function ServiceProvidersScreen() {
    const { slug } = useLocalSearchParams();

    // const providers = mockProviders[slug as keyof typeof mockProviders] || [];
    const providers = fetchProviders(slug as string);

    const handlePress = (id) => {
        // redirect to /services/provider/[id]
        router.push(`/services/provider/${id}`);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Prestataires pour : {slug}</Text>

            <FlatList
                data={providers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Card style={styles.card} onPress={() => handlePress(item.id)}>
                        <Card.Content>
                            <Title>{item.name}</Title>
                            <Paragraph>{item.email}</Paragraph>

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
