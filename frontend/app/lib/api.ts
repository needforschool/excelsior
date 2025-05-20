import { useAuth } from '@/contexts/AuthContext';
import Constants from "expo-constants";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

export const useApi = () => {
    const { token } = useAuth();

    const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
        console.log('Token:', token);
        const response = await fetch(`${apiUrl}${endpoint}`, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            },
        });

        // Lisez le corps une seule fois
        const text = await response.text();

        // Logger ce que vous voulez
        console.log('API request:', {
            url: `${apiUrl}${endpoint}`,
            options,
            status: response.status,
            response: text,
        });

        // Gérer les erreurs
        if (!response.ok) {
            let errMsg = 'Erreur lors de la requête API';
            try {
                // Si l’API renvoie { detail: "..." }, on l’affiche
                const errJson = JSON.parse(text);
                errMsg = errJson.detail || errJson.message || errMsg;
            } catch {
                // rien
            }
            throw new Error(errMsg);
        }

        // Enfin, on parse le JSON et on le retourne
        return JSON.parse(text);
    };

    return { apiFetch };
};
