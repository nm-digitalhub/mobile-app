import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';
import { I18nManager, Platform, View, Text, ActivityIndicator } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import Icon from 'react-native-vector-icons/Ionicons';

// Services
import { getAuthToken, removeAuthToken, authAPI } from './src/config/api';
import { COLORS, ROUTES, TAB_ICONS, APP_NAME } from './src/config/constants';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import DashboardScreen from './src/screens/main/DashboardScreen';
import TicketListScreen from './src/screens/tickets/TicketListScreen';
import TicketDetailScreen from './src/screens/tickets/TicketDetailScreen';
import ClientListScreen from './src/screens/clients/ClientListScreen';
import OrderListScreen from './src/screens/orders/OrderListScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';

// Navigation
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();

// Show splash screen
SplashScreen.show();

// Enable RTL for Hebrew safely
try {
  if (Platform.OS !== 'web') {
    console.log('🔄 [RTL] Configuring RTL support...');
    I18nManager.allowRTL(true);
    
    // Only force RTL if not already set to avoid unnecessary restarts
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      console.log('🔄 [RTL] RTL force applied');
    } else {
      console.log('✅ [RTL] RTL already enabled');
    }
  }
} catch (rtlError) {
  console.warn('❌ [RTL] RTL configuration failed:', rtlError);
  // Continue without RTL - don't crash the app
}

// Paper theme configuration
const theme = {
  colors: {
    primary: COLORS.primary,
    accent: COLORS.secondary,
    background: COLORS.background,
    surface: COLORS.surface,
    text: COLORS.text,
    error: COLORS.error,
    notification: COLORS.warning,
    placeholder: COLORS.placeholder,
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
};

// Auth Stack Navigator
function AuthNavigator({ onLogin }) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        initialParams={{ onLogin }}
      />
    </AuthStack.Navigator>
  );
}

// Tickets Stack Navigator
function TicketsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.surface,
        headerTitleStyle: {
          fontWeight: 'bold',
          textAlign: 'right',
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen 
        name="TicketList" 
        component={TicketListScreen}
        options={{ title: 'טיקטי תמיכה' }}
      />
      <Stack.Screen 
        name="TicketDetail" 
        component={TicketDetailScreen}
        options={{ title: 'פרטי טיקט' }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case ROUTES.DASHBOARD:
              iconName = focused ? 'home' : 'home-outline';
              break;
            case ROUTES.TICKETS:
              iconName = focused ? 'ticket' : 'ticket-outline';
              break;
            case ROUTES.CLIENTS:
              iconName = focused ? 'people' : 'people-outline';
              break;
            case ROUTES.ORDERS:
              iconName = focused ? 'bag' : 'bag-outline';
              break;
            case ROUTES.PROFILE:
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
          elevation: 4,
          shadowOpacity: 0.1,
        },
        headerTintColor: COLORS.surface,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen 
        name={ROUTES.DASHBOARD} 
        component={DashboardScreen}
        options={{ 
          title: 'דשבורד',
          headerTitle: APP_NAME,
        }}
      />
      <Tab.Screen 
        name={ROUTES.TICKETS} 
        component={TicketsNavigator}
        options={{ 
          title: 'טיקטים',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name={ROUTES.CLIENTS} 
        component={ClientListScreen}
        options={{ title: 'לקוחות' }}
      />
      <Tab.Screen 
        name={ROUTES.ORDERS} 
        component={OrderListScreen}
        options={{ title: 'הזמנות' }}
      />
      <Tab.Screen 
        name={ROUTES.PROFILE} 
        component={ProfileScreen}
        options={{ title: 'פרופיל' }}
      />
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('🚀 [APP] App component mounted, starting auth check...');
    
    // Set a timeout to prevent infinite splash screen - MOVED FIRST!
    const splashTimeout = setTimeout(() => {
      console.warn('⏰ [SPLASH] Splash screen timeout reached (10s), forcing hide');
      setIsLoading(false);
      SplashScreen.hide();
    }, 10000); // 10 second timeout
    
    // Initialize app without external dependencies
    
    checkAuthStatus().finally(() => {
      clearTimeout(splashTimeout);
    });
    
    return () => {
      clearTimeout(splashTimeout);
    };
  }, []);

  const checkAuthStatus = async () => {
    console.log('🔍 [AUTH] Starting authentication check...');
    const startTime = Date.now();
    
    try {
      console.log('🔍 [AUTH] Getting stored token...');
      const token = await getAuthToken();
      
      if (token) {
        console.log('✅ [AUTH] Token found, verifying with server...');
        console.log('🔍 [AUTH] Token preview:', token ? token.substring(0, 20) + '...' : 'null');
        
        // Verify token with server - with timeout protection
        try {
          console.log('🌐 [AUTH] Sending verification request...');
          
          // Add timeout protection for auth verification
          const response = await Promise.race([
            authAPI.verify(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Auth verification timeout')), 8000)
            )
          ]);
          
          console.log('🌐 [AUTH] Server response received:', JSON.stringify(response?.data, null, 2));
          
          // Safe access with fallback
          if (response && response.data && response.data.user) {
            console.log('✅ [AUTH] User authenticated successfully:', response.data.user.email);
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            console.warn('❌ [AUTH] Invalid response structure from auth verification');
            console.warn('📄 [AUTH] Full response:', JSON.stringify(response, null, 2));
            // Clear invalid token
            await removeAuthToken();
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (verifyError) {
          console.error('❌ [AUTH] Token verification failed:', verifyError);
          console.error('📋 [AUTH] Error details:', {
            message: verifyError.message,
            status: verifyError.response?.status,
            statusText: verifyError.response?.statusText,
            data: verifyError.response?.data
          });
          
          // Continue without external logging
                statusText: verifyError.response?.statusText,
                data: verifyError.response?.data
              }
            });
          } catch (logError) {
            console.warn('❌ [LOGROCKET] Failed to capture exception:', logError);
          }
          
          // Clear invalid token and continue to login
          await removeAuthToken();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log('ℹ️ [AUTH] No token found, staying unauthenticated');
        // No token, stay unauthenticated
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('💥 [AUTH] Auth check failed:', error);
      console.error('📋 [AUTH] Error stack:', error.stack);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      const duration = Date.now() - startTime;
      console.log(`⏱️ [AUTH] Auth check completed in ${duration}ms`);
      console.log('🎬 [SPLASH] Setting loading to false and hiding splash screen...');
      
      setIsLoading(false);
      try {
        SplashScreen.hide();
        console.log('✅ [SPLASH] Splash screen hidden successfully');
      } catch (splashError) {
        console.warn('❌ [SPLASH] Splash screen hide failed:', splashError);
      }
    }
  };

  const handleLogin = (userData, token) => {
    console.log('✅ [LOGIN] User logged in successfully');
    
    // User logged in successfully
    
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    console.log('🎬 [SPLASH] Rendering splash screen...');
    
    return (
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: COLORS.primary
          }}>
            <ActivityIndicator size="large" color={COLORS.surface} />
            <Text style={{
              color: COLORS.surface,
              marginTop: 16,
              fontSize: 18,
              fontWeight: 'bold'
            }}>
              {APP_NAME}
            </Text>
            <Text style={{
              color: COLORS.surface,
              marginTop: 8,
              fontSize: 14,
              opacity: 0.8
            }}>
              טוען...
            </Text>
            <Text style={{
              color: COLORS.surface,
              marginTop: 16,
              fontSize: 10,
              opacity: 0.6,
              textAlign: 'center'
            }}>
              בדיקת הרשאות...{'\n'}
              אם הטעינה נמשכת, בדקו את החיבור לאינטרנט
            </Text>
          </View>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
          
          {isAuthenticated ? (
            <MainNavigator />
          ) : (
            <AuthNavigator onLogin={handleLogin} />
          )}
          
          <FlashMessage 
            position="top" 
            floating={true}
            style={{
              marginTop: Platform.OS === 'ios' ? 50 : 25,
              marginHorizontal: 15,
              borderRadius: 8,
            }}
            titleStyle={{
              textAlign: 'right',
              fontSize: 16,
              fontWeight: 'bold',
            }}
            textStyle={{
              textAlign: 'right',
              fontSize: 14,
            }}
          />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}