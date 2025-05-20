import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text, Menu, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL;

export default function SignupPage() {
    const router = useRouter();
    // états pour tous les champs du modèle User
    const [lastName, setLastName]   = useState('Doe');
    const [firstName, setFirstName] = useState('John');
    const [phone, setPhone]         = useState('0612345678');
    const [email, setEmail]         = useState('jdoe@gmail.com');
    const [password, setPassword]   = useState('password');
    const [error, setError]         = useState<string | null>(null);
    const [loading, setLoading]     = useState(false);
    const [success, setSuccess]     = useState(false);

    const handleSignup = async () => {
        setError(null);
        setSuccess(false);
        setLoading(true);
        console.log(`${apiUrl}/users`);
        try {
            const res = await fetch(`${apiUrl}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lastName,
                    firstName,
                    phone,
                    email,
                    password,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.detail || data.message || 'Échec de l’inscription');
            }
            setSuccess(true);
            setTimeout(() => router.replace('/login'), 1500);
        } catch (e: any) {
            console.error(e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="headlineSmall" style={styles.title}>Inscription</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}
            {success && <Text style={styles.successText}>Inscription réussie ! Redirection…</Text>}

            <TextInput
                label="Nom"
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
            />
            <TextInput
                label="Prénom"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
            />
            <TextInput
                label="Téléphone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={styles.input}
            />
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

            {loading
                ? <ActivityIndicator style={styles.loader} />
                : <Button mode="contained" onPress={handleSignup} style={styles.button}>
                    S'inscrire
                </Button>
            }

            <Button onPress={() => router.replace('/login')} style={styles.link}>
                Déjà un compte ? Connexion
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container:  { flex: 1, padding: 16, justifyContent: 'center' },
    title:      { textAlign: 'center', marginBottom: 24 },
    input:      { marginBottom: 12 },
    button:     { marginTop: 12 },
    link:       { marginTop: 8 },
    loader:     { marginVertical: 12 },
    errorText:   { color: 'red', textAlign: 'center', marginBottom: 12 },
    successText: { color: 'green', textAlign: 'center', marginBottom: 12 },
});
