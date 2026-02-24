/**
 * Configuration des contacts de l'application
 * Modifiez ce fichier pour ajouter ou retirer des moyens de contact.
 */
export interface ContactMethod {
    id: string;
    type: 'email' | 'whatsapp' | 'phone' | 'website' | 'address';
    label: string;
    value: string;
    icon: string;
    linkPrefix?: string;
}

export const CONTACT_CONFIG: ContactMethod[] = [
    {
        id: 'email',
        type: 'email',
        label: 'Email',
        value: 'andy.app.conctact@gmail.com',
        icon: 'mail-outline',
        linkPrefix: 'mailto:',
    },
    {
        id: 'whatsapp',
        type: 'whatsapp',
        label: 'WhatsApp',
        value: '+243850691679',
        icon: 'logo-whatsapp',
        linkPrefix: 'https://wa.me/+243850691679',
    },
    // {
    //     id: 'phone',
    //     type: 'phone',
    //     label: 'Téléphone',
    //     value: '+221770000000',
    //     icon: 'call-outline',
    //     linkPrefix: 'tel:',
    // },
    // {
    //     id: 'website',
    //     type: 'website',
    //     label: 'Site Web',
    //     value: 'https://www.andy.com',
    //     icon: 'globe-outline',
    //     linkPrefix: '',
    // }
];
