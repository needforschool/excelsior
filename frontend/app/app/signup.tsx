// app/signup.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL;

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [error, setError]         = useState<string | null>(null);
    const [loading, setLoading]     = useState(false);
    const [success, setSuccess]     = useState(false);

    const handleSignup = async () => {
        setError(null);
        setSuccess(false);
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.detail || data.message || 'Échec de l’inscription');
            }
            setSuccess(true);
            // après un court délai, redirige vers login
            setTimeout(() => router.replace('/login'), 1500);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="headlineSmall" style={styles.title}>
                Inscription
            </Text>

            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : success ? (
                <Text style={styles.successText}>Inscription réussie ! Redirection…</Text>
            ) : null}

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

            {loading ? (
                <ActivityIndicator style={styles.loader} />
            ) : (
                <Button mode="contained" onPress={handleSignup} style={styles.button}>
                    S'inscrire
                </Button>
            )}

            <Button
                onPress={() => router.replace('/login')}
                style={styles.link}
            >
                Déjà un compte ? Connexion
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
    loader:    { marginVertical: 12 },
    errorText:   { color: 'red', textAlign: 'center', marginBottom: 12 },
    successText: { color: 'green', textAlign: 'center', marginBottom: 12 },
});
