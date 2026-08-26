import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Typography, Spacing, BorderRadius, Shadow} from '../theme';

const SettingsScreen = ({navigation}: any) => {
  const [darkMode, setDarkMode] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);

  const settingGroups = [
    {
      title: 'Appearance',
      items: [
        {icon: 'moon', label: 'Dark Mode', toggle: true, value: darkMode, onToggle: setDarkMode},
      ],
    },
    {
      title: 'Notifications',
      items: [
        {icon: 'notifications', label: 'Push Notifications', toggle: true, value: notifications, onToggle: setNotifications},
      ],
    },
    {
      title: 'About',
      items: [
        {icon: 'information-circle', label: 'App Version', value: '1.0.0'},
        {icon: 'document-text', label: 'Terms of Service', onPress: () => Alert.alert('Terms', 'CineBooks Terms of Service')},
        {icon: 'shield-checkmark', label: 'Privacy Policy', onPress: () => Alert.alert('Privacy', 'CineBooks Privacy Policy')},
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>⚙️ Settings</Text>
          <View style={{width: 40}} />
        </View>

        {settingGroups.map((group, gi) => (
          <View key={gi} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item: any, ii) => (
                <TouchableOpacity key={ii} style={styles.item} onPress={item.onPress} disabled={item.toggle}>
                  <Icon name={item.icon} size={20} color={Colors.primary} />
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  {item.toggle ? (
                    <Switch value={item.value} onValueChange={item.onToggle} trackColor={{false: Colors.border, true: Colors.primary + '80'}} thumbColor={item.value ? Colors.primary : Colors.textMuted} />
                  ) : item.value && typeof item.value === 'string' ? (
                    <Text style={styles.itemValue}>{item.value}</Text>
                  ) : (
                    <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
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
  group: {marginBottom: Spacing.lg},
  groupTitle: {...Typography.caption, color: Colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm, marginLeft: Spacing.xs},
  groupCard: {backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadow.sm},
  item: {flexDirection: 'row', alignItems: 'center', padding: Spacing.base, gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider},
  itemLabel: {...Typography.body, color: Colors.textPrimary, flex: 1, fontWeight: '500'},
  itemValue: {...Typography.body, color: Colors.textMuted},
});

export default SettingsScreen;
