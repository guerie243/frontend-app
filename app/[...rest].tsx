import RootScreen from './index';

/**
 * Catch-all route pour Expo Router.
 * Redirige n'importe quelle URL (ex: /a/slug, /v/slug) vers le point d'entrée principal.
 * Cela permet à notre logique de navigation personnalisée de prendre le relais.
 */
export default function CatchAll() {
    return <RootScreen />;
}
