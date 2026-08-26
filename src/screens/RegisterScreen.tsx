import React, {useState} from 'react';
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
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Typography, Spacing, BorderRadius, Shadow} from '../theme';
import InputField from '../components/InputField';
import Button from '../components/Button';

const RegisterScreen = ({navigation}: any) => {
  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    dob: '',
    city: '',
    address: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(form.fullName)) {
      newErrors.fullName = 'Name should contain only alphabetic characters';
    }

    if (!form.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(form.mobile)) {
      newErrors.mobile = 'Mobile number must contain exactly 10 digits';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!form.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(form.password)) {
      newErrors.password = 'Must include uppercase, number, and special character';
    }

    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!form.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the Terms and Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Registration Successful!',
        'Your CineBooks account has been created. Please login.',
        [{text: 'Login Now', onPress: () => navigation.navigate('Login')}],
      );
    }, 1500);
  };

  const genders = ['Male', 'Female', 'Other'];

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join CineBooks and start booking!</Text>
        </View>

        {/* Registration Form Card */}
        <View style={styles.card}>
          <InputField
            label="Full Name"
            value={form.fullName}
            onChangeText={v => updateField('fullName', v)}
            placeholder="Lingesh"
            icon="person"
            error={errors.fullName}
          />
          <InputField
            label="Mobile Number"
            value={form.mobile}
            onChangeText={v => updateField('mobile', v)}
            placeholder="9876543210"
            keyboardType="phone-pad"
            icon="call"
            error={errors.mobile}
            maxLength={10}
          />
          <InputField
            label="Email Address"
            value={form.email}
            onChangeText={v => updateField('email', v)}
            placeholder="your@email.com"
            keyboardType="email-address"
            icon="mail"
            error={errors.email}
          />
          <InputField
            label="Password"
            value={form.password}
            onChangeText={v => updateField('password', v)}
            placeholder="Min 8 chars, uppercase, number, special"
            secureTextEntry
            icon="lock-closed"
            error={errors.password}
          />
          <InputField
            label="Confirm Password"
            value={form.confirmPassword}
            onChangeText={v => updateField('confirmPassword', v)}
            placeholder="Re-enter your password"
            secureTextEntry
            icon="lock-closed"
            error={errors.confirmPassword}
          />

          {/* Gender Selection */}
          <Text style={styles.fieldLabel}>GENDER</Text>
          <View style={styles.genderRow}>
            {genders.map(g => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.genderChip,
                  form.gender === g && styles.genderChipActive,
                ]}
                onPress={() => updateField('gender', g)}>
                <Text
                  style={[
                    styles.genderText,
                    form.gender === g && styles.genderTextActive,
                  ]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <InputField
            label="Date of Birth"
            value={form.dob}
            onChangeText={v => updateField('dob', v)}
            placeholder="DD/MM/YYYY"
            icon="calendar"
            keyboardType="numeric"
          />
          <InputField
            label="City"
            value={form.city}
            onChangeText={v => updateField('city', v)}
            placeholder="Mumbai"
            icon="location"
            error={errors.city}
          />
          <InputField
            label="Address"
            value={form.address}
            onChangeText={v => updateField('address', v)}
            placeholder="Enter your address"
            icon="home"
            multiline
            numberOfLines={3}
          />

          {/* Terms */}
          <View style={styles.termsRow}>
            <Switch
              value={acceptTerms}
              onValueChange={setAcceptTerms}
              trackColor={{false: Colors.border, true: Colors.primary + '80'}}
              thumbColor={acceptTerms ? Colors.primary : Colors.textMuted}
            />
            <Text style={styles.termsText}>
              I accept the{' '}
              <Text style={styles.termsLink}>Terms and Conditions</Text>
            </Text>
          </View>
          {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

          <Button
            title="Register"
            onPress={handleRegister}
            variant="accent"
            size="large"
            loading={loading}
            style={styles.registerButton}
          />

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={styles.loginLinkHighlight}>Login</Text>
            </Text>
          </TouchableOpacity>
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
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
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
  fieldLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  genderChip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundInput,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  genderChipActive: {
    backgroundColor: Colors.primary + '25',
    borderColor: Colors.primary,
  },
  genderText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  genderTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  termsText: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  errorText: {
    ...Typography.small,
    color: Colors.error,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  registerButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.base,
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  loginLinkHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
});

export default RegisterScreen;
