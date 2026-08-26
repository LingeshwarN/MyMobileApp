import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Typography, Spacing, BorderRadius, Shadow} from '../theme';

const HelpScreen = ({navigation}: any) => {
  const faqs = [
    {q: 'How do I book a ticket?', a: 'Browse movies from the Home screen, select a movie, choose your showtime and seats, then confirm your booking.'},
    {q: 'Can I cancel a booking?', a: 'Yes! Go to Orders, find your booking, and tap "Cancel Booking". Refund will be processed within 3-5 business days.'},
    {q: 'How do I update my profile?', a: 'Navigate to Profile > Edit Profile. Update your details and tap "Save Changes".'},
    {q: 'What payment methods are accepted?', a: 'We accept UPI, Credit Card, Debit Card, Net Banking, and Wallet payments.'},
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Help & Support</Text>
          <View style={{width: 40}} />
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactEmoji}>🎧</Text>
          <Text style={styles.contactTitle}>Need Help?</Text>
          <Text style={styles.contactSub}>We're here for you 24/7</Text>
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactBtn}>
              <Icon name="call" size={20} color={Colors.white} />
              <Text style={styles.contactBtnText}>Call Us</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactBtn, {backgroundColor: Colors.success}]}>
              <Icon name="mail" size={20} color={Colors.white} />
              <Text style={styles.contactBtnText}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqs.map((faq, i) => (
          <View key={i} style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Icon name="help-circle" size={20} color={Colors.primary} />
              <Text style={styles.faqQuestion}>{faq.q}</Text>
            </View>
            <Text style={styles.faqAnswer}>{faq.a}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing.base, paddingTop: Spacing.xl},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl},
  backBtn: {width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.backgroundCard, alignItems: 'center', justifyContent: 'center'},
  title: {...Typography.h3, color: Colors.textPrimary},
  contactCard: {backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.xl, ...Shadow.md},
  contactEmoji: {fontSize: 48, marginBottom: Spacing.sm},
  contactTitle: {...Typography.h3, color: Colors.white},
  contactSub: {...Typography.body, color: Colors.white + 'CC', marginBottom: Spacing.lg},
  contactRow: {flexDirection: 'row', gap: Spacing.md},
  contactBtn: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.accent, borderRadius: BorderRadius.lg, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg},
  contactBtnText: {...Typography.buttonSmall, color: Colors.white},
  sectionTitle: {...Typography.h4, color: Colors.textPrimary, marginBottom: Spacing.md},
  faqCard: {backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg, padding: Spacing.base, marginBottom: Spacing.md, ...Shadow.sm},
  faqHeader: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm},
  faqQuestion: {...Typography.subtitle, color: Colors.textPrimary, flex: 1},
  faqAnswer: {...Typography.body, color: Colors.textSecondary, lineHeight: 22},
});

export default HelpScreen;
