
import { FlatList, StyleSheet, View } from 'react-native';
import {Card, Title, Paragraph, useTheme, IconButton, Appbar} from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from "react";

type Service = {
    id: string;
    title: string;
    description: string;
    icon: string;
    slug: string;
};

const mockServices: Service[] = [
    {
        id: '1',
        title: 'Transport et Livraison de Colis',
        description:
            "Service express pour documents ou objets de valeur. Suivi en direct du coursier.",
        icon: 'truck-delivery',
        slug: 'transport',
    },
    {
        id: '2',
        title: 'Déménagement de Petits Volumes',
        description:
            "Déménagement rapide de quelques meubles/cartons avec suivi live.",
        icon: 'sofa',
        slug: 'moving',
    },
    {
        id: '3',
        title: 'Nettoyage Mobile de Véhicules',
        description:
            "Nettoyage voiture à domicile avec suivi de l’équipe et alertes.",
        icon: 'car-wash',
        slug: 'cleaning',
    },
    {
        id: '4',
        title: 'Dépannage Automobile',
        description:
            "Intervention batterie/pneus ou remorquage, avec suivi GPS en temps réel.",
        icon: 'car-wrench',
        slug: 'repair',
    },
    {
        id: '5',
        title: 'Garde et Accompagnement d’Enfants',
        description:
            "Service d’escorte enfants école/sport. Suivi de l’accompagnateur en temps réel.",
        icon: 'baby-face',
        slug: 'childcare',
    },
];

export default function ServicesScreen() {
    const { colors } = useTheme();

    const handlePress = (slug: string) => {
        router.push(`/services/${slug}`);
    };

    const renderItem = ({ item }: { item: Service }) => (
        <Card style={styles.card} mode="elevated" onPress={() => handlePress(item.slug)}>
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={item.icon} size={48} color={colors.primary} />
            </View>
            <Card.Content>
                <Title>{item.title}</Title>
                <Paragraph>{item.description}</Paragraph>
            </Card.Content>
        </Card>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Appbar.Header elevated>
                <Appbar.Content title={`Services`} />
            </Appbar.Header>
            <FlatList
                data={mockServices}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: 16,
        gap: 12,
    },
    card: {
        display: 'flex',
        borderRadius: 12,
        overflow: 'hidden',

    },
    iconContainer: {
        alignItems: 'center',
        paddingTop: 16,
    },
});
