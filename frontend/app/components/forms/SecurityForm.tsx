import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Portal, Modal, useTheme } from 'react-native-paper';
import { useApi } from '@/lib/api';

export const SecurityForm: React.FC = () => {
    const theme = useTheme();
    const { apiFetch } = useApi();
    const [modalVisible, setModalVisible] = React.useState(false);
    const [oldPwd, setOldPwd] = React.useState('');
    const [newPwd, setNewPwd] = React.useState('');
    const [confirmPwd, setConfirmPwd] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const openModal = () => setModalVisible(true);
    const closeModal = () => {
        setOldPwd('');
        setNewPwd('');
        setConfirmPwd('');
        setModalVisible(false);
    };

    const passwordsMatch = newPwd === confirmPwd;
    const canConfirm = !loading && oldPwd && newPwd && confirmPwd && passwordsMatch;

    const handleChangePwd = async () => {
        setLoading(true);
        if (!passwordsMatch) {
            alert('Les nouveaux mots de passe ne correspondent pas');
            setLoading(false);
            return;
        }
        try {
            await apiFetch('/users/me/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ old_password: oldPwd, new_password: newPwd }),
            });
            alert('Mot de passe changé avec succès');
            closeModal();
        } catch (err: any) {
            alert(`Erreur : ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="bodyMedium" style={styles.text}>
                Changer le mot de passe pour sécuriser votre compte.
            </Text>
            <Button
                mode="outlined"
                icon="lock-reset"
                onPress={openModal}
                style={styles.button}
            >
                Modifier le mot de passe
            </Button>

            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={closeModal}
                    contentContainerStyle={[
                        styles.modalContainer,
                        { backgroundColor: theme.colors.background },
                    ]}
                >
                    <Text variant="titleSmall" style={styles.modalTitle}>
                        Changement de mot de passe
                    </Text>
                    <TextInput
                        label="Mot de passe actuel"
                        secureTextEntry
                        value={oldPwd}
                        onChangeText={setOldPwd}
                        mode="outlined"
                        style={styles.input}
                    />
                    <TextInput
                        label="Nouveau mot de passe"
                        secureTextEntry
                        value={newPwd}
                        onChangeText={setNewPwd}
                        mode="outlined"
                        style={styles.input}
                    />
                    <TextInput
                        label="Confirmer le nouveau mot de passe"
                        secureTextEntry
                        value={confirmPwd}
                        onChangeText={setConfirmPwd}
                        mode="outlined"
                        style={styles.input}
                    />
                    {confirmPwd.length > 0 && !passwordsMatch && (
                        <Text style={[styles.errorText, { color: theme.colors.error }]}>
                            Les mots de passe ne correspondent pas
                        </Text>
                    )}
                    <View style={styles.modalButtons}>
                        <Button
                            mode="contained"
                            onPress={handleChangePwd}
                            loading={loading}
                            disabled={!canConfirm}
                            style={styles.modalButton}
                        >
                            Confirmer
                        </Button>
                        <Button
                            mode="text"
                            onPress={closeModal}
                            disabled={loading}
                            style={styles.modalButton}
                        >
                            Annuler
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },
    text: { marginBottom: 12 },
    button: { marginBottom: 16 },
    modalContainer: { margin: 20, padding: 20, borderRadius: 8 },
    modalTitle: { marginBottom: 16, fontWeight: '600' },
    input: { marginBottom: 12 },
    errorText: { marginBottom: 12 },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
    modalButton: { marginLeft: 8 },
});
