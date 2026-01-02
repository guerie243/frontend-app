import { useAlert } from '../components/AlertProvider';
import { useToast } from '../components/ToastNotification';
import { AlertButton } from '../components/AlertProvider';

/**
 * Service utilitaire pour afficher facilement des alertes et toasts
 * Compatible mobile et web
 */

// Hook personnalisé pour accéder aux fonctions d'alerte
export const useAlertService = () => {
    const { showAlert } = useAlert();
    const { showToast } = useToast();

    return {
        /**
         * Affiche une alerte de succès
         */
        showSuccess: (message: string, title: string = 'Succès') => {
            showAlert(title, message, 'success');
        },

        /**
         * Affiche une alerte d'erreur
         */
        showError: (message: string, title: string = 'Erreur') => {
            showAlert(title, message, 'error');
        },

        /**
         * Affiche une alerte d'avertissement
         */
        showWarning: (message: string, title: string = 'Attention') => {
            showAlert(title, message, 'warning');
        },

        /**
         * Affiche une alerte d'information
         */
        showInfo: (message: string, title: string = 'Info') => {
            showAlert(title, message, 'info');
        },

        /**
         * Affiche un dialogue de confirmation avec boutons Annuler/Confirmer
         */
        showConfirm: (
            message: string,
            onConfirm: () => void,
            onCancel?: () => void,
            title: string = 'Confirmation',
            confirmText: string = 'Confirmer',
            cancelText: string = 'Annuler'
        ) => {
            const buttons: AlertButton[] = [
                {
                    text: cancelText,
                    style: 'cancel',
                    onPress: onCancel,
                },
                {
                    text: confirmText,
                    style: 'default',
                    onPress: onConfirm,
                },
            ];
            showAlert(title, message, 'confirm', buttons);
        },

        /**
         * Affiche un dialogue de confirmation destructive (ex: suppression)
         */
        showDestructiveConfirm: (
            message: string,
            onConfirm: () => void,
            onCancel?: () => void,
            title: string = 'Attention',
            confirmText: string = 'Supprimer',
            cancelText: string = 'Annuler'
        ) => {
            const buttons: AlertButton[] = [
                {
                    text: cancelText,
                    style: 'cancel',
                    onPress: onCancel,
                },
                {
                    text: confirmText,
                    style: 'destructive',
                    onPress: onConfirm,
                },
            ];
            showAlert(title, message, 'error', buttons);
        },

        /**
         * Affiche une notification toast (non-bloquante)
         */
        showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
            showToast(message, type);
        },

        /**
         * Affiche une alerte personnalisée avec boutons personnalisés
         */
        showCustomAlert: (
            title: string,
            message: string,
            buttons: AlertButton[],
            type: 'success' | 'error' | 'warning' | 'info' | 'confirm' = 'info'
        ) => {
            showAlert(title, message, type, buttons);
        },
    };
};
