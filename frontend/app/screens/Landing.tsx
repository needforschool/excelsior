// screens/Landing.tsx
import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Landing() {
    const router = useRouter();
    const { login } = useAuth();
    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.content}>
                <Text variant="headlineMedium" style={styles.title}>
                    Bienvenue sur QuickServe
                </Text>

                <Button
                    mode="contained"
                    style={styles.button}
                    onPress={() => router.push('/login')}
                >
                    Se connecter
                </Button>

                <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
                    Ou
                </Text>

                <Button
                    mode="outlined"
                    style={styles.button}
                    onPress={() => router.push('/signup')}
                >
                    Créer un compte
                </Button>
                {__DEV__ && (
                    <Button
                        mode="outlined"
                        style={styles.debugButton}
                        onPress={async () => {
                            // Ici tu passes un token bidon, peu importe la valeur
                            await login('DEBUG_TOKEN');
                        }}
                    >
                        🔧 Bypass Auth (Debug)
                    </Button>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex:1, justifyContent:'center', alignItems:'center', padding:16 },
    title: { marginBottom:40 },
    button: { width:'80%', marginBottom:16 },
    debugButton: { width:'60%', marginTop: 24, borderColor: 'gray' },
});
