import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {DrawerActions} from '@react-navigation/native';
import {Colors, Typography, Spacing, BorderRadius, Shadow} from '../theme';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../store/store';
import {cancelBooking} from '../store/slices/bookingSlice';
import Button from '../components/Button';

const OrdersScreen = ({navigation}: any) => {
  const dispatch = useDispatch();
  const bookings = useSelector((state: RootState) => state.booking.bookings);

  const handleCancel = (bookingId: string) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      {text: 'No', style: 'cancel'},
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => {
          dispatch(cancelBooking(bookingId));
          Alert.alert('Cancelled', 'Your booking has been cancelled.');
        },
      },
    ]);
  };

  const renderBooking = ({item}: any) => {
    const isCancelled = item.status === 'cancelled';
    return (
      <View style={[styles.card, isCancelled && styles.cardCancelled]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Icon
              name={isCancelled ? 'close-circle' : 'checkmark-circle'}
              size={24}
              color={isCancelled ? Colors.error : Colors.success}
            />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.movieName}>{item.movie.name}</Text>
            <Text style={styles.bookingId}>#{item.id}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: isCancelled ? Colors.error + '20' : Colors.success + '20'},
            ]}>
            <Text
              style={[
                styles.statusText,
                {color: isCancelled ? Colors.error : Colors.success},
              ]}>
              {isCancelled ? 'Cancelled' : 'Confirmed'}
            </Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Icon name="time" size={14} color={Colors.textMuted} />
            <Text style={styles.detailText}>{item.showtime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="grid" size={14} color={Colors.textMuted} />
            <Text style={styles.detailText}>Seats: {item.seats.join(', ')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="card" size={14} color={Colors.textMuted} />
            <Text style={styles.detailText}>{item.paymentMode}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{item.total}</Text>
          </View>
        </View>
        {!isCancelled && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancel(item.id)}>
            <Text style={styles.cancelText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Icon name="ellipsis-vertical" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <Text style={styles.title}>📋 My Orders</Text>
          <Text style={styles.subtitle}>{bookings.length} booking(s)</Text>
        </View>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="receipt-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>Book a movie to see your orders here</Text>
          <Button
            title="Browse Movies"
            onPress={() => navigation.navigate('HomeTab')}
            variant="primary"
            style={{marginTop: Spacing.lg}}
          />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item.id}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingBottom: Spacing.md,
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
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  list: {
    padding: Spacing.base,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  cardCancelled: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  cardIcon: {
    marginRight: Spacing.sm,
  },
  cardInfo: {
    flex: 1,
  },
  movieName: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
  },
  bookingId: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  statusBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  statusText: {
    ...Typography.small,
    fontWeight: '700',
  },
  cardBody: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  totalLabel: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
  },
  totalValue: {
    ...Typography.h4,
    color: Colors.accent,
    fontWeight: '800',
  },
  cancelButton: {
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    alignItems: 'center',
  },
  cancelText: {
    ...Typography.body,
    color: Colors.error,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.textMuted,
    marginTop: Spacing.base,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});

export default OrdersScreen;
