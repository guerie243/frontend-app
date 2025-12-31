import React, { useRef, useMemo, useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Image, 
  Dimensions,
  ScrollView // Nécessaire pour les types et Animated.ScrollView
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Définition des dimensions pour l'effet de décalage
const ITEM_WIDTH = Math.round(SCREEN_WIDTH * 0.85); // Item occupe 85% de la largeur
const SPACING = (SCREEN_WIDTH - ITEM_WIDTH) / 2; // Marge/Espacement nécessaire pour le centrage

interface ProductCarouselProps {
  height: Animated.AnimatedInterpolation<number> | Animated.Value | number;
  images: any[];
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

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ height, images = [] }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const normalizedImages = useMemo(() => normalizeAndFlattenImages(images), [images]);
  const imageCount = normalizedImages.length;

  // ⭐️ CRITIQUE : Calcul des points exacts où le ScrollView doit s'arrêter pour centrer l'item.
  // L'arrêt doit être au début de chaque item, là où l'item commencerait.
  const snapToOffsets = useMemo(() => {
    return normalizedImages.map((_, index) => {
      // Offset de l'item = (Index * Largeur de l'item) + (Index * Espace entre les items)
      return index * (ITEM_WIDTH + SPACING);
    });
  }, [normalizedImages.length]);


  // Logique de Défilement Automatique
  useEffect(() => {
    if (imageCount <= 1) return;

    const interval = setInterval(() => {
      let nextIndex = (currentIndex + 1) % imageCount;
      // Utilise les offsets calculés pour le scrollTo
      const nextOffset = snapToOffsets[nextIndex] || 0;

      scrollRef.current?.scrollTo({ 
          x: nextOffset, 
          animated: true 
      });
      setCurrentIndex(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, imageCount, snapToOffsets]);

  // Fonction appelée à la fin d'un défilement manuel
  const handleMomentumScrollEnd = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    
    // Le calcul de l'index doit être basé sur les offsets pour la précision.
    // Pour simplifier, on divise par la largeur totale d'un bloc (item + espacement).
    const index = Math.round(scrollOffset / (ITEM_WIDTH + SPACING));
    setCurrentIndex(index);
  };
  
  if (imageCount === 0) {
    // Rendu du placeholder inchangé
    return (
      <Animated.View style={{ height, backgroundColor: '#EFEFEF', justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={require('../../assets/images/placeholder.png')}
          style={{ width: SCREEN_WIDTH, height: '100%' }}
          resizeMode="contain"
        />
      </Animated.View>
    );
  }

  // Rendu Principal du Carrousel
  return (
    <Animated.View style={{ height }}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        
        // ⭐️ CRITIQUE : Utilisation de snapToOffsets pour le centrage parfait
        decelerationRate="fast"
        snapToOffsets={snapToOffsets}
        // Le padding horizontal assure que la première et dernière image est centrée
        contentContainerStyle={{ paddingHorizontal: SPACING }}
        
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      >
        {normalizedImages.map((image, index) => {
          const imageUri = image.uri;
          const source = imageErrors.has(index)
            ? require('../../assets/images/placeholder.png')
            : { uri: imageUri };

          return (
            // La marge à droite est l'espacement entre les items.
            <View 
                key={index} 
                style={[
                    styles.slide, 
                    { 
                        width: ITEM_WIDTH, 
                        marginRight: index < imageCount - 1 ? SPACING : 0 
                    }
                ]}
            >
              <Image
                source={source}
                style={styles.image}
                resizeMode="contain"
                onError={() => {
                   setImageErrors(prev => new Set(prev).add(index));
                }}
              />
            </View>
          );
        })}
      </Animated.ScrollView>

      {/* Rendu des points de Pagination Manuelle */}
      {imageCount > 1 && (
        <View style={styles.pagination}>
          {normalizedImages.map((_, i) => {
            const opacity = currentIndex === i ? 1 : 0.4;
            const scale = currentIndex === i ? 1.4 : 0.8;
            
            return (
              <View
                key={i}
                style={[
                  styles.dot, 
                  { 
                      opacity,
                      transform: [{ scale }],
                      backgroundColor: currentIndex === i ? '#FFFFFF' : '#FFFFFF',
                  }
                ]}
              />
            );
          })}
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
  pagination: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});