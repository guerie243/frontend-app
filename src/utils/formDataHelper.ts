import { Platform } from 'react-native';

/**
 * Convertit un objet plat en FormData, gérant les fichiers (URI locales).
 * Supporte les tableaux de fichiers (e.g., images).
 */
export const toFormData = (data: Record<string, any>): FormData => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
        const value = data[key];

        if (value === undefined || value === null) return;

        // Cas des tableaux (souvent pour les images)
        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                const itemUri = (typeof item === 'string') ? item : (item && typeof item === 'object' ? item.uri : null);

                if (itemUri && typeof itemUri === 'string' && (itemUri.startsWith('file://') || itemUri.startsWith('content://') || itemUri.startsWith('blob:'))) {
                    // C'est un fichier local
                    formData.append(key, {
                        uri: (Platform.OS === 'android') ? itemUri : (itemUri.startsWith('blob:') ? itemUri : itemUri.replace('file://', '')),
                        type: 'image/jpeg',
                        name: `${key}_${index}.jpg`,
                    } as any);
                } else {
                    // Pour les tableaux non-fichiers, on utilise une notation compatible PHP/Express
                    formData.append(`${key}[${index}]`, item);
                }
            });
        }
        // Cas d'un fichier seul (uri string ou objet avec uri)
        else if (
            (typeof value === 'string' && (value.startsWith('file://') || value.startsWith('content://') || value.startsWith('blob:'))) ||
            (typeof value === 'object' && value !== null && typeof value.uri === 'string' && (value.uri.startsWith('file://') || value.uri.startsWith('content://') || value.uri.startsWith('blob:')))
        ) {
            const uri = typeof value === 'string' ? value : value.uri;
            formData.append(key, {
                uri: (Platform.OS === 'android') ? uri : (uri.startsWith('blob:') ? uri : uri.replace('file://', '')),
                type: 'image/jpeg',
                name: `${key}.jpg`,
            } as any);
        }
        // Cas d'un objet (ex: contact) qui n'est pas un fichier
        else if (typeof value === 'object' && value !== null) {
            formData.append(key, JSON.stringify(value));
        }
        // Valeur simple
        else {
            formData.append(key, value);
        }
    });

    return formData;
};
