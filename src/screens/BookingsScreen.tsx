import React, {useState, useContext, useEffect, useCallback} from 'react';
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
import {UserContext} from '../context/UserContext';
import Button from '../components/Button';
import {useDispatch} from 'react-redux';
import {addBooking} from '../store/slices/bookingSlice';
import {BookingItem} from '../context/BookingContext';
import {
  Showtime,
  fetchShowtimes,
  createBooking,
  offerSeatSwap,
  unofferSeatSwap,
  acceptSeatSwap,
  rejectSeatSwap,
  formatShowtime,
} from '../services/api';
import {useCachedFetch} from '../hooks/useCachedFetch';
import {useSocket} from '../hooks/useSocket';
import SwapProposalModal from '../components/SwapProposalModal';

// 10-row × 12-col static theater layout (col 5 & 6 are aisle gaps)
const STATIC_ROWS = 10;
const STATIC_COLS = 12;
const ROW_LETTERS = 'ABCDEFGHIJ';

// Client-side seat tagging — mirrors backend/utils/seatTagging.js
type RawSeat = {row: number; col: number; label: string; type: string; tags: string[]};

function tagBestViewClient(seats: RawSeat[], rows: number, cols: number) {
  const rowStart = Math.floor(rows * 0.4);
  const rowEnd = Math.ceil(rows * 0.7);
  const colStart = Math.floor(cols * 0.25);
  const colEnd = Math.ceil(cols * 0.75);
  seats.forEach(s => {
    if (s.type !== 'aisle' && s.row >= rowStart && s.row < rowEnd && s.col >= colStart && s.col < colEnd) {
      if (!s.tags.includes('best-view')) s.tags.push('best-view');
    }
  });
}

function tagFamilyClient(seats: RawSeat[], rows: number, cols: number) {
  const bandRows = Math.min(2, rows);
  const bandCols = Math.min(5, cols);
  const regions = [
    {rS: 0, rE: bandRows, cS: 0, cE: bandCols},
    {rS: 0, rE: bandRows, cS: cols - bandCols, cE: cols},
    {rS: rows - bandRows, rE: rows, cS: 0, cE: bandCols},
    {rS: rows - bandRows, rE: rows, cS: cols - bandCols, cE: cols},
  ];
  regions.forEach(({rS, rE, cS, cE}) => {
    for (let r = rS; r < rE; r++) {
      const rowSeats = seats.filter(s => s.row === r && s.col >= cS && s.col < cE && s.type === 'standard' && s.tags.length === 0);
      rowSeats.sort((a, b) => a.col - b.col);
      let run: RawSeat[] = [];
      rowSeats.forEach((s, i) => {
        if (i === 0 || s.col === rowSeats[i - 1].col + 1) { run.push(s); }
        else {
          if (run.length >= 3) run.slice(0, 4).forEach(rs => rs.tags.push('family'));
          run = [s];
        }
      });
      if (run.length >= 3) run.slice(0, 4).forEach(rs => rs.tags.push('family'));
    }
  });
}

function buildTaggedStaticSeats(): RawSeat[] {
  const seats: RawSeat[] = [];
  for (let r = 0; r < STATIC_ROWS; r++) {
    for (let c = 0; c < STATIC_COLS; c++) {
      const isAisle = c === 5 || c === 6;
      // Last 2 rows are premium
      const type = isAisle ? 'aisle' : r >= STATIC_ROWS - 2 ? 'premium' : 'standard';
      seats.push({row: r, col: c, label: `${ROW_LETTERS[r]}${c + 1}`, type, tags: []});
    }
  }
  tagBestViewClient(seats, STATIC_ROWS, STATIC_COLS);
  tagFamilyClient(seats, STATIC_ROWS, STATIC_COLS);
  return seats;
}

const TAGGED_STATIC_SEATS = buildTaggedStaticSeats();

const BookingsScreen = ({route, navigation}: any) => {
  const movie: Movie | undefined = route.params?.movie;
  const dispatch = useDispatch();
  const {user} = useContext(UserContext);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [paymentMode, setPaymentMode] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookingLoading, setBookingLoading] = useState(false);
  const [swapTargetSeat, setSwapTargetSeat] = useState<string | null>(null);
  const [swapModalVisible, setSwapModalVisible] = useState(false);

  // Phase B/D: real showtime data with local fallback when backend is unreachable
  const {data: liveShowtimes, refetch: refetchShowtimes} = useCachedFetch<Showtime[]>(
    () => fetchShowtimes(movie?.id),
    [movie?.id],
  );
  const allShowtimes = liveShowtimes ?? [];

  const selectedShowtime: Showtime | undefined =
    allShowtimes.find(s => s._id === selectedShowtimeId);

  // Auto-select first showtime when live data arrives
  useEffect(() => {
    if (allShowtimes.length > 0 && !selectedShowtimeId) {
      setSelectedShowtimeId(allShowtimes[0]._id);
      setSelectedLabels([]);
    }
  }, [allShowtimes, selectedShowtimeId]);

  // Real-time seat-swap alerts (incoming proposals arrive on the user's own socket)
  const handleSwapEvent = useCallback(
    (payload: any) => {
      if (!payload) return;
      refetchShowtimes();
      if (payload.type === 'initiate_swap' && payload.requestId) {
        Alert.alert(
          'Seat Swap Request',
          payload.message || 'A user wants to swap seats with you.',
          [
            {text: 'Decline', style: 'cancel', onPress: () => rejectSeatSwap(payload.requestId)},
            {
              text: 'Accept',
              onPress: () =>
                acceptSeatSwap(payload.requestId)
                  .then(() => {
                    Alert.alert('Swap Accepted', 'Your seats have been swapped!');
                    refetchShowtimes();
                  })
                  .catch((err: any) => Alert.alert('Swap Failed', err?.message || 'Could not accept')),
            },
          ],
        );
      } else if (payload.type === 'swap_result') {
        Alert.alert('Seat Swap Update', payload.message || 'Seats updated.');
      } else if (payload.mySeat || payload.theirSeat) {
        Alert.alert(
          'Seat Swap Update',
          payload.message || `A seat was swapped: ${payload.mySeat} ↔ ${payload.theirSeat}`,
        );
      }
    },
    [refetchShowtimes],
  );

  useSocket(selectedShowtimeId, handleSwapEvent, user?.id);

  if (!movie) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Icon name="ticket-outline" size={64} color={Colors.textMuted} />
        <Text style={styles.emptyText}>No movie selected</Text>
        <Text style={styles.emptySubtext}>Browse movies and tap "Book Now"</Text>
      </View>
    );
  }

  const useRealSeats = !!selectedShowtime;
  const gridRows = useRealSeats
    ? buildRealGrid(selectedShowtime!, user?.id ?? null)
    : buildStaticGrid();

  const toggleSeat = (label: string) => {
    if (!label) return;
    const seat = useRealSeats && selectedShowtime
      ? selectedShowtime.seats.find(s => s.label === label)
      : null;
    if (seat && seat.status === 'booked') return; // can't directly select booked seats
    setSelectedLabels(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label],
    );
  };

  const handleOfferSwap = async (seatLabel: string) => {
    try {
      await offerSeatSwap(selectedShowtimeId!, seatLabel);
      Alert.alert('Offer Sent', `Your seat ${seatLabel} is now available for swapping.`);
      refetchShowtimes();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to offer swap');
    }
  };

  const handleUnofferSwap = async (seatLabel: string) => {
    try {
      await unofferSeatSwap(selectedShowtimeId!, seatLabel);
      Alert.alert('Offer Removed', `Seat ${seatLabel} is no longer offered for swap.`);
      refetchShowtimes();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to remove offer');
    }
  };

  const handleSwappableTap = (theirSeatLabel: string) => {
    if (!selectedShowtime) return;
    // Strict rule: a swap requires an existing ticket in THIS EXACT showtime.
    const hasTicketForShowtime = selectedShowtime.seats.some(
      s => s.status === 'booked' && s.bookedBy === user?.id,
    );
    if (!hasTicketForShowtime) {
      Alert.alert(
        'Swap requires a ticket',
        'You must purchase a ticket first to initiate a swap.',
      );
      return;
    }
    setSwapTargetSeat(theirSeatLabel);
    setSwapModalVisible(true);
  };

  // Price calculation
  const subtotal = useRealSeats && selectedShowtime
    ? selectedLabels.reduce((sum, label) => {
        const seat = selectedShowtime.seats.find(s => s.label === label);
        if (!seat) return sum;
        return sum + (seat.type === 'premium' ? selectedShowtime.price.premium : selectedShowtime.price.standard);
      }, 0)
    : selectedLabels.length * movie.price;
  const convenienceFee = selectedLabels.length > 0 ? 30 : 0;
  const total = subtotal + convenienceFee;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!useRealSeats && !selectedShowtimeId) {
      // static fallback still has showtime chips from movie.showtimes, no need to validate
    }
    if (selectedLabels.length === 0) newErrors.seats = 'Please select at least one seat';
    if (!paymentMode) newErrors.payment = 'Please select a payment mode';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBooking = async () => {
    if (!validate()) return;
    setBookingLoading(true);
    try {
      if (useRealSeats && selectedShowtimeId) {
        await createBooking({
          showtimeId: selectedShowtimeId,
          seatLabels: selectedLabels,
          paymentMode,
        });
        Alert.alert(
          'Booking Confirmed!',
          `${movie.name}\nSeats: ${selectedLabels.join(', ')}\nTotal: ₹${total}`,
          [{text: 'View Orders', onPress: () => {
            const tabNav = navigation.getParent();
            if (tabNav) tabNav.navigate('OrdersTab');
            else navigation.goBack();
          }}],
        );
      } else {
        // Offline fallback – Redux-only booking
        const booking: BookingItem = {
          id: 'BK' + Date.now(),
          movie: movie,
          showtime: movie.showtimes[0] || '10:00 AM',
          seats: selectedLabels,
          quantity: selectedLabels.length,
          subtotal,
          convenienceFee,
          total,
          paymentMode,
          status: 'confirmed',
          bookedAt: new Date().toISOString(),
        };
        dispatch(addBooking(booking));
        Alert.alert(
          'Booking Confirmed!',
          `${movie.name}\nSeats: ${selectedLabels.join(', ')}\nTotal: ₹${total}`,
          [{text: 'View Orders', onPress: () => {
            const tabNav = navigation.getParent();
            if (tabNav) tabNav.navigate('OrdersTab');
            else navigation.goBack();
          }}],
        );
      }
    } catch (err: any) {
      Alert.alert('Booking Failed', err?.message || 'Please try again');
    } finally {
      setBookingLoading(false);
    }
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
          <TouchableOpacity onPress={() => refetchShowtimes()} style={styles.backBtn}>
            <Icon name="refresh" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
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
            {useRealSeats
              ? allShowtimes.map((st, i) => (
                  <TouchableOpacity
                    key={st._id}
                    style={[styles.chip, selectedShowtimeId === st._id && styles.chipActive]}
                    onPress={() => { setSelectedShowtimeId(st._id); setSelectedLabels([]); }}>
                    <Text style={[styles.chipText, selectedShowtimeId === st._id && styles.chipTextActive]}>
                      {formatShowtime(st.startTime)}
                    </Text>
                  </TouchableOpacity>
                ))
              : movie.showtimes.map((time: string, i: number) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.chip, i === 0 && styles.chipActive]}
                    onPress={() => {}}>
                    <Text style={[styles.chipText, i === 0 && styles.chipTextActive]}>{time}</Text>
                  </TouchableOpacity>
                ))}
          </View>
          {allShowtimes.length === 0 && (
            <Text style={styles.hintText}>Offline mode — using local seat layout</Text>
          )}
        </View>

        {/* Seat Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Seats</Text>
          <View style={styles.screen}>
            <Text style={styles.screenText}>SCREEN</Text>
          </View>

          {gridRows.map((row, ri) => (
            <View key={ri} style={styles.seatRow}>
              {row.map((cell, si) => {
                if (cell.empty) return <View key={si} style={styles.seatGap} />;
                const {label, type, tags, status, swappable, isOwn} = cell;
                const isSelected = selectedLabels.includes(label);
                const isBooked = status === 'booked';
                const isSwappableOffer = isBooked && !isOwn && swappable;
                const isOwnBooked = isBooked && isOwn;
                const isPremium = type === 'premium';
                const isBestView = tags?.includes('best-view');
                const isFamily = tags?.includes('family');

                const bg = isSelected
                  ? Colors.primary
                  : isBooked
                  ? isSwappableOffer
                    ? '#FF9800'
                    : isOwnBooked
                    ? Colors.info
                    : '#3A1E1E'
                  : isPremium
                  ? '#2A1A3E'
                  : isBestView
                  ? '#2E2410'
                  : isFamily
                  ? '#1A2A2A'
                  : Colors.backgroundInput;

                const border = isSelected
                  ? Colors.primary
                  : isSwappableOffer
                  ? '#FF9800'
                  : isOwnBooked
                  ? Colors.info
                  : isPremium
                  ? Colors.accent
                  : isBestView
                  ? '#FFB800'
                  : isFamily
                  ? '#448AFF'
                  : Colors.border;

                const handlePress = () => {
                  if (isSwappableOffer) handleSwappableTap(label);
                  else if (isOwnBooked) {
                    Alert.alert(
                      'Swap Settings',
                      `Seat ${label} is currently offered for swapping.`,
                      [
                        {text: 'Cancel Offer', onPress: () => handleUnofferSwap(label)},
                        {text: 'OK', style: 'cancel'},
                      ],
                    );
                  } else if (isBooked) {
                    Alert.alert('Seat Unavailable', `${label} is already booked.`);
                  } else {
                    toggleSeat(label);
                  }
                };

                return (
                  <TouchableOpacity key={si} style={[styles.seat, {backgroundColor: bg, borderColor: border}]} onPress={handlePress}>
                    <Text style={[styles.seatText, (isSelected || isBooked) && styles.seatTextSelected]} numberOfLines={1}>
                      {isSwappableOffer ? '⇄' : isOwnBooked ? '⇄' : type === 'aisle' ? '│' : label.slice(-1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {/* Legend — always shown */}
          <View style={styles.legendGrid}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: Colors.backgroundInput, borderColor: Colors.border}]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: Colors.primary, borderColor: Colors.primary}]} />
              <Text style={styles.legendText}>Selected</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: '#3A1E1E', borderColor: '#3A1E1E'}]} />
              <Text style={styles.legendText}>Booked</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: '#2E2410', borderColor: '#FFB800'}]} />
              <Text style={styles.legendText}>⭐ Best View</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: '#1A2A2A', borderColor: '#448AFF'}]} />
              <Text style={styles.legendText}>👨‍👩‍👧 Family</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: '#2A1A3E', borderColor: Colors.accent}]} />
              <Text style={styles.legendText}>💎 Premium</Text>
            </View>
            {useRealSeats && (
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#FF9800', borderColor: '#FF9800'}]} />
                <Text style={styles.legendText}>⇄ Swappable</Text>
              </View>
            )}
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
                style={[styles.chip, paymentMode === mode && styles.chipActive]}
                onPress={() => setPaymentMode(mode)}>
                <Text style={[styles.chipText, paymentMode === mode && styles.chipTextActive]}>{mode}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.payment && <Text style={styles.errorText}>{errors.payment}</Text>}
        </View>

        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tickets ({selectedLabels.length}x)</Text>
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
            loading={bookingLoading}
            style={styles.confirmButton}
          />
          <Button title="Cancel" onPress={() => navigation.goBack()} variant="outline" size="medium" />
        </View>
      </ScrollView>

      {/* Swap proposal UI — strictly separate from checkout */}
      <SwapProposalModal
        visible={swapModalVisible}
        showtimeId={selectedShowtimeId}
        theirSeat={swapTargetSeat}
        userId={user?.id ?? null}
        seats={useRealSeats && selectedShowtime ? selectedShowtime.seats : []}
        onClose={() => setSwapModalVisible(false)}
        onInitiated={() => {
          setSwapModalVisible(false);
          setSwapTargetSeat(null);
          refetchShowtimes();
        }}
      />
    </View>
  );
};

// ---- helpers ----

type SeatCell = {
  label: string;
  type: string;
  tags: string[];
  status: string;
  swappable: boolean;
  isOwn: boolean;
  empty?: boolean;
};

function buildRealGrid(showtime: Showtime, currentUserId: string | null): SeatCell[][] {
  const maxRow = Math.max(...showtime.seats.map(s => s.row));
  const maxCol = Math.max(...showtime.seats.map(s => s.col));
  const rows: SeatCell[][] = [];
  for (let r = 0; r <= maxRow; r++) {
    const cells: SeatCell[] = [];
    for (let c = 0; c <= maxCol; c++) {
      const seat = showtime.seats.find(s => s.row === r && s.col === c);
      if (!seat) continue;
      cells.push({
        label: seat.label,
        type: seat.type,
        tags: seat.tags,
        status: seat.status,
        swappable: seat.swappable,
        isOwn: seat.bookedBy != null && seat.bookedBy === currentUserId,
      });
    }
    rows.push(cells);
  }
  return rows;
}

function buildStaticGrid(): SeatCell[][] {
  // Build from pre-tagged seats so best-view/family/premium colors show offline
  const rows: SeatCell[][] = [];
  for (let r = 0; r < STATIC_ROWS; r++) {
    const cells: SeatCell[] = [];
    for (let c = 0; c < STATIC_COLS; c++) {
      const seat = TAGGED_STATIC_SEATS.find(s => s.row === r && s.col === c);
      if (!seat) continue;
      if (seat.type === 'aisle') {
        cells.push({empty: true, label: '', type: 'aisle', tags: [], status: 'available', swappable: false, isOwn: false});
      } else {
        cells.push({label: seat.label, type: seat.type, tags: seat.tags, status: 'available', swappable: false, isOwn: false});
      }
    }
    rows.push(cells);
  }
  return rows;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...Typography.h4, color: Colors.textMuted, marginTop: Spacing.base },
  emptySubtext: { ...Typography.body, color: Colors.textMuted, marginTop: Spacing.xs },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.xl, paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.backgroundCard,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { ...Typography.h3, color: Colors.textPrimary },
  movieCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundCard,
    marginHorizontal: Spacing.base, borderRadius: BorderRadius.lg, padding: Spacing.base,
    marginBottom: Spacing.lg, ...Shadow.sm,
  },
  movieInfo: { flex: 1, marginLeft: Spacing.md },
  movieName: { ...Typography.subtitle, color: Colors.textPrimary },
  movieMeta: { ...Typography.caption, color: Colors.textSecondary },
  moviePrice: { ...Typography.h4, color: Colors.accent, fontWeight: '800' },
  section: { marginHorizontal: Spacing.base, marginBottom: Spacing.lg },
  sectionTitle: { ...Typography.subtitle, color: Colors.textPrimary, marginBottom: Spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary + '25', borderColor: Colors.primary },
  chipText: { ...Typography.body, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },
  hintText: { ...Typography.small, color: Colors.textMuted, marginTop: Spacing.xs },
  screen: {
    backgroundColor: Colors.primary + '30', borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs, alignItems: 'center', marginBottom: Spacing.base,
  },
  screenText: { ...Typography.small, color: Colors.primary, fontWeight: '700', letterSpacing: 4 },
  seatRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.xs, gap: 4 },
  seat: {
    width: 34, height: 30, borderRadius: BorderRadius.sm,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  seatGap: { width: 20 },
  seatText: { ...Typography.small, color: Colors.textSecondary, fontWeight: '600', fontSize: 10 },
  seatTextSelected: { color: Colors.white },
  legendGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    gap: Spacing.sm, marginTop: Spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 3, borderWidth: 1 },
  legendText: { ...Typography.small, color: Colors.textMuted, fontSize: 10 },
  summaryCard: {
    backgroundColor: Colors.backgroundCard, marginHorizontal: Spacing.base,
    borderRadius: BorderRadius.lg, padding: Spacing.base, marginBottom: Spacing.lg, ...Shadow.sm,
  },
  summaryTitle: { ...Typography.subtitle, color: Colors.textPrimary, marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  summaryLabel: { ...Typography.body, color: Colors.textSecondary },
  summaryValue: { ...Typography.body, color: Colors.textPrimary, fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  totalLabel: { ...Typography.subtitle, color: Colors.textPrimary },
  totalValue: { ...Typography.h4, color: Colors.accent, fontWeight: '800' },
  buttonContainer: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxl, gap: Spacing.sm },
  confirmButton: { marginBottom: 0 },
  errorText: { ...Typography.small, color: Colors.error, marginTop: Spacing.xs },
});

export default BookingsScreen;