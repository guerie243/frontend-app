import { Slot } from 'expo-router';
import { RootProvider } from '../src/context/RootProvider';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    // TEMPORAIRE : On désactive le chargement des polices car il cause un timeout de 6000ms sur Web 
    // avec des connexions lentes, ce qui bloque le démarrage de l'application.
    // L'application utilisera les polices système par défaut.
    /*
    const [loaded, error] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_700Bold,
    });
    */
    const loaded = true;
    const error = null;

    useEffect(() => {
        // Le SplashScreen n'est plus caché ici. 
        // Il sera caché par le composant StartupSplash pour une transition fluide.
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <RootProvider>
            <Slot />
        </RootProvider>
    );
}
