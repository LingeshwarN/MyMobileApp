import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Typography, Spacing, BorderRadius, Shadow} from '../theme';
import InputField from '../components/InputField';
import Button from '../components/Button';
import {UserContext} from '../context/UserContext';

const ProfileEditScreen = ({navigation}: any) => {
  const {user, updateUser} = useContext(UserContext);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setForm(prev => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors(prev => {
        const next = {...prev};
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone)) newErrors.phone = 'Must be exactly 10 digits';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateUser({
      name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      avatar: user?.avatar || 'https://picsum.photos/seed/user/200/200',
    });
    Alert.alert('Success', 'Profile updated successfully!', [
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
          <Text style={styles.title}>Edit Profile</Text>
          <View style={{width: 40}} />
        </View>

        <View style={styles.avatarSection}>
          <Image
            source={{uri: user?.avatar || 'https://picsum.photos/seed/user/200/200'}}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.changePhoto}>
            <Icon name="camera" size={16} color={Colors.primary} />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <InputField label="Full Name" value={form.name} onChangeText={v => updateField('name', v)} icon="person" error={errors.name} />
          <InputField label="Phone Number" value={form.phone} onChangeText={v => updateField('phone', v)} icon="call" keyboardType="phone-pad" error={errors.phone} maxLength={10} />
          <InputField label="Email Address" value={form.email} onChangeText={v => updateField('email', v)} icon="mail" keyboardType="email-address" error={errors.email} />
          <InputField label="Address" value={form.address} onChangeText={v => updateField('address', v)} icon="location" multiline numberOfLines={3} />

          <Button title="Save Changes" onPress={handleSave} variant="accent" size="large" style={{marginTop: Spacing.md}} />
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
  avatarSection: {alignItems: 'center', marginBottom: Spacing.xl},
  avatar: {width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: Colors.primary},
  changePhoto: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm},
  changePhotoText: {...Typography.caption, color: Colors.primary, fontWeight: '600'},
  card: {backgroundColor: Colors.backgroundLight, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadow.lg},
});

export default ProfileEditScreen;
