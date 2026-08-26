import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {DrawerActions} from '@react-navigation/native';
import {Colors, Typography, Spacing, BorderRadius, Shadow} from '../theme';
import {movies, Movie} from '../data/movies';
import {genres} from '../data/genres';
import SearchBar from '../components/SearchBar';
import GenreCard from '../components/GenreCard';
import StarRating from '../components/StarRating';

const MovieExplorerScreen = ({navigation}: any) => {
  const [searchText, setSearchText] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>(movies);

  useEffect(() => {
    let result = movies;
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      result = result.filter(
        m =>
          m.name.toLowerCase().includes(query) ||
          m.genre.some(g => g.toLowerCase().includes(query)),
      );
    }
    if (selectedGenre) {
      result = result.filter(m =>
        m.genre.some(g => g.toLowerCase() === selectedGenre.toLowerCase()),
      );
    }
    setFilteredMovies(result);
  }, [searchText, selectedGenre]);

  const renderMovieItem = ({item}: {item: Movie}) => (
    <TouchableOpacity
      style={styles.movieItem}
      onPress={() => navigation.navigate('MovieDetail', {movie: item})}
      activeOpacity={0.85}>
      <Image source={{uri: item.poster}} style={styles.poster} />
      <View style={styles.movieInfo}>
        <Text style={styles.movieName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.ratingRow}>
          <StarRating rating={Math.round(item.rating)} size={14} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <View style={styles.genreRow}>
          {item.genre.slice(0, 2).map((g, i) => (
            <View key={i} style={styles.genreTag}>
              <Text style={styles.genreTagText}>{g}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.synopsis} numberOfLines={2}>
          {item.synopsis}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{item.language}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{item.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Icon name="ellipsis-vertical" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>🎬 Movie Explorer</Text>
      </View>

      {/* Search */}
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search by name or genre..."
      />

      {/* Genre Filter */}
      <FlatList
        horizontal
        data={genres}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.genreList}
        style={styles.genreContainer}
        renderItem={({item}) => (
          <GenreCard
            genre={item}
            onPress={g => setSelectedGenre(selectedGenre === g.name ? null : g.name)}
            selected={selectedGenre === item.name}
          />
        )}
      />

      {/* Movie List */}
      <FlatList
        data={filteredMovies}
        keyExtractor={item => item.id}
        renderItem={renderMovieItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="film-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No movies found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  menuButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.sm,
    width: 38,
    height: 38,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  genreContainer: {
    maxHeight: 90,
  },
  genreList: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  list: {
    padding: Spacing.base,
  },
  movieItem: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  poster: {
    width: 110,
    height: 160,
  },
  movieInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  movieName: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 6,
  },
  ratingText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '700',
  },
  genreRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  genreTag: {
    backgroundColor: Colors.primary + '20',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  genreTagText: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '600',
  },
  synopsis: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  metaDot: {
    color: Colors.textMuted,
    fontSize: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
});

export default MovieExplorerScreen;
