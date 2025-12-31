import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Compresse une image localement et retourne l'URI locale.
 * L'upload est désormais géré par le backend.
 * 
 * @param {string} imageUri - L'URI locale de la photo.
 * @returns {Promise<string>} L'URI de l'image compressée.
 */
export async function compressImage(imageUri) {
  if (!imageUri) {
    throw new Error("L'URI de l'image est manquante.");
  }

  console.log("Compression de l'image...");

  const manipulationResult = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 1000 } }], // Redimensionnement raisonnable
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  return manipulationResult.uri;
}