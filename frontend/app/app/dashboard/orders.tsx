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
import { useAuth } from '@/contexts/AuthContext';

type Order = {
    id: string;
    service: {
        id: string;
    };
    date: string;
    provider: {
        name: string;
        id: string;
    }
    price: number;
    status: 'en cours' | 'terminé' | 'annulé';
};

const FILTERS = ['Statut', 'Service', 'Prix', 'Date'] as const;

export default function MesCommandesScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { apiFetch } = useApi();
    const { user, isLoading: authLoading } = useAuth();

    const [orders, setOrders] = React.useState<Order[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!user) return;

        (async () => {
            try {
                const data = await apiFetch(`/users/${user.id}/orders-enriched/`);
                const mapped = data.map((o: any) => {
                    // 1) label du provider
                    const prov = o.provider;
                    let serv = o.service;
                    return {
                        id:       String(o.id),
                        service:  serv,
                        date:     new Date(o.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        }),
                        provider: prov,
                        price:    o.price ?? 0,
                        status:   o.status as Order['status'],
                    };
                });

                console.log('Commandes:', mapped);
                setOrders(mapped);
            } catch (err) {
                console.warn('Erreur chargement commandes', err);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    // Tant que le contexte auth ou la récupération des commandes est en cours
    if (authLoading || loading) {
        return (
            <View style={[styles.centered, styles.container]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const getServiceName = (type) => {
        switch (type) {
            case 'child-assistance':
                return 'Garde d\'enfants';
            case 'transport':
                return 'Transport';
            case 'cleaning':
                return 'Ménage';
            default:
                return type;
        }
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
                                    /* filtrage éventuel */
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
                             let badgeContainer: string;
                             switch (item.status) {
                                   case 'en cours':
                                         badgeColor     = theme.colors.primary;
                                         badgeContainer = theme.colors.primaryContainer;
                                         break;
                                       case 'terminé':
                                         badgeColor     = theme.colors.secondary;
                                         badgeContainer = theme.colors.secondaryContainer;
                                         break;
                                       case 'annulé':
                                         badgeColor     = theme.colors.error;
                                         badgeContainer = theme.colors.errorContainer;
                                         break;
                             }
                            return (
                                <Card style={styles.card}>
                                    <Card.Content style={styles.cardContent}>
                                        <View style={styles.left}>
                                            {/* Type*/}
                                            <Text style={styles.service}>{getServiceName(item.provider.type)}</Text>
                                            <Text style={styles.service}>{item.provider.name}</Text>
                                            <Text style={styles.date}>{item.date}</Text>d
                                        </View>
                                        <View style={styles.right}>
                                            <Chip
                                                style={[
                                                    styles.statusChip,
                                                    { backgroundColor: badgeColor},
                                                ]}
                                                textStyle={{ color: badgeColor, fontWeight: '600' }}
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
                                            {item.status === 'annulé' ? (
                                                <IconButton
                                                    icon="delete-outline"
                                                    size={20}
                                                    onPress={() => {/* supprimer */}}
                                                />
                                            ) : (
                                                <IconButton
                                                    icon="eye-outline"
                                                    size={20}
                                                    onPress={() => {/* voir détails */}}
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyText: { textAlign: 'center', marginBottom: 16 },
    ctaButton: { marginTop: 8 },
    filtersRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
        paddingHorizontal: 4,
        backgroundColor: '#fafafa',
    },
    filterButton: { minWidth: 80, marginHorizontal: 4 },
    list: { padding: 12 },
    card: { marginBottom: 12, borderRadius: 8, elevation: 2 },
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
    right: { alignItems: 'flex-end', justifyContent: 'space-between', height: 72 },
    statusChip: { alignSelf: 'flex-end', marginBottom: 4 },
    price: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
});
