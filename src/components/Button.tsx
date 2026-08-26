import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {Colors, Typography, BorderRadius, Shadow, Spacing} from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = {
      ...styles.base,
      ...Shadow.md,
    };
    switch (variant) {
      case 'primary':
        return {...base, backgroundColor: Colors.primary};
      case 'secondary':
        return {...base, backgroundColor: Colors.backgroundCard};
      case 'outline':
        return {
          ...base,
          backgroundColor: Colors.transparent,
          borderWidth: 2,
          borderColor: Colors.primary,
        };
      case 'accent':
        return {...base, backgroundColor: Colors.accent};
      case 'danger':
        return {...base, backgroundColor: Colors.error};
      default:
        return {...base, backgroundColor: Colors.primary};
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'outline':
        return Colors.primary;
      case 'accent':
        return Colors.textDark;
      default:
        return Colors.textPrimary;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base};
      case 'large':
        return {paddingVertical: Spacing.base, paddingHorizontal: Spacing.xxl};
      default:
        return {paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl};
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        getButtonStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {color: getTextColor()},
              size === 'small' && Typography.buttonSmall,
              textStyle,
            ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  text: {
    ...Typography.button,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
