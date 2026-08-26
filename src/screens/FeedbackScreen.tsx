import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, Switch} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Typography, Spacing, BorderRadius, Shadow} from '../theme';
import InputField from '../components/InputField';
import StarRating from '../components/StarRating';
import Button from '../components/Button';

const FeedbackScreen = ({navigation}: any) => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [recommend, setRecommend] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (rating === 0) newErrors.rating = 'Please select a rating';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    Alert.alert('Thank You! 🎉', 'Your feedback has been submitted successfully.', [
      {text: 'OK', onPress: () => navigation.goBack()},
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Feedback</Text>
          <View style={{width: 40}} />
        </View>

        <View style={styles.card}>
          <View style={styles.emojiHeader}>
            <Text style={styles.emoji}>💬</Text>
            <Text style={styles.cardTitle}>We'd love your feedback!</Text>
            <Text style={styles.cardSub}>Help us improve your CineBooks experience</Text>
          </View>

          <InputField label="Your Name" value={name} onChangeText={setName} icon="person" error={errors.name} placeholder="Enter your name" />

          <Text style={styles.ratingLabel}>Rate Your Experience</Text>
          <View style={styles.ratingContainer}>
            <StarRating rating={rating} onRate={setRating} editable size={36} />
            <Text style={styles.ratingValue}>{rating > 0 ? `${rating}/5` : 'Tap to rate'}</Text>
          </View>
          {errors.rating && <Text style={styles.errorText}>{errors.rating}</Text>}

          <InputField label="Your Feedback" value={feedback} onChangeText={setFeedback} placeholder="Tell us what you think..." multiline numberOfLines={5} icon="chatbubble" />

          <View style={styles.recommendRow}>
            <View>
              <Text style={styles.recommendLabel}>Would you recommend CineBooks?</Text>
              <Text style={styles.recommendSub}>{recommend ? 'Yes, I would!' : 'Not yet'}</Text>
            </View>
            <Switch
              value={recommend}
              onValueChange={setRecommend}
              trackColor={{false: Colors.border, true: Colors.success + '80'}}
              thumbColor={recommend ? Colors.success : Colors.textMuted}
            />
          </View>

          <Button title="Submit Feedback" onPress={handleSubmit} variant="accent" size="large" style={{marginTop: Spacing.lg}} />
        </View>
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
  card: {backgroundColor: Colors.backgroundLight, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadow.lg},
  emojiHeader: {alignItems: 'center', marginBottom: Spacing.xl},
  emoji: {fontSize: 48, marginBottom: Spacing.sm},
  cardTitle: {...Typography.h4, color: Colors.textPrimary},
  cardSub: {...Typography.body, color: Colors.textSecondary, marginTop: 4},
  ratingLabel: {...Typography.caption, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm, marginLeft: Spacing.xs},
  ratingContainer: {alignItems: 'center', paddingVertical: Spacing.md, backgroundColor: Colors.backgroundInput, borderRadius: BorderRadius.lg, marginBottom: Spacing.md},
  ratingValue: {...Typography.body, color: Colors.accent, fontWeight: '600', marginTop: Spacing.xs},
  recommendRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.divider, marginTop: Spacing.md},
  recommendLabel: {...Typography.body, color: Colors.textPrimary, fontWeight: '500'},
  recommendSub: {...Typography.caption, color: Colors.textMuted, marginTop: 2},
  errorText: {...Typography.small, color: Colors.error, marginTop: -Spacing.sm, marginBottom: Spacing.sm, marginLeft: Spacing.xs},
});

export default FeedbackScreen;
