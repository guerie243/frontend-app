import React, { useState } from "react";
import { View, Image, StyleSheet, Pressable, Modal, ActivityIndicator, Animated, Easing } from "react-native";

// Image par défaut
import DefaultCover from "../assets/default_cover.jpeg"; // mets ton image ici

export default function CoverPhoto({
  width = "100%",         // largeur par défaut (pleine largeur)
  height = 200,           // hauteur par défaut
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
              width: width,
              height: height,
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

      {/* Modal pour agrandir la photo */}
      <Modal visible={visible} transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBackground}>
          <Pressable style={styles.closeArea} onPress={() => setVisible(false)} />
          <Animated.Image
            source={source}
            style={[
              styles.fullImage,
              {
                width: 300,
                height: 300 * (height / (typeof width === "number" ? width : 400)), // conserver ratio
                transform: [{ scale: scale }],
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
