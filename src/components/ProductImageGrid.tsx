import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { DEFAULT_IMAGES } from '../constants/images';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Ajustement pour les marges du ProductFeedCard (4px * 2 = 8px)
const CARD_WIDTH = SCREEN_WIDTH - 8;
const MAX_GRID_HEIGHT = 600;

interface ProductImageGridProps {
    images: string[];
    onPress?: () => void;
}

export const ProductImageGrid: React.FC<ProductImageGridProps> = ({ images, onPress }) => {
    const [ratios, setRatios] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(0.4)).current;

    // Filtrage robuste des images pour éviter les "[object Object]" et les URLs vides
    const validImages = images.filter(img =>
        img &&
        typeof img === 'string' &&
        img.trim().length > 0 &&
        !img.includes('[object Object]') &&
        (img.startsWith('http') || img.startsWith('file://') || img.startsWith('data:') || img.startsWith('blob:'))
    );

    const displayImages = validImages.slice(0, 3);
    const overflowCount = validImages.length > 3 ? validImages.length - 3 : 0;
    const hasMore = overflowCount > 0;

    // Loading Pulse Animation
    useEffect(() => {
        if (isLoading) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 0.8,
                        duration: 800,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease)
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 0.4,
                        duration: 800,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease)
                    }),
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
    }, [isLoading]);

    useEffect(() => {
        if (images.length > 0) {
            setIsLoading(true);
            const fetchRatios = async () => {
                const fetchedRatios: number[] = [];
                const promises = images.slice(0, 3).map((uri, index) => {
                    return new Promise<void>((resolve) => {
                        if (!uri || typeof uri !== 'string' || uri.trim() === '') {
                            fetchedRatios[index] = 1;
                            resolve();
                            return;
                        }

                        // Timeout de 3 secondes pour Image.getSize
                        const timeoutId = setTimeout(() => {
                            fetchedRatios[index] = 1;
                            resolve();
                        }, 3000);

                        Image.getSize(
                            uri,
                            (width, height) => {
                                clearTimeout(timeoutId);
                                fetchedRatios[index] = width / height;
                                resolve();
                            },
                            () => {
                                clearTimeout(timeoutId);
                                fetchedRatios[index] = 1;
                                resolve();
                            }
                        );
                    });
                });

                await Promise.all(promises);
                setRatios(fetchedRatios);
                setIsLoading(false);
            };

            fetchRatios();
        } else {
            setIsLoading(false);
        }
    }, [images]);

    if (images.length === 0) {
        return (
            <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.placeholderContainer}>
                <Image
                    source={DEFAULT_IMAGES.annonce}
                    style={styles.placeholderImage}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        );
    }

    if (isLoading) {
        return (
            <View style={[styles.container, { height: 250, backgroundColor: '#EFEFEF', justifyContent: 'center' }]}>
                <Animated.View style={[styles.pulseCircle, { opacity: pulseAnim }]} />
            </View>
        );
    }

    const renderContent = () => {
        const r1 = ratios[0] || 1;
        const r2 = ratios[1] || 1;
        const r3 = ratios[2] || 1;

        if (images.length === 1) {
            const h = CARD_WIDTH / r1;
            const finalHeight = Math.min(h, MAX_GRID_HEIGHT);

            return (
                <View style={{ height: finalHeight, width: '100%' }}>
                    <Image
                        source={failedImages.has(0) ? DEFAULT_IMAGES.annonce : { uri: images[0] }}
                        style={styles.fullImage}
                        resizeMode="cover"
                        onError={() => setFailedImages(prev => new Set(prev).add(0))}
                    />
                </View>
            );
        }

        if (images.length === 2) {
            const h = CARD_WIDTH / (r1 + r2);
            const finalHeight = Math.min(h, MAX_GRID_HEIGHT);

            return (
                <View style={[styles.row, { height: finalHeight }]}>
                    <View style={{ flex: r1 }}>
                        <Image
                            source={failedImages.has(0) ? DEFAULT_IMAGES.annonce : { uri: images[0] }}
                            style={styles.fullImage}
                            resizeMode="cover"
                            onError={() => setFailedImages(prev => new Set(prev).add(0))}
                        />
                    </View>
                    <View style={styles.separator} />
                    <View style={{ flex: r2 }}>
                        <Image
                            source={failedImages.has(1) ? DEFAULT_IMAGES.annonce : { uri: images[1] }}
                            style={styles.fullImage}
                            resizeMode="cover"
                            onError={() => setFailedImages(prev => new Set(prev).add(1))}
                        />
                    </View>
                </View>
            );
        }

        const hTop = CARD_WIDTH / r1;
        const hBottom = CARD_WIDTH / (r2 + r3);

        let finalHTop = hTop;
        let finalHBottom = hBottom;

        if (hTop + hBottom > MAX_GRID_HEIGHT) {
            const scale = MAX_GRID_HEIGHT / (hTop + hBottom);
            finalHTop = hTop * scale;
            finalHBottom = hBottom * scale;
        }

        return (
            <View style={{ height: finalHTop + finalHBottom, width: '100%' }}>
                <View style={{ height: finalHTop }}>
                    <Image
                        source={failedImages.has(0) ? DEFAULT_IMAGES.annonce : { uri: images[0] }}
                        style={styles.fullImage}
                        resizeMode="cover"
                        onError={() => setFailedImages(prev => new Set(prev).add(0))}
                    />
                </View>
                <View style={styles.horizontalSeparator} />
                <View style={[styles.row, { height: finalHBottom }]}>
                    <View style={{ flex: r2 }}>
                        <Image
                            source={failedImages.has(1) ? DEFAULT_IMAGES.annonce : { uri: images[1] }}
                            style={styles.fullImage}
                            resizeMode="cover"
                            onError={() => setFailedImages(prev => new Set(prev).add(1))}
                        />
                    </View>
                    <View style={styles.separator} />
                    <View style={{ flex: r3 }}>
                        <Image
                            source={failedImages.has(2) ? DEFAULT_IMAGES.annonce : { uri: images[2] }}
                            style={styles.fullImage}
                            resizeMode="cover"
                            onError={() => setFailedImages(prev => new Set(prev).add(2))}
                        />
                        {hasMore && (
                            <View style={styles.overlay}>
                                <Text style={styles.plusText}>plus</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.container}>
            <Animated.View style={{ opacity: fadeAnim }}>
                {renderContent()}
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        overflow: 'hidden',
    },
    placeholderContainer: {
        height: 250,
        width: '100%',
        backgroundColor: '#EFEFEF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderImage: {
        width: '60%',
        height: '60%',
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    row: {
        flexDirection: 'row',
        width: '100%',
    },
    separator: {
        width: 2,
        backgroundColor: 'white',
    },
    horizontalSeparator: {
        height: 2,
        backgroundColor: 'white',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    plusText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        textTransform: 'lowercase',
    },
    pulseCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#CCCCCC',
        alignSelf: 'center',
    }
});
