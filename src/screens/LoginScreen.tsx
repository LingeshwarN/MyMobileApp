import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Typography, Spacing, BorderRadius, Shadow} from '../theme';
import InputField from '../components/InputField';
import Button from '../components/Button';
import {UserContext} from '../context/UserContext';

const LoginScreen = ({navigation}: any) => {
  const {login} = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: {email?: string; password?: string} = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Phase E: real JWT authentication against the Express backend
      // Demo accounts are intercepted in UserContext before hitting the API
      await login(email.trim(), password);
      // No Alert — AppNavigator switches to main app automatically
    } catch (err: any) {
      setErrors({password: err?.message || 'Invalid email or password'});
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
    } catch (err: any) {
      setErrors({password: 'Demo login failed. Please try again.'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Icon name="person" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your CineBooks account</Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <InputField
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            icon="mail"
            error={errors.email}
          />
          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            icon="lock-closed"
            error={errors.password}
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => Alert.alert('Reset Password', 'A password reset link will be sent to your email.')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Login"
            onPress={handleLogin}
            variant="primary"
            size="large"
            loading={loading}
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Create Account"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
            size="large"
          />

          {/* Demo Accounts */}
          <View style={styles.demoSection}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>DEMO ACCOUNTS</Text>
              <View style={styles.dividerLine} />
            </View>
            <Text style={styles.demoHint}>Tap any to sign in instantly (no backend needed)</Text>
            {[
              {label: '🎬 Demo User', email: 'demo@cinebooks.com', pass: 'Demo@1234'},
              {label: '👤 Lingesh', email: 'lingesh@cinebooks.com', pass: 'Test@1234'},
              {label: '🔑 Admin', email: 'admin@cinebooks.com', pass: 'Admin@1234'},
            ].map(acc => (
              <TouchableOpacity
                key={acc.email}
                style={styles.demoChip}
                onPress={() => handleDemoLogin(acc.email, acc.pass)}
                disabled={loading}>
                <Text style={styles.demoChipLabel}>{acc.label}</Text>
                <Text style={styles.demoChipEmail}>{acc.email}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
    ...Shadow.glow(Colors.primary),
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadow.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: -Spacing.xs,
  },
  forgotText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: Spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginHorizontal: Spacing.md,
  },
  demoSection: {
    marginTop: Spacing.lg,
  },
  demoHint: {
    ...Typography.small,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.md,
    marginTop: -Spacing.sm,
  },
  demoChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundInput,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  demoChipLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  demoChipEmail: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});

export default LoginScreen;
