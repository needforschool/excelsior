// app/prestataire/orders.tsx
import * as React from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    FlatList,
    SafeAreaView,
} from 'react-native';
import {
    Appbar,
    Card,
    Chip,
    Text,
    Button,
    IconButton,
    ActivityIndicator,
    useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type Order = {
    id: string;
    service: string;
    client_name: string;
    date: string;
    price: number;
    status: 'En attente' | 'En cours' | 'Terminé' | 'Annulé';
};

export default function PrestataireOrdersScreen() {
    const theme = useTheme();
    const { apiFetch } = useApi();
    const { user } = useAuth();
    const [orders, setOrders] = React.useState<Order[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const data = await apiFetch(
                    `/provider/${user.id}/orders/`
                );
                const mapped: Order[] = data.map((o: any) => ({
                    id: String(o.id),
                    service: o.service,
                    client_name: o.client_name,
                    date: new Date(o.date).toLocaleDateString('fr-FR'),
                    price: o.price,
                    status: o.status,
                }));
                setOrders(mapped);
            } catch (e) {
                console.warn(e);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    const handleAccept = async (orderId: string) => {
        try {
            await apiFetch(`/provider/orders/${orderId}/accept`, {
                method: 'POST',
            });
            // Raffraîchir
            setLoading(true);
            const fresh = await apiFetch(`/provider/${user?.id}/orders/`);
            setOrders(fresh);
        } catch (err: any) {
            alert(`Erreur : ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.centered, styles.container]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Appbar.Header>
                <Appbar.Content title="Interventions" />
            </Appbar.Header>

            {orders.length === 0 ? (
                <View style={styles.empty}>
                    <Text>Aucune demande d’intervention.</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(o) => o.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => {
                        let badgeColor: string;
                        switch (item.status) {
                            case 'En attente':
                                badgeColor = theme.colors.primary;
                                break;
                            case 'En cours':
                                badgeColor = theme.colors.secondary;
                                break;
                            case 'Terminé':
                                badgeColor = theme.colors.tertiary || '#4caf50';
                                break;
                            case 'Annulé':
                                badgeColor = theme.colors.error;
                                break;
                        }
                        return (
                            <Card style={styles.card}>
                                <Card.Content style={styles.cardContent}>
                                    <View style={styles.left}>
                                        <Text style={styles.service}>{item.service}</Text>
                                        <Text style={styles.client}>{item.client_name}</Text>
                                        <Text style={styles.date}>{item.date}</Text>
                                    </View>
                                    <View style={styles.right}>
                                        <Chip
                                            style={[styles.chip, { backgroundColor: badgeColor + '22' }]}
                                            textStyle={{ color: badgeColor }}
                                        >
                                            {item.status}
                                        </Chip>
                                        {item.status === 'En attente' ? (
                                            <Button
                                                mode="contained"
                                                compact
                                                onPress={() => handleAccept(item.id)}
                                            >
                                                Accepter
                                            </Button>
                                        ) : (
                                            <IconButton
                                                icon="eye"
                                                onPress={() => {
                                                    /* voir détails */
                                                }}
                                            />
                                        )}
                                    </View>
                                </Card.Content>
                            </Card>
                        );
                    }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 12 },
    card: { marginBottom: 12, borderRadius: 8 },
    cardContent: { flexDirection: 'row', justifyContent: 'space-between' },
    left: { flex: 1 },
    service: { fontSize: 16, fontWeight: '600' },
    client: { fontSize: 14, color: '#555' },
    date: { fontSize: 12, color: '#888', marginBottom: 4 },
    right: { justifyContent: 'center', alignItems: 'flex-end' },
    chip: { marginBottom: 8 },
});
