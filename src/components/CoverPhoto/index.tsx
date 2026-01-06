import React, { useState } from "react";
import { View, StyleSheet, Pressable, Modal, ActivityIndicator, Animated, Easing, Dimensions } from "react-native";
import { Image } from "expo-image";

const DefaultCover = "https://pixabay.com/get/g8a9486161b9f6b060a8bdbb9ef78aa63c4bc9a376fd3301222a70221f80aa0b2b7e5f517705b7063455266f7af1f2fdf_1280.jpg";

// Récupérer la largeur de l’écran
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function CoverPhoto({
  height = 120, // hauteur réduite
  source,
  style,
}: {
  height?: number;
  source?: any;
  style?: any;
}) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scale] = useState(new Animated.Value(0));

  const imageSource = source?.uri || source || DefaultCover;
  const hasImage = !!(source?.uri || source);

  const openModal = () => {
    if (!hasImage) return;
    setVisible(true);
    scale.setValue(0);
    Animated.timing(scale, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  return (
    <>
      <Pressable onPress={openModal}>
        <View
          style={[
            {
              width: SCREEN_WIDTH, // pleine largeur
              height: height,      // hauteur réduite
              backgroundColor: "#ccc",
              overflow: "hidden",
            },
            style,
          ]}
        >
          <Image
            source={imageSource}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
            onLoadStart={() => setLoading(true)}
            onLoad={() => setLoading(false)}
          />
          {loading && (
            <ActivityIndicator
              size="large"
              color="#888"
              style={{ position: "absolute", top: "50%", left: "50%", marginLeft: -12, marginTop: -12 }}
            />
          )}
        </View>
      </Pressable>

      <Modal visible={visible} transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBackground}>
          <Pressable style={styles.closeArea} onPress={() => setVisible(false)} />
          <Animated.View
            style={[
              {
                width: SCREEN_WIDTH * 0.8,   // modal un peu plus petit que l'écran
                height: (SCREEN_WIDTH * 0.8) * (height / SCREEN_WIDTH), // ratio conservé
                transform: [{ scale }],
              },
            ]}
          >
            <Image
              source={imageSource}
              style={styles.fullImage}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  closeArea: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
