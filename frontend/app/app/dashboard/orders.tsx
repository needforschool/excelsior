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
    Avatar,
    IconButton,
    useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Order = {
    id: string;
    service: string;
    date: string;
    provider: string;
    price: number;
    status: 'En cours' | 'Terminé' | 'Annulé';
};

const ORDERS: Order[] = [ /* ... */ ];
const FILTERS = ['Statut', 'Service', 'Prix', 'Date'] as const;

export default function MesCommandesScreen() {
    const theme = useTheme();
    const { width } = Dimensions.get('window');

    const {
        primary,
        secondary,
        error,
        onSurface,  
    } = theme.colors;

    const renderOrder = ({ item }: { item: Order }) => {
        let badgeColor: string;
        switch (item.status) {
            case 'En cours':
                badgeColor = primary;
                break;
            case 'Terminé':
                badgeColor = secondary;
                break;
            case 'Annulé':
                badgeColor = error;
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
                                color={onSurface}
                            />
                            <Text style={[styles.providerText, { color: onSurface }]}>
                                {item.provider}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.right}>
                        <Chip
                            style={[styles.statusChip, { backgroundColor: badgeColor + '22' }]}
                            textStyle={{ color: badgeColor, fontWeight: '600' }}
                        >
                            {item.status}
                        </Chip>
                        <Text style={[styles.price, { color: onSurface }]}>
                            {item.price} €
                        </Text>
                        {item.status === 'Annulé' ? (
                            <IconButton
                                icon="delete-outline"
                                size={20}
                                onPress={() => {}}
                            />
                        ) : (
                            <IconButton
                                icon="eye-outline"
                                size={20}
                                onPress={() => {}}
                            />
                        )}
                    </View>
                </Card.Content>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.Content title="Mes commandes" />
                <Appbar.Action icon="plus" size={28} onPress={() => {}} />
            </Appbar.Header>

            <View style={styles.filtersRow}>
                {FILTERS.map(filter => (
                    <Button
                        key={filter}
                        mode="outlined"
                        compact
                        style={styles.filterButton}
                        onPress={() => {}}
                    >
                        {filter}
                    </Button>
                ))}
            </View>

            <FlatList
                data={ORDERS}
                keyExtractor={o => o.id}
                renderItem={renderOrder}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { elevation: 1 },
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
