import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import Constants from 'expo-constants';
import {router} from "expo-router";

const apiUrl = Constants.expoConfig?.extra?.API_URL;

export default function LoginPage() {
    const { login } = useAuth();

    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState<string | null>(null);

    const handleLogin = async () => {
        setError(null);
        console.log('login');
        try {
            console.log('login 2');
            // 1) Utilisation de fetch brut, sans Authorization
            const res = await fetch(`${apiUrl}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: email,
                    password: password,
                }),
            });

            console.log('Response:', res);

            if (!res.ok) {
                // Récupérer le message d’erreur éventuel
                const err = await res.json().catch(() => null);
                throw new Error(err?.detail || 'Identifiants invalides');
            }

            // 2) Extraire le bon champ : access_token
            const data = await res.json();
            const token = data.access_token;
            if (!token) {
                throw new Error('Aucun token reçu');
            }

            // 3) Stocker le token et rediriger
            await login(token);
            // login() contient router.replace('/dashboard')
        } catch (e: any) {
            console.error('Login error:', e);
            setError(e.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="headlineSmall" style={styles.title}>
                Connexion
            </Text>

            {error && (
                <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>
            )}

            <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
            />

            <TextInput
                label="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />

            <Button mode="contained" onPress={handleLogin} style={styles.button}>
                Se connecter
            </Button>

            <Button
                onPress={() => {router.push('/signup')}}
                style={styles.link}
            >
                Pas de compte ? Inscrivez-vous
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, justifyContent: 'center' },
    title:     { textAlign: 'center', marginBottom: 24 },
    input:     { marginBottom: 12 },
    button:    { marginTop: 12 },
    link:      { marginTop: 8 },
});
