import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    FlatList,
    Dimensions,
    StyleSheet,
    Text,
    Platform,
} from 'react-native';
import { Image } from 'expo-image';

// =========================================================
// 🎯 OÙ IMPORTER LA LISTE D'IMAGES (Début)
// 
// Assurez-vous que ces chemins sont corrects pour votre projet.
import promo1 from '../../assets/images/promo1.png';
import promo2 from '../../assets/images/promo2.png';
import promo3 from '../../assets/images/promo3.png';

// 2. Créez votre tableau de données avec les références d'importation :
const carouselImages = [
    {
        id: '1',
        source: promo1,
        title: 'Bienvenue sur Andy!',
    },
    {
        id: '2',
        source: promo2,
        title: '',
    },
    {
        id: '3',
        source: promo3,
        title: '',
    },
];
//
// 🎯 OÙ IMPORTER LA LISTE D'IMAGES (Fin)
// =========================================================


// 📏 CONSTANTES DE TAILLE
const { width: screenWidth } = Dimensions.get('window');
// La marge désirée entre le bord de l'écran et la carte.
const CARD_PADDING = 15;
// L'espace entre deux cartes (peut être le même que CARD_PADDING)
const CARD_SPACING = 8;

// La largeur totale de la zone que la FlatList doit "snapper"
// = Largeur de la carte + l'espace après elle (CARD_SPACING)
const ITEM_LAYOUT_WIDTH = screenWidth - (CARD_PADDING * 2) + CARD_SPACING;

// Largeur effective de la carte (la carte elle-même)
const CARD_WIDTH = screenWidth - (CARD_PADDING * 2);
const CAROUSEL_HEIGHT = CARD_WIDTH * 0.4; // Hauteur réduite (40% de la largeur de la carte)


const ImageCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef(null);

    // --- Configuration de l'Autoplay (Défilement Automatique) ---
    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = (activeIndex + 1) % carouselImages.length;
            const targetIndex = nextIndex === 0 ? 0 : nextIndex;

            if (flatListRef.current) {
                // ✅ FIX: Use scrollToOffset with index * interval to respect CARD_PADDING
                // This ensures the current item is centered/respects the side margins.
                (flatListRef.current as any).scrollToOffset({
                    offset: targetIndex * (CARD_WIDTH + CARD_SPACING),
                    animated: true,
                });
            }

            setActiveIndex(targetIndex);
        }, 4000); // Défilement toutes les 4 secondes

        return () => clearInterval(interval);
    }, [activeIndex]);

    // --- Gestion du Défilement Manuel ---
    const handleScroll = (event) => {
        const scrollOffset = event.nativeEvent.contentOffset.x;
        // La FlatList commence son scroll à 0, mais la première carte visuelle
        // commence à CARD_PADDING. On doit donc ajouter ce décalage au calcul.
        const effectiveScrollOffset = scrollOffset + CARD_PADDING;

        // Utilise la Largeur de la Carte + ESPACEMENT pour le calcul de l'index
        const index = Math.round(effectiveScrollOffset / ITEM_LAYOUT_WIDTH);

        // S'assurer que l'index ne dépasse pas les limites
        const safeIndex = Math.min(index, carouselImages.length - 1);
        setActiveIndex(safeIndex);
    };

    // --- Fonctions de Rendu ---
    const renderItem = ({ item, index }: { item: any; index: number }) => {
        // Calcule la marge de droite : seulement CARD_SPACING entre les cartes
        const isLastItem = index === carouselImages.length - 1;
        // Pour la dernière carte, on ne veut pas de CARD_SPACING car le paddingRight
        // de contentContainerStyle va gérer la marge.
        const marginRight = isLastItem ? 0 : CARD_SPACING;

        return (
            // Le slideContainer est désormais la carte elle-même
            <View style={[styles.slideContainer, { marginRight: marginRight }]}>
                <Image
                    source={item.source}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                />
                <Text style={styles.titleText}>{item.title}</Text>
            </View>
        );
    }

    // Rendu des points indicateurs (Pagination Dots)
    const renderDots = () => (
        <View style={styles.dotContainer}>
            {carouselImages.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.dot,
                        activeIndex === index && styles.activeDot,
                    ]}
                />
            ))}
        </View>
    );

    // Fonction optionnelle pour l'optimisation des performances
    const getItemLayout = (data, index) => ({
        length: CARD_WIDTH + CARD_SPACING,
        offset: (CARD_WIDTH + CARD_SPACING) * index + CARD_PADDING,
        index,
    });


    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={carouselImages}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled={false} // Désactivé car on utilise snapToInterval
                showsHorizontalScrollIndicator={false}

                // ✅ MODIFICATION : Simplification de paddingRight
                contentContainerStyle={styles.contentContainer}

                // Optimisation (aide l'autoplay)
                getItemLayout={getItemLayout}

                // Aligne le défilement sur la largeur de la CARTE + ESPACEMENT
                snapToInterval={CARD_WIDTH + CARD_SPACING}
                decelerationRate="fast"

                // IMPORTANT: Point de départ du snap (le padding à gauche)
                snapToStart={false}

                onMomentumScrollEnd={handleScroll}
                style={styles.flatList}
            />
            {renderDots()}
        </View>
    );
};

// --- Styles Mis à Jour ---
const styles = StyleSheet.create({
    container: {
        marginVertical: 15,
        height: CAROUSEL_HEIGHT + 25,
    },
    flatList: {
        height: CAROUSEL_HEIGHT,
    },
    contentContainer: {
        // Applique la marge latérale UNIQUEMENT au début et à la fin de la liste
        paddingLeft: CARD_PADDING,
        // ✅ Gère la marge de fin
        paddingRight: CARD_PADDING - CARD_SPACING,
    },
    slideContainer: {
        // La largeur de chaque slide correspond à la largeur de la carte
        width: CARD_WIDTH,
        height: CAROUSEL_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',

        // NOTE: Le 'marginRight' est maintenant calculé dans renderItem

        borderRadius: 12,
        overflow: 'hidden',

        // Ombre (inchangée)
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 5,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    titleText: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    dotContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#3498db',
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});

export default ImageCarousel;