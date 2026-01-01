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
                if (typeof item === 'string' && (item.startsWith('file://') || item.startsWith('content://') || item.startsWith('blob:'))) {
                    // C'est un fichier local
                    formData.append(key, {
                        uri: (Platform.OS === 'android') ? item : (item.startsWith('blob:') ? item : item.replace('file://', '')),
                        type: 'image/jpeg',
                        name: `${key}_${index}.jpg`,
                    } as any);
                } else {
                    formData.append(`${key}[${index}]`, item);
                }
            });
        }
        // Cas d'un fichier seul (uri string)
        else if (typeof value === 'string' && (value.startsWith('file://') || value.startsWith('content://') || value.startsWith('blob:'))) {
            formData.append(key, {
                uri: (Platform.OS === 'android') ? value : (value.startsWith('blob:') ? value : value.replace('file://', '')),
                type: 'image/jpeg',
                name: `${key}.jpg`,
            } as any);
        }
        // Cas d'un objet (ex: contact)
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
