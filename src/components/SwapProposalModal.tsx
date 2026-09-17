import React, {useEffect, useState} from 'react';
import {Modal, View, Text, StyleSheet, TouchableOpacity, Alert, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Typography, Spacing, BorderRadius, Shadow} from '../theme';
import {Showtime, initiateSeatSwap} from '../services/api';
import Button from './Button';

interface SwapProposalModalProps {
  visible: boolean;
  showtimeId: string | null;
  theirSeat: string | null;
  userId: string | null;
  seats: Showtime['seats'];
  onClose: () => void;
  onInitiated: () => void;
}

// Strictly SEPARATE from the standard checkout flow.
// This modal is only ever opened from a "Swappable" seat tap, and the only
// thing it can do is initiate a peer-to-peer seat swap — never checkout.
const SwapProposalModal: React.FC<SwapProposalModalProps> = ({
  visible,
  showtimeId,
  theirSeat,
  userId,
  seats,
  onClose,
  onInitiated,
}) => {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // My own booked seats that are not already offered for swapping.
  const mySeats = seats.filter(
    s => s.status === 'booked' && s.bookedBy === userId && !s.swappable,
  );

  useEffect(() => {
    if (visible && mySeats.length > 0 && !mySeats.some(s => s.label === selectedSeat)) {
      setSelectedSeat(mySeats[0].label);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleSend = async () => {
    if (!selectedSeat || !theirSeat || !showtimeId) return;
    setLoading(true);
    try {
      await initiateSeatSwap(showtimeId, selectedSeat, theirSeat);
      Alert.alert(
        'Swap Request Sent',
        `You offered ${selectedSeat} for ${theirSeat}. The other user will be notified.`,
        [{text: 'OK', onPress: onInitiated}],
      );
    } catch (err: any) {
      Alert.alert('Swap Failed', err?.message || 'Could not send the swap request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <Icon name="swap-horizontal" size={22} color={Colors.accent} />
            <Text style={styles.title}>Propose a Seat Swap</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.seatPair}>
            <View style={styles.pairBox}>
              <Text style={styles.pairLabel}>YOUR SEAT</Text>
              <Text style={styles.pairValue}>{selectedSeat || '—'}</Text>
            </View>
            <Icon name="arrow-forward" size={20} color={Colors.textMuted} />
            <View style={[styles.pairBox, styles.pairBoxAccent]}>
              <Text style={styles.pairLabel}>REQUESTED</Text>
              <Text style={styles.pairValue}>{theirSeat || '—'}</Text>
            </View>
          </View>

          {mySeats.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>
                {seats.some(s => s.status === 'booked' && s.bookedBy === userId)
                  ? 'All of your seats in this show are already offered for swapping.'
                  : 'You have no booked seats in this show to offer.'}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.hint}>Choose which of your seats to offer:</Text>
              <View style={styles.seatList}>
                {mySeats.map(seat => {
                  const active = selectedSeat === seat.label;
                  return (
                    <TouchableOpacity
                      key={seat.label}
                      style={[styles.seatChip, active && styles.seatChipActive]}
                      onPress={() => setSelectedSeat(seat.label)}>
                      <Text style={[styles.seatChipText, active && styles.seatChipTextActive]}>
                        {seat.label}
                      </Text>
                      {seat.type === 'premium' && (
                        <Text style={styles.premiumTag}>PREMIUM</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          <Button
            title="Send Swap Request"
            onPress={handleSend}
            variant="accent"
            size="large"
            loading={loading}
            disabled={mySeats.length === 0 || !selectedSeat}
            style={styles.sendBtn}
          />
          <View style={styles.noteRow}>
            <Icon name="information-circle-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.note}>
              This only requests a seat swap. Your booking balance is unaffected.
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadow.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  closeBtn: {
    marginLeft: 'auto',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
    fontWeight: '700',
  },
  seatPair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  pairBox: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  pairBoxAccent: {
    backgroundColor: Colors.primary + '25',
  },
  pairLabel: {
    ...Typography.small,
    color: Colors.textMuted,
    fontSize: 10,
    letterSpacing: 1,
  },
  pairValue: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '800',
    marginTop: 2,
  },
  hint: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  seatList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  seatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  seatChipActive: {
    backgroundColor: Colors.primary + '25',
    borderColor: Colors.primary,
  },
  seatChipText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  seatChipTextActive: {
    color: Colors.primary,
  },
  premiumTag: {
    ...Typography.small,
    fontSize: 9,
    color: Colors.accent,
    fontWeight: '700',
  },
  emptyWrap: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  sendBtn: {
    marginBottom: Spacing.sm,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
  },
  note: {
    ...Typography.small,
    color: Colors.textMuted,
    fontSize: 11,
    flexShrink: 1,
  },
});

export default SwapProposalModal;