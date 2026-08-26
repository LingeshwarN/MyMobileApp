import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Typography, BorderRadius, Spacing, Shadow} from '../theme';
import {Movie} from '../data/movies';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.base * 3) / 2;

interface MovieCardProps {
  movie: Movie;
  onPress: (movie: Movie) => void;
  onWishlist?: (movie: Movie) => void;
  isWishlisted?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPress,
  onWishlist,
  isWishlisted = false,
}) => {
  const getAvailabilityColor = () => {
    switch (movie.availability) {
      case 'Now Showing':
        return Colors.success;
      case 'Coming Soon':
        return Colors.warning;
      case 'Advance Booking':
        return Colors.info;
      default:
        return Colors.textMuted;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(movie)}
      activeOpacity={0.85}>
      <View style={styles.posterContainer}>
        <Image source={{uri: movie.poster}} style={styles.poster} />
        <View style={styles.ratingBadge}>
          <Icon name="star" size={12} color={Colors.accent} />
          <Text style={styles.ratingText}>{movie.rating}</Text>
        </View>
        {onWishlist && (
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => onWishlist(movie)}>
            <Icon
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={20}
              color={isWishlisted ? Colors.error : Colors.white}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {movie.name}
        </Text>
        <Text style={styles.language}>{movie.language}</Text>
        <View style={styles.availabilityRow}>
          <View
            style={[
              styles.availabilityDot,
              {backgroundColor: getAvailabilityColor()},
            ]}
          />
          <Text style={[styles.availability, {color: getAvailabilityColor()}]}>
            {movie.availability}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.base,
    ...Shadow.md,
  },
  posterContainer: {
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: CARD_WIDTH * 1.4,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  ratingBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 3,
  },
  ratingText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '700',
  },
  wishlistButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: BorderRadius.full,
    padding: Spacing.xs + 2,
  },
  info: {
    padding: Spacing.sm,
  },
  title: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  language: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availability: {
    ...Typography.small,
    fontWeight: '600',
  },
});

export default MovieCard;
