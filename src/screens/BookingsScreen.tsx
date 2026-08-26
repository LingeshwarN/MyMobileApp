import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Typography, Spacing, BorderRadius, Shadow} from '../theme';
import {Movie} from '../data/movies';
import Button from '../components/Button';
import {useDispatch} from 'react-redux';
import {addBooking} from '../store/slices/bookingSlice';

const SEATS_LAYOUT = [
  ['A1', 'A2', 'A3', 'A4', '', 'A5', 'A6', 'A7', 'A8'],
  ['B1', 'B2', 'B3', 'B4', '', 'B5', 'B6', 'B7', 'B8'],
  ['C1', 'C2', 'C3', 'C4', '', 'C5', 'C6', 'C7', 'C8'],
  ['D1', 'D2', 'D3', 'D4', '', 'D5', 'D6', 'D7', 'D8'],
  ['E1', 'E2', 'E3', 'E4', '', 'E5', 'E6', 'E7', 'E8'],
];

const BookingsScreen = ({route, navigation}: any) => {
  const movie: Movie = route.params?.movie;
  const dispatch = useDispatch();
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [paymentMode, setPaymentMode] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!movie) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Icon name="ticket-outline" size={64} color={Colors.textMuted} />
        <Text style={styles.emptyText}>No movie selected</Text>
        <Text style={styles.emptySubtext}>Browse movies and tap "Book Now"</Text>
      </View>
    );
  }

  const toggleSeat = (seat: string) => {
    if (!seat) return;
    setSelectedSeats(prev =>
      prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat],
    );
  };

  const subtotal = selectedSeats.length * movie.price;
  const convenienceFee = selectedSeats.length > 0 ? 30 : 0;
  const total = subtotal + convenienceFee;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!selectedShowtime) newErrors.showtime = 'Please select a showtime';
    if (selectedSeats.length === 0) newErrors.seats = 'Please select at least one seat';
    if (!paymentMode) newErrors.payment = 'Please select a payment mode';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBooking = () => {
    if (!validate()) return;
    const booking = {
      id: 'BK' + Date.now(),
      movie: movie,
      showtime: selectedShowtime!,
      seats: selectedSeats,
      quantity: selectedSeats.length,
      subtotal: subtotal,
      convenienceFee: convenienceFee,
      total: total,
      paymentMode: paymentMode,
      status: 'confirmed' as const,
      bookedAt: new Date().toISOString(),
    };
    dispatch(addBooking(booking));
    Alert.alert(
      '🎉 Booking Confirmed!',
      `${movie.name}\n${selectedShowtime}\nSeats: ${selectedSeats.join(', ')}\nTotal: ₹${total}`,
      [{text: 'View Orders', onPress: () => {
        // Navigate to OrdersTab via the parent tab navigator,
        // since this screen is inside the HomeStack (a nested stack)
        const tabNav = navigation.getParent();
        if (tabNav) {
          tabNav.navigate('OrdersTab');
        } else {
          navigation.goBack();
        }
      }}],
    );
  };

  const paymentModes = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Book Tickets</Text>
          <View style={{width: 40}} />
        </View>

        {/* Movie Info Card */}
        <View style={styles.movieCard}>
          <Icon name="film" size={32} color={Colors.accent} />
          <View style={styles.movieInfo}>
            <Text style={styles.movieName}>{movie.name}</Text>
            <Text style={styles.movieMeta}>{movie.language} • {movie.duration}</Text>
          </View>
          <Text style={styles.moviePrice}>₹{movie.price}</Text>
        </View>

        {/* Showtimes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Showtime</Text>
          <View style={styles.chipRow}>
            {movie.showtimes.map((time, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.chip,
                  selectedShowtime === time && styles.chipActive,
                ]}
                onPress={() => setSelectedShowtime(time)}>
                <Text
                  style={[
                    styles.chipText,
                    selectedShowtime === time && styles.chipTextActive,
                  ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.showtime && <Text style={styles.errorText}>{errors.showtime}</Text>}
        </View>

        {/* Seat Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Seats</Text>
          <View style={styles.screen}>
            <Text style={styles.screenText}>SCREEN</Text>
          </View>
          {SEATS_LAYOUT.map((row, ri) => (
            <View key={ri} style={styles.seatRow}>
              {row.map((seat, si) => {
                if (seat === '') {
                  return <View key={si} style={styles.seatGap} />;
                }
                const isSelected = selectedSeats.includes(seat);
                return (
                  <TouchableOpacity
                    key={si}
                    style={[styles.seat, isSelected && styles.seatSelected]}
                    onPress={() => toggleSeat(seat)}>
                    <Text style={[styles.seatText, isSelected && styles.seatTextSelected]}>
                      {seat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: Colors.backgroundInput}]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: Colors.primary}]} />
              <Text style={styles.legendText}>Selected</Text>
            </View>
          </View>
          {errors.seats && <Text style={styles.errorText}>{errors.seats}</Text>}
        </View>

        {/* Payment Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Mode</Text>
          <View style={styles.chipRow}>
            {paymentModes.map((mode, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.chip,
                  paymentMode === mode && styles.chipActive,
                ]}
                onPress={() => setPaymentMode(mode)}>
                <Text
                  style={[
                    styles.chipText,
                    paymentMode === mode && styles.chipTextActive,
                  ]}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.payment && <Text style={styles.errorText}>{errors.payment}</Text>}
        </View>

        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tickets ({selectedSeats.length}x)</Text>
            <Text style={styles.summaryValue}>₹{subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Convenience Fee</Text>
            <Text style={styles.summaryValue}>₹{convenienceFee}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </View>

        {/* Confirm Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Confirm Booking"
            onPress={handleBooking}
            variant="accent"
            size="large"
            style={styles.confirmButton}
          />
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="medium"
          />
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.h4,
    color: Colors.textMuted,
    marginTop: Spacing.base,
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  movieCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: Spacing.base,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  movieInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  movieName: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
  },
  movieMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  moviePrice: {
    ...Typography.h4,
    color: Colors.accent,
    fontWeight: '800',
  },
  section: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary + '25',
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  screen: {
    backgroundColor: Colors.primary + '30',
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  screenText: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 4,
  },
  seatRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    gap: 4,
  },
  seat: {
    width: 34,
    height: 30,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundInput,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  seatSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  seatGap: {
    width: 20,
  },
  seatText: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  seatTextSelected: {
    color: Colors.white,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  legendText: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  summaryCard: {
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: Spacing.base,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  summaryTitle: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  summaryValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
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
  buttonContainer: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  confirmButton: {
    marginBottom: 0,
  },
  errorText: {
    ...Typography.small,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});

export default BookingsScreen;
