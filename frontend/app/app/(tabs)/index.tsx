// DashboardScreen.tsx
import * as React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {
  Appbar,
  Card,
  Avatar,
  Title,
  Paragraph,
  useTheme,
  Text,
  Button,
  List,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- Données factices -----------------
const METRICS = [
  {
    key: 'inProgress',
    icon: 'clock-outline',
    label: 'Commandes en cours',
    value: '2',
  },
  {
    key: 'completed',
    icon: 'check-circle-outline',
    label: 'Commandes terminées',
    value: '15',
  },
  {
    key: 'spent',
    icon: 'wallet-outline',
    label: 'Total dépensé',
    value: '384,50 €',
  },
  {
    key: 'rating',
    icon: 'star-outline',
    label: 'Note moyenne',
    value: '4,8 / 5',
  },
];

const RECENT_ORDERS = [
  {
    id: '1',
    icon: 'truck-outline',
    service: 'Transport et Livraison',
    date: '10 mars 2024 à 14:00',
    status: 'En cours',
  },
  {
    id: '2',
    icon: 'car-wash',
    service: 'Nettoyage Véhicule',
    date: '9 mars 2024 à 16:30',
    status: 'Terminé',
  },
  {
    id: '3',
    icon: 'cube-outline',
    service: 'Déménagement',
    date: '6 mars 2024 à 09:00',
    status: 'Terminé',
  },
];

const QUICK_ACTIONS = [
  { key: 'new',    icon: 'plus',         label: 'Nouvelle commande' },
  { key: 'profile',icon: 'account-outline', label: 'Modifier profil' },
  { key: 'pay',    icon: 'credit-card-outline', label: 'Gérer paiements' },
  { key: 'help',   icon: 'help-circle-outline',  label: `Besoin d'aide` },
];
// ---------------------------------------

export default function DashboardScreen() {
  const theme = useTheme();
  const { width } = Dimensions.get('window');

  // Badge color helper
  const getStatusColor = (status: string) => {
    if (status === 'En cours') return theme.colors.primary;
    if (status === 'Terminé') return theme.colors.secondary;
    return theme.colors.error;
  };

  const renderMetric = ({ item }: any) => (
      <Card style={[styles.metricCard, { width: width * 0.42 }]}>
        <View style={styles.metricContent}>
          <Avatar.Icon
              size={36}
              icon={item.icon}
              style={{ backgroundColor: theme.colors.backdrop }}
              color={theme.colors.onSurface}
          />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.metricLabel}>{item.label}</Text>
            <Text style={styles.metricValue}>{item.value}</Text>
          </View>
        </View>
      </Card>
  );

  const renderOrder = ({ item }: any) => {
    const color = getStatusColor(item.status);
    return (
        <List.Item
            title={item.service}
            description={item.date}
            left={props => (
                <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color={theme.colors.primary}
                    style={{ alignSelf: 'center' }}
                />
            )}
            right={props => (
                <View style={styles.orderRight}>
                  <Button
                      mode="outlined"
                      compact
                      labelStyle={{ color }}
                      style={{ borderColor: color }}
                  >
                    {item.status}
                  </Button>
                  <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color={theme.colors.onSurface}
                  />
                </View>
            )}
        />
    );
  };

  const renderAction = ({ item }: any) => (
      <>
        <List.Item
            title={item.label}
            left={props => <MaterialCommunityIcons name={item.icon} size={24} color={theme.colors.onSurface} style={{ alignSelf: 'center' }} />}
            right={props => <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurface} />}
            onPress={() => {/* gérer l'action */}}
        />
        <Divider />
      </>
  );

  return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.Content title="Tableau de bord" />
        </Appbar.Header>

        <ScrollView>
          {/* Metrics */}
          <View style={styles.metricsRow}>
            {METRICS.map(metric => renderMetric({ item: metric }))}
          </View>

          {/* Recent Orders */}
          <Title style={styles.sectionTitle}>Commandes récentes</Title>
          <Card style={styles.sectionCard}>
            {RECENT_ORDERS.map(order => (
                <React.Fragment key={order.id}>
                  {renderOrder({ item: order })}
                  {order.id !== RECENT_ORDERS[RECENT_ORDERS.length - 1].id && <Divider />}
                </React.Fragment>
            ))}
          </Card>

          {/* Quick Actions */}
          <Title style={styles.sectionTitle}>Actions rapides</Title>
          <Card style={styles.sectionCard}>
            {QUICK_ACTIONS.map(action => (
                <React.Fragment key={action.key}>
                  {renderAction({ item: action })}
                </React.Fragment>
            ))}
          </Card>

          {/* Promo Banner */}
          <Card style={[styles.promoCard, { backgroundColor: theme.colors.onSurface }]}>
            <Card.Content>
              <Title style={{ color: theme.colors.background }}>Offre spéciale ! </Title>
              <Paragraph style={{ color: theme.colors.background }}>
                Bénéficiez de – 20 % sur votre prochaine commande de transport avec le code QUICK20.
              </Paragraph>
              <Button
                  mode="contained"
                  onPress={() => {/* copier le code */}}
                  style={{ marginTop: 12 }}
              >
                Copier le code
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { elevation: 2 },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 12,
  },
  metricCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
  },
  metricContent: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  metricLabel: { fontSize: 14, color: '#555' },
  metricValue: { fontSize: 20, fontWeight: '600' },

  sectionTitle: {
    marginTop: 16,
    marginHorizontal: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  sectionCard: {
    margin: 12,
    borderRadius: 8,
    elevation: 1,
    overflow: 'hidden',
  },

  orderRight: { flexDirection: 'row', alignItems: 'center' },

  promoCard: {
    margin: 12,
    borderRadius: 8,
  },
});
