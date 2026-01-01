import { Platform } from 'react-native';

/**
 * Convertit un objet plat en FormData, gérant les fichiers (URI locales).
 * Supporte les tableaux de fichiers (e.g., images).
 */
/**
 * Convertit un objet plat en FormData, gérant les fichiers (URI locales).
 * Supporte les tableaux de fichiers (e.g., images).
 * ASYNC pour supporter le fetch de Blobs sur Web.
 */
export const toFormData = async (data: Record<string, any>): Promise<FormData> => {
    const formData = new FormData();

    for (const key of Object.keys(data)) {
        const value = data[key];

        if (value === undefined || value === null) continue;

        // Cas des tableaux (souvent pour les images)
        if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                const item = value[i];
                const itemUri = (typeof item === 'string') ? item : (item && typeof item === 'object' ? item.uri : null);

                if (itemUri && typeof itemUri === 'string' && (itemUri.startsWith('file://') || itemUri.startsWith('content://') || itemUri.startsWith('blob:') || itemUri.startsWith('data:'))) {
                    // C'est un fichier local
                    if (Platform.OS === 'web') {
                        // Sur Web, il faut convertir l'URI en Blob
                        try {
                            const response = await fetch(itemUri);
                            const blob = await response.blob();
                            formData.append(key, blob, `image_${Date.now()}_${i}.jpg`);
                        } catch (e) {
                            console.error("Erreur conversion Blob Web:", e);
                        }
                    } else {
                        // Native
                        formData.append(key, {
                            uri: itemUri,
                            type: 'image/jpeg',
                            name: `${key}_${i}.jpg`,
                        } as any);
                    }
                } else {
                    // Non-fichier : repeat keys
                    formData.append(key, item);
                }
            }
        }
        // Cas d'un fichier seul (uri string ou objet avec uri)
        else if (
            (typeof value === 'string' && (value.startsWith('file://') || value.startsWith('content://') || value.startsWith('blob:') || value.startsWith('data:'))) ||
            (typeof value === 'object' && value !== null && typeof value.uri === 'string' && (value.uri.startsWith('file://') || value.uri.startsWith('content://') || value.uri.startsWith('blob:') || value.uri.startsWith('data:')))
        ) {
            const uri = typeof value === 'string' ? value : value.uri;

            if (Platform.OS === 'web') {
                try {
                    const response = await fetch(uri);
                    const blob = await response.blob();
                    formData.append(key, blob, `image_${Date.now()}.jpg`);
                } catch (e) {
                    console.error("Erreur conversion Blob Web (Single):", e);
                }
            } else {
                formData.append(key, {
                    uri: (Platform.OS === 'android') ? uri : uri.replace('file://', ''),
                    type: 'image/jpeg', // Mimetype par défaut
                    name: `${key}.jpg`,
                } as any);
            }
        }
        // Cas d'un objet (ex: contact) qui n'est pas un fichier
        else if (typeof value === 'object' && value !== null) {
            formData.append(key, JSON.stringify(value));
        }
        // Valeur simple
        else {
            formData.append(key, value);
        }
    }

    return formData;
};
