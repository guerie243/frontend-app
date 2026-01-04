import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { annonceService } from '../services/annonceService';
import { likeStorageService } from '../services/likeStorageService';

interface LikeButtonProps {
    annonceId: string;
    annonceSlug: string;
    initialLikesCount?: number;
    size?: number;
    style?: any;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
    annonceId,
    annonceSlug,
    initialLikesCount = 0,
    size = 24,
    style,
}) => {
    const { theme } = useTheme();
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [isLoading, setIsLoading] = useState(false);

    // Animation pour le cœur
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Charger l'état initial depuis le storage local
    useEffect(() => {
        const loadLikeState = async () => {
            const liked = await likeStorageService.isAnnonceLiked(annonceId);
            setIsLiked(liked);
        };
        loadLikeState();
    }, [annonceId]);

    // Animation quand on like
    useEffect(() => {
        if (isLiked) {
            // Animation de "pop" quand on like
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.3,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 3,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Retour à la normale quand on unlike
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }).start();
        }
    }, [isLiked]);

    const handleToggleLike = async () => {
        if (isLoading) return;

        // Sauvegarder l'état actuel pour rollback en cas d'erreur
        const previousIsLiked = isLiked;
        const previousLikesCount = likesCount;

        try {
            setIsLoading(true);

            // Mise à jour optimiste de l'UI
            if (isLiked) {
                setIsLiked(false);
                setLikesCount(Math.max(0, likesCount - 1));
            } else {
                setIsLiked(true);
                setLikesCount(likesCount + 1);
            }

            // Appel API
            let updatedAnnonce;
            if (isLiked) {
                // Unlike
                updatedAnnonce = await annonceService.unlikeAnnonce(annonceSlug);
                await likeStorageService.removeLikedAnnonce(annonceId);
            } else {
                // Like
                updatedAnnonce = await annonceService.likeAnnonce(annonceSlug);
                await likeStorageService.addLikedAnnonce(annonceId);
            }

            // Synchroniser avec la réponse du serveur
            if (updatedAnnonce && updatedAnnonce.likes_count !== undefined) {
                setLikesCount(updatedAnnonce.likes_count);
            }
        } catch (error) {
            console.error('Error toggling like:', error);

            // Rollback en cas d'erreur
            setIsLiked(previousIsLiked);
            setLikesCount(previousLikesCount);

            // Rollback du storage
            if (previousIsLiked) {
                await likeStorageService.addLikedAnnonce(annonceId);
            } else {
                await likeStorageService.removeLikedAnnonce(annonceId);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableOpacity
            onPress={handleToggleLike}
            disabled={isLoading}
            style={[styles.container, style]}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                {isLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <Ionicons
                            name={isLiked ? 'heart' : 'heart-outline'}
                            size={size}
                            color={isLiked ? theme.colors.error : theme.colors.textSecondary}
                        />
                    </Animated.View>
                )}
                {likesCount > 0 && (
                    <Text
                        style={[
                            styles.count,
                            {
                                color: isLiked ? theme.colors.error : theme.colors.textSecondary,
                                fontSize: size * 0.6,
                            },
                        ]}
                    >
                        {likesCount}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    count: {
        fontWeight: '600',
        marginLeft: 4,
    },
});

