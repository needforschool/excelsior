// DashboardScreen.tsx
import * as React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {
  Appbar,
  Card,
  Avatar,
  Text,
  Button,
  List,
  Divider,
  useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// On récupère le type des noms d'icônes supportés
type MCIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// --- Données factices -----------------
interface Metric {
  key: string;
  icon: MCIconName;
  label: string;
  value: string;
}
const METRICS: Metric[] = [
  { key: 'inProgress', icon: 'clock-outline',        label: 'Commandes en cours',   value: '2' },
  { key: 'completed',  icon: 'check-circle-outline', label: 'Commandes terminées', value: '15' },
  { key: 'spent',      icon: 'wallet-outline',       label: 'Total dépensé',        value: '384,50 €' },
  { key: 'rating',     icon: 'star-outline',         label: 'Note moyenne',        value: '4,8 / 5' },
];

interface Order {
  id: string;
  icon: MCIconName;
  service: string;
  date: string;
  status: 'En cours' | 'Terminé' | 'Annulé';
}
const RECENT_ORDERS: Order[] = [
  { id: '1', icon: 'truck-outline',  service: 'Transport et Livraison', date: '10 mars 2024 à 14:00', status: 'En cours' },
  { id: '2', icon: 'car-wash',       service: 'Nettoyage Véhicule',      date: '9 mars 2024 à 16:30',  status: 'Terminé' },
  { id: '3', icon: 'cube-outline',   service: 'Déménagement',            date: '6 mars 2024 à 09:00',  status: 'Terminé' },
];

interface Action {
  key: string;
  icon: MCIconName;
  label: string;
}
const QUICK_ACTIONS: Action[] = [
  { key: 'new',     icon: 'plus',                  label: 'Nouvelle commande' },
  { key: 'profile', icon: 'account-outline',       label: 'Modifier profil'   },
  { key: 'pay',     icon: 'credit-card-outline',   label: 'Gérer paiements'   },
  { key: 'help',    icon: 'help-circle-outline',   label: `Besoin d'aide`    },
];
// ---------------------------------------

export default function DashboardScreen() {
  const theme = useTheme();

  const getStatusColor = (status: Order['status']) => {
    if (status === 'En cours') return theme.colors.primary;
    if (status === 'Terminé') return theme.colors.secondary;
    return theme.colors.error;
  };

  const renderMetric = ({ item }: { item: Metric }) => (
      <Card style={styles.metricCard}>
        <View style={styles.metricContent}>
          <Avatar.Icon
              size={36}
              icon={item.icon}
              style={{ backgroundColor: theme.colors.backdrop }}
              color={theme.colors.onSurface}
          />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
                variant="bodySmall"
                style={styles.metricLabel}
                numberOfLines={2}
                ellipsizeMode="tail"
            >
              {item.label}
            </Text>
            <Text
                variant="titleMedium"
                style={styles.metricValue}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
              {item.value}
            </Text>
          </View>
        </View>
      </Card>
  );

  const renderOrder = ({ item }: { item: Order }) => {
    const color = getStatusColor(item.status);
    return (
        <List.Item
            title={item.service}
            titleNumberOfLines={2}
            description={item.date}
            descriptionNumberOfLines={1}
            left={() => (
                <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color={theme.colors.primary}
                    style={{ alignSelf: 'center' }}
                />
            )}
            right={() => (
                <View style={styles.orderRight}>
                  <Button
                      mode="outlined"
                      compact
                      textColor={color}
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

  const renderAction = ({ item }: { item: Action }) => (
      <React.Fragment key={item.key}>
        <List.Item
            title={item.label}
            left={() => (
                <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color={theme.colors.onSurface}
                    style={{ alignSelf: 'center' }}
                />
            )}
            right={() => (
                <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={theme.colors.onSurface}
                />
            )}
            onPress={() => {}}
        />
        <Divider />
      </React.Fragment>
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
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Commandes récentes
          </Text>
          <Card style={styles.sectionCard}>
            {RECENT_ORDERS.map((order, idx) => (
                <View key={order.id}>
                  {renderOrder({ item: order })}
                  {idx < RECENT_ORDERS.length - 1 && <Divider />}
                </View>
            ))}
          </Card>

          {/* Quick Actions */}
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Actions rapides
          </Text>
          <Card style={styles.sectionCard}>
            {QUICK_ACTIONS.map(action => (
                <View key={action.key}>
                  <List.Item
                      title={action.label}
                      titleNumberOfLines={1}
                      left={() => (
                          <MaterialCommunityIcons
                              name={action.icon}
                              size={24}
                              color={theme.colors.onSurface}
                              style={{ alignSelf: 'center' }}
                          />
                      )}
                      right={() => (
                          <MaterialCommunityIcons
                              name="chevron-right"
                              size={24}
                              color={theme.colors.onSurface}
                          />
                      )}
                      onPress={() => {}}
                  />
                  <Divider />
                </View>
            ))}
          </Card>

          {/* Promo Banner */}
          <Card style={[styles.sectionCard, styles.promoCard]}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: theme.colors.background }}>
                Offre spéciale !
              </Text>
              <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.background, marginTop: 4 }}
              >
                Bénéficiez de – 20 % sur votre prochaine commande…
              </Text>
              <Button
                  mode="contained"
                  style={{ marginTop: 12 }}
                  onPress={() => {}}
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
    flexBasis: '48%',
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
  },
  metricContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  metricLabel: {
    color: '#555',
    flexShrink: 1,
  },
  metricValue: {
    fontWeight: '600',
    flexShrink: 1,
  },

  sectionTitle: {
    marginTop: 16,
    marginHorizontal: 12,
  },
  sectionCard: {
    alignSelf: 'center',
    width: '95%',
    borderRadius: 8,
    elevation: 1,
    overflow: 'hidden',
    marginVertical: 8,
  },

  orderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  promoCard: {
    backgroundColor: '#333',
  },
});
