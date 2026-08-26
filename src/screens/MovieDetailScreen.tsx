import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Typography, Spacing, BorderRadius, Shadow} from '../theme';
import {Movie} from '../data/movies';
import StarRating from '../components/StarRating';
import Button from '../components/Button';

const {width} = Dimensions.get('window');

const MovieDetailScreen = ({route, navigation}: any) => {
  const movie: Movie = route.params.movie;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Poster */}
        <View style={styles.posterContainer}>
          <Image source={{uri: movie.poster}} style={styles.poster} />
          <View style={styles.posterOverlay} />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.posterInfo}>
            <View style={styles.ratingRow}>
              <StarRating rating={Math.round(movie.rating)} size={18} />
              <Text style={styles.ratingText}>{movie.rating}/5</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.movieName}>{movie.name}</Text>

          {/* Genre Tags */}
          <View style={styles.tagRow}>
            {movie.genre.map((g, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{g}</Text>
              </View>
            ))}
          </View>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Icon name="calendar" size={18} color={Colors.primary} />
              <Text style={styles.infoLabel}>Release</Text>
              <Text style={styles.infoValue}>{movie.releaseDate}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="language" size={18} color={Colors.accent} />
              <Text style={styles.infoLabel}>Language</Text>
              <Text style={styles.infoValue}>{movie.language}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="time" size={18} color={Colors.success} />
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{movie.duration}</Text>
            </View>
          </View>

          {/* Synopsis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Synopsis</Text>
            <Text style={styles.synopsis}>{movie.synopsis}</Text>
          </View>

          {/* Director & Cast */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Director</Text>
            <Text style={styles.castText}>{movie.director}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cast</Text>
            <Text style={styles.castText}>{movie.cast.join(', ')}</Text>
          </View>

          {/* Showtimes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🕐 Showtimes</Text>
            <View style={styles.showtimeRow}>
              {movie.showtimes.map((time, i) => (
                <TouchableOpacity key={i} style={styles.showtimeChip}>
                  <Text style={styles.showtimeText}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price & Book */}
          <View style={styles.bookingSection}>
            <View>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>₹{movie.price}</Text>
            </View>
            <Button
              title="Book Now"
              onPress={() => navigation.navigate('Booking', {movie})}
              variant="accent"
              size="large"
              style={styles.bookButton}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  posterContainer: {
    position: 'relative',
  },
  poster: {
    width: width,
    height: width * 1.2,
  },
  posterOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15,15,26,0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: Spacing.base,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterInfo: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.base,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ratingText: {
    ...Typography.subtitle,
    color: Colors.accent,
    fontWeight: '700',
  },
  content: {
    padding: Spacing.xl,
    marginTop: -Spacing.xxl,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    backgroundColor: Colors.background,
  },
  movieName: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tag: {
    backgroundColor: Colors.primary + '25',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  tagText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  infoItem: {
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  infoValue: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  synopsis: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  castText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  showtimeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  showtimeChip: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  showtimeText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  bookingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
    ...Shadow.md,
  },
  priceLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  price: {
    ...Typography.h3,
    color: Colors.accent,
    fontWeight: '800',
  },
  bookButton: {
    paddingHorizontal: Spacing.xxl,
  },
});

export default MovieDetailScreen;
