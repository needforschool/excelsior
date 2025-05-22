import React, { useState, useContext } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
    Text,
    Alert,
} from 'react-native';
import { Title, Button, Chip, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApi } from '@/lib/api';           // ← ton hook pour appeler l'API
import { useAuth } from '@/contexts/AuthContext';     // ← pour récupérer l'utilisateur courant

type ScheduleParams = {
    id: string;
    service: string;
    provider: string;
};

export default function ScheduleScreen() {
    const { id, service, provider } = useLocalSearchParams<ScheduleParams>();
    const router = useRouter();
    const theme = useTheme();
    const { apiFetch } = useApi();
    const { user } = useAuth();

    // parse du service
    const rawService = service ? JSON.parse(decodeURIComponent(service)) : null;
    const providerService = Array.isArray(rawService) ? rawService[0] : rawService;
    // parse du provider (si besoin ailleurs)
    const rawProvider = provider ? JSON.parse(decodeURIComponent(provider)) : null;
    console.log('Provider Service:', providerService);
    console.log('Raw Provider:', rawProvider);

    const availabilities: Record<string, Record<string, boolean>> =
        providerService?.availabilities ?? {};

    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    // Génère les 7 prochains jours + créneaux
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });
    const slots = ['09:00', '10:00', '11:00', '14:00', '15:00'];

    // ≡ confirm(), mais crée une order via l'API
    const confirm = async () => {
        if (!selectedSlot) {
            return Alert.alert('Sélectionnez un créneau');
        }

        try {
            const payload = {
                id_user:     user!.id,                     // depuis ton contexte auth
                id_provider: Number(id),                  // segment de route
                service_type: rawProvider.type,       // ex. "transport", "cleaning"…
                id_service:  providerService.id,          // l'ID de l'objet service
                status: 'en cours',                       // ou "pending"
                latitude:    rawProvider.latitude,     // lat du service
                longitude:   rawProvider.longitude,    // long du service
            };

            console.log('Payload:', payload);

            // envoi à POST /orders/
            const newOrder = await apiFetch('/orders/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body:    JSON.stringify(payload),
            });

            // succès !
            Alert.alert(
                'Rendez-vous confirmé',
                `Votre commande #${newOrder.id} est créée pour ${selectedSlot}`
            );
            router.back();
        } catch (err: any) {
            console.error('Erreur création commande', err);
            Alert.alert('Erreur', err.message || 'Impossible de créer la commande');
        }
    };

    return (
        <SafeAreaView
            style={[
                styles.safeArea,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Title style={styles.heading}>
                    Agenda de {rawProvider?.user.firstName}{' '}
                    {rawProvider?.user.lastName}
                </Title>

                {days.map((day) => {
                    const weekday = day
                        .toLocaleDateString('en-US', { weekday: 'long' })
                        .toLowerCase();
                    const label = day.toLocaleDateString(undefined, {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'numeric',
                    });
                    const dayAvail = availabilities[weekday] ?? {};

                    return (
                        <View key={day.toDateString()} style={styles.dayBlock}>
                            <Text style={styles.dayLabel}>{label}</Text>
                            <View style={styles.slotRow}>
                                {slots.map((slot) => {
                                    const code = `${day.toDateString()}_${slot}`;
                                    const isFree = dayAvail[slot] === true;
                                    return (
                                        <Chip
                                            key={code}
                                            mode={
                                                selectedSlot === code ? 'flat' : 'outlined'
                                            }
                                            selected={selectedSlot === code}
                                            disabled={!isFree}
                                            onPress={() => isFree && setSelectedSlot(code)}
                                            style={[
                                                styles.chip,
                                                !isFree && { opacity: 0.4 },
                                            ]}
                                        >
                                            {slot}
                                        </Chip>
                                    );
                                })}
                            </View>
                        </View>
                    );
                })}

                <Button
                    mode="contained"
                    onPress={confirm}
                    disabled={!selectedSlot}
                    style={styles.confirmButton}
                >
                    Confirmer
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { padding: 16 },
    heading: {
        marginBottom: 16,
        fontSize: 20,
        textAlign: 'center',
    },
    dayBlock: { marginBottom: 24 },
    dayLabel: {
        fontWeight: '600',
        marginBottom: 8,
    },
    slotRow: { flexDirection: 'row', flexWrap: 'wrap' },
    chip: { margin: 4 },
    confirmButton: { marginTop: 16 },
});
