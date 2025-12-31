import React, { useState } from "react";
import { View, Image, StyleSheet, Pressable, Modal, ActivityIndicator, Animated, Easing, Dimensions } from "react-native";

const DefaultCover = { uri: "https://pixabay.com/get/g8a9486161b9f6b060a8bdbb9ef78aa63c4bc9a376fd3301222a70221f80aa0b2b7e5f517705b7063455266f7af1f2fdf_1280.jpg" };

// Récupérer la largeur de l’écran
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function CoverPhoto({
  height = 120, // hauteur réduite
  source,
  style,
}) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scale] = useState(new Animated.Value(0));

  const hasImage = source && source.uri;

  const openModal = () => {
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
      <Pressable onPress={() => hasImage && openModal()}>
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
            source={hasImage ? source : DefaultCover}
            style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
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
          <Animated.Image
            source={hasImage ? source : DefaultCover}
            style={[
              styles.fullImage,
              {
                width: SCREEN_WIDTH * 0.8,   // modal un peu plus petit que l'écran
                height: (SCREEN_WIDTH * 0.8) * (height / SCREEN_WIDTH), // ratio conservé
                transform: [{ scale }],
              },
            ]}
          />
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
    resizeMode: "contain",
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
