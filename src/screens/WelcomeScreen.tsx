import React from 'react';
import {View, Text, StyleSheet, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Typography, Spacing, Shadow} from '../theme';
import Button from '../components/Button';

const WelcomeScreen = ({navigation}: any) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background decoration circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Icon name="film" size={50} color={Colors.accent} />
          </View>
        </View>

        {/* Branding */}
        <Text style={styles.appName}>CineBooks</Text>
        <Text style={styles.tagline}>
          Your Premier Movie Booking Experience
        </Text>
        <Text style={styles.subTagline}>
          Browse • Book • Enjoy
        </Text>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.featureRow}>
            <Icon name="ticket" size={18} color={Colors.accent} />
            <Text style={styles.featureText}>Book tickets instantly</Text>
          </View>
          <View style={styles.featureRow}>
            <Icon name="star" size={18} color={Colors.accent} />
            <Text style={styles.featureText}>Explore top-rated movies</Text>
          </View>
          <View style={styles.featureRow}>
            <Icon name="heart" size={18} color={Colors.accent} />
            <Text style={styles.featureText}>Save your favorites</Text>
          </View>
        </View>

        {/* Get Started Button */}
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('Login')}
          variant="accent"
          size="large"
          style={styles.button}
        />

        <Text style={styles.footer}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
  circle1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary + '15',
  },
  circle2: {
    position: 'absolute',
    bottom: -120,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: Colors.accent + '10',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  logoContainer: {
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + '25',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.glow(Colors.primary),
  },
  appName: {
    ...Typography.h1,
    color: Colors.textPrimary,
    fontSize: 42,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subTagline: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    letterSpacing: 4,
    marginBottom: Spacing.xxl,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  featureText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  button: {
    alignSelf: 'stretch',
    marginBottom: Spacing.lg,
  },
  footer: {
    ...Typography.small,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
