import React, { useState } from 'react';
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

export default function ScheduleScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const theme = useTheme();

    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    // Génération des 7 prochains jours
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    const slots = ['09:00', '10:00', '11:00', '14:00', '15:00'];

    const confirm = () => {
        if (!selectedSlot) {
            Alert.alert('Sélectionnez un créneau');
            return;
        }
        Alert.alert(
            'Rendez‑vous enregistré',
            `Vous avez pris rendez‑vous le ${selectedSlot}`
        );
        router.back();
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.container}>
                <Title style={styles.heading}>Agenda du prestataire #{id}</Title>

                {days.map(day => {
                    const label = day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'numeric' });
                    return (
                        <View key={day.toDateString()} style={styles.dayBlock}>
                            <Text style={styles.dayLabel}>{label}</Text>
                            <View style={styles.slotRow}>
                                {slots.map(slot => {
                                    const code = `${day.toDateString()}_${slot}`;
                                    return (
                                        <Chip
                                            key={code}
                                            mode={selectedSlot === code ? 'flat' : 'outlined'}
                                            selected={selectedSlot === code}
                                            onPress={() => setSelectedSlot(code)}
                                            style={styles.chip}
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
    heading: { marginBottom: 16, fontSize: 20, textAlign: 'center' },
    dayBlock: { marginBottom: 24 },
    dayLabel: { fontWeight: '600', marginBottom: 8 },
    slotRow: { flexDirection: 'row', flexWrap: 'wrap' },
    chip: { margin: 4 },
    confirmButton: { marginTop: 16 },
});
