import React, { useState } from "react";
import { View, Image, StyleSheet, Pressable, Modal, ActivityIndicator, Animated, Easing } from "react-native";

// Nouvelle image par défaut en ligne
const DefaultAvatar = { uri: "https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png" };

export default function Avatar({
  size = 80,
  source,
  borderWidth = 0,
  borderColor = "#000",
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
              width: size,
              height: size,
              borderRadius: size / 2,
              overflow: "hidden",
              borderWidth,
              borderColor,
              backgroundColor: "#e0e0e0",
              alignItems: "center",
              justifyContent: "center",
            },
            style,
          ]}
        >
          <Image
            source={hasImage ? source : DefaultAvatar}
            style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
          />
          {loading && (
            <ActivityIndicator
              size="small"
              color="#888"
              style={{ position: "absolute" }}
            />
          )}
        </View>
      </Pressable>

      <Modal visible={visible} transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBackground}>
          <Pressable style={styles.closeArea} onPress={() => setVisible(false)} />
          <Animated.Image
            source={hasImage ? source : DefaultAvatar}
            style={[
              styles.fullImage,
              {
                width: size * 3,
                height: size * 3,
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
