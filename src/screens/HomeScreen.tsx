import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {DrawerActions} from '@react-navigation/native';
import {Colors, Typography, Spacing, Shadow, BorderRadius} from '../theme';
import {movies, Movie} from '../data/movies';
import {genres} from '../data/genres';
import SearchBar from '../components/SearchBar';
import MovieCard from '../components/MovieCard';
import GenreCard from '../components/GenreCard';
import PromoBanner from '../components/PromoBanner';
import {UserContext} from '../context/UserContext';
import {useDispatch, useSelector} from 'react-redux';
import {toggleWishlist} from '../store/slices/wishlistSlice';
import {RootState} from '../store/store';

const HomeScreen = ({navigation}: any) => {
  const {user} = useContext(UserContext);
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const [searchText, setSearchText] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>(movies);

  // Live search + genre filter (Exp 4)
  useEffect(() => {
    let result = movies;
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      result = result.filter(
        m =>
          m.name.toLowerCase().includes(query) ||
          m.genre.some(g => g.toLowerCase().includes(query)) ||
          m.language.toLowerCase().includes(query),
      );
    }
    if (selectedGenre) {
      result = result.filter(m =>
        m.genre.some(g => g.toLowerCase() === selectedGenre.toLowerCase()),
      );
    }
    setFilteredMovies(result);
  }, [searchText, selectedGenre]);

  const isWishlisted = (movieId: string) =>
    wishlistItems.some(m => m.id === movieId);

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('MovieDetail', {movie});
  };

  const handleWishlist = (movie: Movie) => {
    dispatch(toggleWishlist(movie));
  };

  const featuredMovies = filteredMovies.filter(m => m.availability === 'Now Showing');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon name="ellipsis-vertical" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Movie Lover'} 👋</Text>
              <Text style={styles.headerSubtitle}>What would you like to watch?</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => navigation.navigate('ProfileTab')}>
            <Image
              source={{uri: user?.avatar || 'https://picsum.photos/seed/user/200/200'}}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search movies, genres, language..."
        />

        {/* Promo Banner */}
        <View style={styles.section}>
          <PromoBanner />
        </View>

        {/* Genre Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎭 Genres</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GenresTab')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={genres}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genreList}
            renderItem={({item}) => (
              <GenreCard
                genre={item}
                onPress={g => {
                  setSelectedGenre(
                    selectedGenre === g.name ? null : g.name,
                  );
                }}
                selected={selectedGenre === item.name}
              />
            )}
          />
        </View>

        {/* Featured Movies - 2 column grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎬 {selectedGenre || 'Featured'} Movies</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('GenresTab')}>
              <Text style={styles.seeAll}>Explore All</Text>
            </TouchableOpacity>
          </View>
          {filteredMovies.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="film-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No movies found</Text>
            </View>
          ) : (
            <View style={styles.movieGrid}>
              {filteredMovies.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onPress={handleMoviePress}
                  onWishlist={handleWishlist}
                  isWishlisted={isWishlisted(movie.id)}
                />
              ))}
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  greeting: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 24,
    padding: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  seeAll: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  genreList: {
    paddingHorizontal: Spacing.base,
  },
  movieGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
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

export default HomeScreen;
