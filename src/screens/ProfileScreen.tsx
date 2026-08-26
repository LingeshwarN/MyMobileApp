import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {DrawerActions} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors, Typography, Spacing, BorderRadius, Shadow} from '../theme';
import {UserContext} from '../context/UserContext';
import Button from '../components/Button';

const ProfileScreen = ({navigation}: any) => {
  const {user, logout} = useContext(UserContext);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userProfile');
          logout();
          Alert.alert('Success', 'You have been logged out.');
        },
      },
    ]);
  };

  const menuItems = [
    {icon: 'person-circle', label: 'Edit Profile', screen: 'ProfileEdit', color: Colors.primary},
    {icon: 'settings', label: 'Preferences', screen: 'Preferences', color: Colors.accent},
    {icon: 'heart', label: 'Wishlist', screen: 'Wishlist', color: Colors.error},
    {icon: 'receipt', label: 'Booking History', screen: 'OrdersTab', color: Colors.success},
    {icon: 'chatbubble', label: 'Feedback', screen: 'Feedback', color: Colors.info},
    {icon: 'help-circle', label: 'Help & Support', screen: 'Help', color: '#9C27B0'},
    {icon: 'cog', label: 'Settings', screen: 'Settings', color: Colors.textMuted},
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Icon name="ellipsis-vertical" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Profile</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => navigation.navigate('ProfileEdit')}
            activeOpacity={0.8}>
            <Image
              source={{uri: user?.avatar || 'https://picsum.photos/seed/lingesh/200/200'}}
              style={styles.avatar}
            />
            <View style={styles.editAvatarBtn}>
              <Icon name="pencil" size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{user?.name || 'Lingesh'}</Text>
          <Text style={styles.email}>{user?.email || 'lingesh@cinebooks.com'}</Text>
          <TouchableOpacity
            style={styles.editBadge}
            onPress={() => navigation.navigate('ProfileEdit')}>
            <Icon name="create-outline" size={14} color={Colors.primary} />
            <Text style={styles.editBadgeText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="mail" size={18} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'lingesh@cinebooks.com'}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Icon name="call" size={18} color={Colors.success} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user?.phone || '9876543210'}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Icon name="location" size={18} color={Colors.accent} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{user?.address || '123 Cinema Street, Chennai'}</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.screen)}>
                <View style={[styles.menuIcon, {backgroundColor: item.color + '20'}]}>
                  <Icon name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
              {index < menuItems.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            size="large"
            icon={<Icon name="log-out" size={20} color={Colors.white} />}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xs,
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
  topBarTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.base,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  name: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  email: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '20',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginTop: Spacing.sm,
  },
  editBadgeText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: Spacing.base,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.small,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  menuCard: {
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: Spacing.base,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: 56,
  },
  logoutContainer: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
});

export default ProfileScreen;
