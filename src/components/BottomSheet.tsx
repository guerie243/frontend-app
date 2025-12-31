import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  height?: number;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  height = SCREEN_HEIGHT * 0.6,
  children,
}) => {
  const finalPosition = SCREEN_HEIGHT - height;
  const initialPosition = SCREEN_HEIGHT;

  const translateY = useRef(new Animated.Value(initialPosition)).current;

  // Animation pour ouvrir la feuille
  const openSheet = () => {
    Animated.timing(translateY, {
      toValue: finalPosition,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Animation pour fermer la feuille
  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: initialPosition,
      duration: 300,
      useNativeDriver: true,
    }).start(onClose); // Appeler onClose après la fin de l'animation
  };

  useEffect(() => {
    if (visible) {
      openSheet();
    } else {
      closeSheet();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true, // Permettre le défilement dès le début
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 5,
      onPanResponderMove: (_, gesture) => {
        // Limiter le déplacement vers le haut
        const newY = finalPosition + gesture.dy;
        if (newY >= finalPosition) {
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100) {
          // Fermer si le glissement vers le bas est significatif
          closeSheet();
        } else {
          // Revenir à la position ouverte si le glissement n'est pas suffisant
          openSheet();
        }
      },
    })
  ).current;

  // Rendu conditionnel pour éviter les problèmes si la vue n'est pas censée être visible
  // Note: on renvoie un `View` vide pour garder l'état du `useEffect` synchronisé
  if (!visible) return null;

  return (
    <View style={styles.root}>
      {/* Overlay */}
      <Pressable style={styles.overlay} onPress={onClose} />

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height,
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100, // Assurez-vous qu'il est au-dessus
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
});