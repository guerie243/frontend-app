import React, { useRef, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Text
} from 'react-native';
import { Image } from 'expo-image';
import { DEFAULT_IMAGES } from '../constants/images';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Définition des dimensions pour l'effet de décalage
const ITEM_WIDTH = Math.round(SCREEN_WIDTH * 0.85); // Item occupe 85% de la largeur
const SPACING = (SCREEN_WIDTH - ITEM_WIDTH) / 2; // Marge/Espacement nécessaire pour le centrage

interface ProductCarouselProps {
  height: Animated.AnimatedInterpolation<number> | Animated.Value | number;
  images: any[];
  onImagePress?: (uri: string) => void;
}

// Fonction utilitaire de normalisation (inchangée)
const normalizeAndFlattenImages = (data: any[]): { uri: string }[] => {
  let sources: { uri: string }[] = [];
  const extract = (item: any) => {
    if (Array.isArray(item)) {
      item.forEach(extract);
    } else if (typeof item === 'object' && item !== null) {
      const uri = item.uri || item.url;
      if (typeof uri === 'string' && uri) {
        sources.push({ uri });
      } else {
        Object.values(item).forEach(extract);
      }
    } else if (typeof item === 'string' && item) {
      sources.push({ uri: item });
    }
  };
  extract(data);
  return sources;
};

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ height, images = [], onImagePress }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // État pour suivre les images que l'on a autorisé à charger. 
  // On commence par charger la 1ère et la 2ème image par défaut.
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(new Set([0, 1]));

  const normalizedImages = useMemo(() => normalizeAndFlattenImages(images), [images]);
  const imageCount = normalizedImages.length;

  const snapToOffsets = useMemo(() => {
    return normalizedImages.map((_, index) => {
      return index * (ITEM_WIDTH + SPACING);
    });
  }, [normalizedImages.length]);

  // ✅ NOUVEAU : Gestion du Scroll en temps réel pour mettre à jour l'index et le chargement
  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;

    // Calcul de l'index arrondi
    const index = Math.round(scrollOffset / (ITEM_WIDTH + SPACING));

    // Si on change d'index (ou si on est au tout début), on met à jour
    if (index !== currentIndex && index >= 0 && index < imageCount) {
      setCurrentIndex(index);

      // ⚡️ LAZY LOADING AMÉLIORÉ : On charge l'image courante ET la suivante
      setLoadedIndices(prev => {
        // Optimisation : ne créer un nouveau Set que si nécessaire
        if (prev.has(index) && (index === imageCount - 1 || prev.has(index + 1))) {
          return prev;
        }
        const next = new Set(prev);
        next.add(index);
        if (index < imageCount - 1) next.add(index + 1);
        return next;
      });
    }

    // Animation standard
    Animated.event(
      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
      { useNativeDriver: false }
    )(event);
  };

  if (imageCount === 0) {
    return (
      <Animated.View style={{ height, backgroundColor: '#EFEFEF', justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={DEFAULT_IMAGES.annonce}
          style={{ width: SCREEN_WIDTH, height: '100%' }}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ height }}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToOffsets={snapToOffsets}
        contentContainerStyle={{ paddingHorizontal: SPACING }}
        scrollEventThrottle={16} // Fréquence de mise à jour fluide (16ms = 60fps)
        onScroll={handleScroll}
      >
        {normalizedImages.map((image, index) => {
          const imageUri = image.uri;
          const shouldLoad = loadedIndices.has(index);

          let source: any = null;
          if (shouldLoad) {
            source = imageErrors.has(index) ? DEFAULT_IMAGES.annonce : imageUri;
          }

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={onImagePress ? 0.9 : 1}
              onPress={() => onImagePress?.(imageUri)}
              style={[
                styles.slide,
                {
                  width: ITEM_WIDTH,
                  marginRight: index < imageCount - 1 ? SPACING : 0
                }
              ]}
            >
              {shouldLoad ? (
                <Image
                  source={source}
                  style={styles.image}
                  contentFit="contain"
                  transition={200} // Transition plus courte pour réactivité
                  cachePolicy="memory-disk"
                  onError={() => {
                    setImageErrors(prev => new Set(prev).add(index));
                  }}
                />
              ) : (
                <View style={[styles.image, { backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' }]}>
                  <Image
                    source={DEFAULT_IMAGES.annonce}
                    style={{ width: 50, height: 50, opacity: 0.1 }}
                    contentFit="contain"
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </Animated.ScrollView>

      {/* Indicateur de compteur */}
      {imageCount > 1 && (
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {currentIndex + 1}/{imageCount}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  counterContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});