import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { authAPI, setAuthToken } from '../../config/api';
import { COLORS, SPACING, FONT_SIZES, APP_NAME, COMPANY_NAME } from '../../config/constants';
import { showMessage } from 'react-native-flash-message';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation, route }) => {
  const { onLogin } = route.params || {};
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const deviceName = Platform.OS === 'ios' ? 'iPhone' : 'Android';
      
      const response = await authAPI.login({
        email: data.email,
        password: data.password,
        device_name: `${deviceName} - ${APP_NAME}`,
      });

      // Safe access with fallback
      if (response && response.data && response.data.user && response.data.token) {
        const { user, token } = response.data;
        
        // Store token
        await setAuthToken(token);
        
        // Show success message
        showMessage({
          message: 'התחברות בוצעה בהצלחה',
          description: `ברוך הבא, ${user.name || 'משתמש'}`,
          type: 'success',
          position: 'top',
          duration: 2000,
        });
        
        // Call onLogin callback
        if (onLogin) {
          onLogin(user, token);
        }
      } else {
        throw new Error('Invalid login response from server');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'שגיאה בהתחברות';
      let errorDescription = 'אנא נסה שוב';
      
      if (error.response?.status === 401) {
        errorMessage = 'פרטי התחברות שגויים';
        errorDescription = 'אנא בדוק את האימייל והסיסמה';
      } else if (error.response?.status === 403) {
        if (error.response.data.suspension_details) {
          errorMessage = 'החשבון מושעה';
          errorDescription = `סיבה: ${error.response.data.suspension_details.reason}`;
        } else {
          errorMessage = 'אין הרשאה';
          errorDescription = 'נדרשות הרשאות צוות תמיכה';
        }
      } else if (error.response?.status === 429) {
        errorMessage = 'יותר מדי ניסיונות התחברות';
        errorDescription = 'אנא המתן מספר דקות ונסה שוב';
      } else if (!error.response) {
        errorMessage = 'שגיאת רשת';
        errorDescription = 'אנא בדוק את החיבור לאינטרנט';
      }
      
      showMessage({
        message: errorMessage,
        description: errorDescription,
        type: 'danger',
        position: 'top',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>{APP_NAME}</Text>
            </View>
            <Text style={styles.companyName}>{COMPANY_NAME}</Text>
            <Text style={styles.subtitle}>מערכת ניהול תמיכה</Text>
          </View>

          {/* Login Form */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.title}>התחברות</Text>
              
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'שדה חובה',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'כתובת אימייל לא תקינה',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    mode="outlined"
                    label="אימייל"
                    placeholder="הזן כתובת אימייל"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    error={!!errors.email}
                    style={styles.input}
                    right={<TextInput.Icon icon="email" />}
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}

              <Controller
                control={control}
                name="password"
                rules={{
                  required: 'שדה חובה',
                  minLength: {
                    value: 6,
                    message: 'סיסמה חייבת להכיל לפחות 6 תווים',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    mode="outlined"
                    label="סיסמה"
                    placeholder="הזן סיסמה"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    secureTextEntry
                    autoComplete="password"
                    textContentType="password"
                    error={!!errors.password}
                    style={styles.input}
                    right={<TextInput.Icon icon="key" />}
                  />
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                contentStyle={styles.loginButtonContent}
                labelStyle={styles.loginButtonLabel}
              >
                {loading ? 'מתחבר...' : 'התחבר'}
              </Button>
            </Card.Content>
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              לתמיכה טכנית, פנה למנהל המערכת
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  companyName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    elevation: 4,
    borderRadius: 12,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  input: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
    textAlign: 'right',
  },
  loginButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  loginButtonContent: {
    paddingVertical: SPACING.sm,
  },
  loginButtonLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default LoginScreen;