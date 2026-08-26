import React from 'react';
import {View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Typography, Spacing, BorderRadius, Shadow} from '../theme';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../store/store';
import {toggleWishlist} from '../store/slices/wishlistSlice';
import {Movie} from '../data/movies';
import Button from '../components/Button';

const WishlistScreen = ({navigation}: any) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  const handleRemove = (movie: Movie) => {
    dispatch(toggleWishlist(movie));
    Alert.alert('Removed', `${movie.name} removed from wishlist.`);
  };

  const renderItem = ({item}: {item: Movie}) => (
    <View style={styles.card}>
      <Image source={{uri: item.poster}} style={styles.poster} />
      <View style={styles.info}>
        <Text style={styles.movieName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.meta}>{item.language} • {item.duration}</Text>
        <View style={styles.ratingRow}>
          <Icon name="star" size={14} color={Colors.accent} />
          <Text style={styles.rating}>{item.rating}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('MovieDetail', {movie: item})}>
            <Text style={styles.bookBtnText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleRemove(item)}>
            <Icon name="heart-dislike" size={22} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>❤️ Wishlist</Text>
        <Text style={styles.count}>{wishlistItems.length}</Text>
      </View>
      {wishlistItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="heart-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySub}>Save movies you love by tapping the ❤️ icon</Text>
          <Button title="Browse Movies" onPress={() => navigation.goBack()} variant="primary" style={{marginTop: Spacing.lg}} />
        </View>
      ) : (
        <FlatList data={wishlistItems} keyExtractor={item => item.id} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingTop: Spacing.xl, paddingBottom: Spacing.md, gap: Spacing.md},
  backBtn: {width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.backgroundCard, alignItems: 'center', justifyContent: 'center'},
  title: {...Typography.h3, color: Colors.textPrimary, flex: 1},
  count: {...Typography.subtitle, color: Colors.accent, fontWeight: '700'},
  list: {padding: Spacing.base},
  card: {flexDirection: 'row', backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: Spacing.md, ...Shadow.sm},
  poster: {width: 100, height: 140},
  info: {flex: 1, padding: Spacing.md, justifyContent: 'center'},
  movieName: {...Typography.subtitle, color: Colors.textPrimary, marginBottom: 4},
  meta: {...Typography.caption, color: Colors.textSecondary, marginBottom: 4},
  ratingRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm},
  rating: {...Typography.caption, color: Colors.accent, fontWeight: '700'},
  actions: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  bookBtn: {backgroundColor: Colors.primary + '25', borderRadius: BorderRadius.lg, paddingVertical: 6, paddingHorizontal: Spacing.md},
  bookBtnText: {...Typography.caption, color: Colors.primary, fontWeight: '600'},
  emptyState: {flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xxl},
  emptyTitle: {...Typography.h4, color: Colors.textMuted, marginTop: Spacing.base},
  emptySub: {...Typography.body, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xs},
});

export default WishlistScreen;
