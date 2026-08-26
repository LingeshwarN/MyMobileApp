import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, Switch} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Typography, Spacing, BorderRadius, Shadow} from '../theme';
import Button from '../components/Button';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation'];
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];
const CINEMAS = ['PVR Cinemas', 'INOX', 'Cinepolis', 'Carnival Cinemas', 'Miraj Cinemas'];

const PreferencesScreen = ({navigation}: any) => {
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [cinema, setCinema] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!genre) newErrors.genre = 'Please select a genre';
    if (!language) newErrors.language = 'Please select a language';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    Alert.alert('Preferences Saved', 'Your preferences have been updated successfully!', [
      {text: 'OK', onPress: () => navigation.goBack()},
    ]);
  };

  const renderChips = (items: string[], selected: string, onSelect: (v: string) => void, errorKey: string) => (
    <View>
      <View style={styles.chipRow}>
        {items.map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.chip, selected === item && styles.chipActive]}
            onPress={() => onSelect(item)}>
            <Text style={[styles.chipText, selected === item && styles.chipTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors[errorKey] && <Text style={styles.errorText}>{errors[errorKey]}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Preferences</Text>
          <View style={{width: 40}} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Preferred Genre</Text>
          {renderChips(GENRES, genre, setGenre, 'genre')}

          <Text style={styles.sectionTitle}>Preferred Language</Text>
          {renderChips(LANGUAGES, language, setLanguage, 'language')}

          <Text style={styles.sectionTitle}>Preferred Cinema</Text>
          {renderChips(CINEMAS, cinema, setCinema, 'cinema')}

          <View style={styles.notifRow}>
            <View>
              <Text style={styles.notifLabel}>Push Notifications</Text>
              <Text style={styles.notifSub}>Get updates on new movies & offers</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{false: Colors.border, true: Colors.primary + '80'}}
              thumbColor={notifications ? Colors.primary : Colors.textMuted}
            />
          </View>

          <Button title="Save Preferences" onPress={handleSave} variant="accent" size="large" style={{marginTop: Spacing.lg}} />
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
  sectionTitle: {...Typography.subtitle, color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.lg},
  chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  chip: {backgroundColor: Colors.backgroundInput, borderRadius: BorderRadius.lg, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base, borderWidth: 1, borderColor: Colors.border},
  chipActive: {backgroundColor: Colors.primary + '25', borderColor: Colors.primary},
  chipText: {...Typography.body, color: Colors.textSecondary},
  chipTextActive: {color: Colors.primary, fontWeight: '600'},
  notifRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xl, paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.divider},
  notifLabel: {...Typography.subtitle, color: Colors.textPrimary},
  notifSub: {...Typography.caption, color: Colors.textMuted, marginTop: 2},
  errorText: {...Typography.small, color: Colors.error, marginTop: Spacing.xs},
});

export default PreferencesScreen;
