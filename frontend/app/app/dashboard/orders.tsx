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
    Button,
    Card,
    Chip,
    Text,
    IconButton,
    useTheme,
    ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApi } from '@/lib/api';
import { useRouter } from 'expo-router';

type Order = {
    id: string;
    service: string;
    date: string;
    provider: string;
    price: number;
    status: 'En cours' | 'Terminé' | 'Annulé';
};

const FILTERS = ['Statut', 'Service', 'Prix', 'Date'] as const;

export default function MesCommandesScreen() {
    const theme = useTheme();
    const { width } = Dimensions.get('window');
    const router = useRouter();
    const { apiFetch } = useApi();

    const [orders, setOrders] = React.useState<Order[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        (async () => {
            try {
                // 1. Récupérer l'utilisateur courant
                const user = await apiFetch('/users/me');
                // 2. Récupérer ses commandes
                const data = await apiFetch(`/users/${user.id}/orders/`);
                // 3. Mapper au format Order
                const mapped: Order[] = data.map((o: any) => ({
                    id: String(o.id),
                    service: o.service || o.serviceName || 'Service inconnu',
                    date: new Date(o.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    }),
                    provider: o.provider || o.providerName || '—',
                    price: o.price ?? o.amount ?? 0,
                    status: o.status as Order['status'],
                }));
                console.log(data, mapped)
                setOrders(mapped);
            } catch (err) {
                console.warn('Erreur chargement commandes', err);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // -------------- UI ----------------
    if (loading) {
        return (
            <View style={[styles.centered, styles.container]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.Content title="Mes commandes" />
                <Appbar.Action
                    icon="plus"
                    size={28}
                    onPress={() => router.push('/dashboard/services')}
                />
            </Appbar.Header>

            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text variant="titleMedium" style={styles.emptyText}>
                        Vous n'avez aucune commande pour le moment.
                    </Text>
                    <Button
                        mode="contained"
                        onPress={() => router.push('/dashboard/services')}
                        style={styles.ctaButton}
                    >
                        Découvrir nos services
                    </Button>
                </View>
            ) : (
                <>
                    <View style={styles.filtersRow}>
                        {FILTERS.map((filter) => (
                            <Button
                                key={filter}
                                mode="outlined"
                                compact
                                style={styles.filterButton}
                                onPress={() => {
                                    /* éventuellement filtrer la liste */
                                }}
                            >
                                {filter}
                            </Button>
                        ))}
                    </View>

                    <FlatList
                        data={orders}
                        keyExtractor={(o) => o.id}
                        renderItem={({ item }) => {
                            let badgeColor: string;
                            switch (item.status) {
                                case 'En cours':
                                    badgeColor = theme.colors.primary;
                                    break;
                                case 'Terminé':
                                    badgeColor = theme.colors.secondary;
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
                                            <Text style={styles.date}>{item.date}</Text>
                                            <View style={styles.providerRow}>
                                                <MaterialCommunityIcons
                                                    name="account-outline"
                                                    size={16}
                                                    color={theme.colors.onSurface}
                                                />
                                                <Text
                                                    style={[
                                                        styles.providerText,
                                                        { color: theme.colors.onSurface },
                                                    ]}
                                                >
                                                    {item.provider}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.right}>
                                            <Chip
                                                style={[
                                                    styles.statusChip,
                                                    { backgroundColor: badgeColor + '22' },
                                                ]}
                                                textStyle={{
                                                    color: badgeColor,
                                                    fontWeight: '600',
                                                }}
                                            >
                                                {item.status}
                                            </Chip>
                                            <Text
                                                style={[
                                                    styles.price,
                                                    { color: theme.colors.onSurface },
                                                ]}
                                            >
                                                {item.price} €
                                            </Text>
                                            {item.status === 'Annulé' ? (
                                                <IconButton
                                                    icon="delete-outline"
                                                    size={20}
                                                    onPress={() => {
                                                        /* supprimer la commande */
                                                    }}
                                                />
                                            ) : (
                                                <IconButton
                                                    icon="eye-outline"
                                                    size={20}
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
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { justifyContent: 'center', alignItems: 'center' },

    header: { elevation: 1 },

    // UI “empty state”
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyText: {
        textAlign: 'center',
        marginBottom: 16,
    },
    ctaButton: {
        marginTop: 8,
    },

    filtersRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
        paddingHorizontal: 4,
        backgroundColor: '#fafafa',
    },
    filterButton: {
        minWidth: 80,
        marginHorizontal: 4,
    },

    list: { padding: 12 },
    card: {
        marginBottom: 12,
        borderRadius: 8,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    left: { flex: 1, paddingRight: 8 },
    service: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    date: { fontSize: 14, color: '#555', marginBottom: 6 },
    providerRow: { flexDirection: 'row', alignItems: 'center' },
    providerText: { marginLeft: 4, fontSize: 14 },
    right: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 72,
    },
    statusChip: {
        alignSelf: 'flex-end',
        marginBottom: 4,
    },
    price: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
});
