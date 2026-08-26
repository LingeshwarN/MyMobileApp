import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, Typography} from '../theme';

interface BadgeProps {
  count: number;
  size?: number;
}

const Badge: React.FC<BadgeProps> = ({count, size = 18}) => {
  if (count <= 0) return null;
  return (
    <View style={[styles.badge, {width: size, height: size, borderRadius: size / 2}]}>
      <Text style={[styles.text, {fontSize: size * 0.55}]}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -4,
    right: -6,
  },
  text: {
    ...Typography.small,
    color: Colors.white,
    fontWeight: '700',
  },
});

export default Badge;
