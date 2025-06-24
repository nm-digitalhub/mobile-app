import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Text,
  Avatar,
  List,
  Switch,
  Button,
  TextInput,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showMessage } from 'react-native-flash-message';
import { Ionicons } from '@expo/vector-icons';

import { authAPI, removeAuthToken } from '../../config/api';
import { COLORS, SPACING, FONTS } from '../../config/constants';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoRefresh: true,
  });

  useEffect(() => {
    loadUserProfile();
    loadUserSessions();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.profile();
      
      // Safe access with fallback
      if (response && response.data && response.data.user) {
        const userData = response.data.user;
        setUser(userData);
        setProfileData({
          name: userData.name || '',
          phone: userData.phone || '',
        });
      } else {
        console.warn('Invalid profile response structure');
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showMessage({
        message: 'שגיאה בטעינת פרטי הפרופיל',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserSessions = async () => {
    try {
      const response = await authAPI.sessions();
      
      // Safe access with fallback
      if (response && response.data && response.data.sessions) {
        setSessions(response.data.sessions);
      } else {
        console.warn('Invalid sessions response structure');
        setSessions([]);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUserProfile(), loadUserSessions()]);
    setRefreshing(false);
  };

  const updateProfile = async () => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      // Safe access with fallback
      if (response && response.data && response.data.user) {
        setUser(prev => ({ ...prev, ...response.data.user }));
        setEditingProfile(false);
        
        showMessage({
          message: 'הפרופיל עודכן בהצלחה',
          type: 'success',
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage({
        message: error.response?.data?.error || 'שגיאה בעדכון הפרופיל',
        type: 'danger',
      });
    }
  };

  const changePassword = async () => {
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      showMessage({
        message: 'הסיסמאות החדשות אינן תואמות',
        type: 'warning',
      });
      return;
    }

    try {
      await authAPI.updateProfile({
        ...passwordData,
        new_password_confirmation: passwordData.new_password_confirmation,
      });
      
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      
      showMessage({
        message: 'הסיסמה שונתה בהצלחה',
        type: 'success',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      showMessage({
        message: error.response?.data?.error || 'שגיאה בשינוי הסיסמה',
        type: 'danger',
      });
    }
  };

  const revokeSession = async (sessionId) => {
    try {
      await authAPI.revokeSession(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      showMessage({
        message: 'ההתחברות בוטלה בהצלחה',
        type: 'success',
      });
    } catch (error) {
      console.error('Error revoking session:', error);
      showMessage({
        message: 'שגיאה בביטול ההתחברות',
        type: 'danger',
      });
    }
  };

  const logoutAllDevices = async () => {
    Alert.alert(
      'התנתק מכל המכשירים',
      'האם אתה בטוח שברצונך להתנתק מכל המכשירים? יהיה עליך להתחבר מחדש.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'התנתק',
          style: 'destructive',
          onPress: async () => {
            try {
              await authAPI.logoutAll();
              await removeAuthToken();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error logging out all devices:', error);
              showMessage({
                message: 'שגיאה בהתנתקות',
                type: 'danger',
              });
            }
          },
        },
      ]
    );
  };

  const logout = async () => {
    Alert.alert(
      'התנתקות',
      'האם אתה בטוח שברצונך להתנתק?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'התנתק',
          style: 'destructive',
          onPress: async () => {
            try {
              await authAPI.logout();
              await removeAuthToken();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error logging out:', error);
              showMessage({
                message: 'שגיאה בהתנתקות',
                type: 'danger',
              });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>טוען פרטי פרופיל...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text 
              size={80} 
              label={user?.name?.substring(0, 2).toUpperCase() || 'U'}
              style={styles.avatar}
            />
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.userRole}>{user?.role_label}</Text>
            {user?.last_login && (
              <Text style={styles.lastLogin}>
                כניסה אחרונה: {new Date(user.last_login).toLocaleString('he-IL')}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Profile Edit */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>פרטים אישיים</Text>
            
            {editingProfile ? (
              <View>
                <TextInput
                  mode="outlined"
                  label="שם מלא"
                  value={profileData.name}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
                  style={styles.input}
                  textAlign="right"
                />
                <TextInput
                  mode="outlined"
                  label="טלפון"
                  value={profileData.phone}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
                  style={styles.input}
                  textAlign="right"
                />
                <View style={styles.editActions}>
                  <Button mode="outlined" onPress={() => setEditingProfile(false)}>
                    ביטול
                  </Button>
                  <Button mode="contained" onPress={updateProfile}>
                    שמור
                  </Button>
                </View>
              </View>
            ) : (
              <View>
                <List.Item
                  title="שם מלא"
                  description={user?.name}
                  left={props => <List.Icon {...props} icon="account" />}
                />
                <List.Item
                  title="טלפון"
                  description={user?.phone || 'לא הוגדר'}
                  left={props => <List.Icon {...props} icon="phone" />}
                />
                <Button mode="outlined" onPress={() => setEditingProfile(true)}>
                  ערוך פרטים
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Change Password */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>שינוי סיסמה</Text>
            <TextInput
              mode="outlined"
              label="סיסמה נוכחית"
              value={passwordData.current_password}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, current_password: text }))}
              secureTextEntry
              style={styles.input}
              textAlign="right"
            />
            <TextInput
              mode="outlined"
              label="סיסמה חדשה"
              value={passwordData.new_password}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, new_password: text }))}
              secureTextEntry
              style={styles.input}
              textAlign="right"
            />
            <TextInput
              mode="outlined"
              label="אישור סיסמה חדשה"
              value={passwordData.new_password_confirmation}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, new_password_confirmation: text }))}
              secureTextEntry
              style={styles.input}
              textAlign="right"
            />
            <Button 
              mode="contained" 
              onPress={changePassword}
              disabled={!passwordData.current_password || !passwordData.new_password}
            >
              שנה סיסמה
            </Button>
          </Card.Content>
        </Card>

        {/* Settings */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>הגדרות</Text>
            <List.Item
              title="התראות"
              description="קבל התראות על פעילות חדשה"
              left={props => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={settings.notifications}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, notifications: value }))}
                />
              )}
            />
            <List.Item
              title="מצב כהה"
              description="שימוש בערכת צבעים כהה"
              left={props => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={settings.darkMode}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, darkMode: value }))}
                />
              )}
            />
            <List.Item
              title="רענון אוטומטי"
              description="רענן נתונים אוטומטית"
              left={props => <List.Icon {...props} icon="refresh" />}
              right={() => (
                <Switch
                  value={settings.autoRefresh}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, autoRefresh: value }))}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Active Sessions */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>התחברויות פעילות</Text>
            {sessions.map((session) => (
              <List.Item
                key={session.id}
                title={session.name}
                description={`כניסה אחרונה: ${session.last_used_at ? new Date(session.last_used_at).toLocaleString('he-IL') : 'לא ידוע'}`}
                left={props => (
                  <List.Icon 
                    {...props} 
                    icon={session.is_current ? "cellphone" : "laptop"} 
                    color={session.is_current ? COLORS.primary : COLORS.textSecondary}
                  />
                )}
                right={() => !session.is_current && (
                  <Button 
                    mode="outlined" 
                    compact
                    onPress={() => revokeSession(session.id)}
                  >
                    בטל
                  </Button>
                )}
              />
            ))}
          </Card.Content>
        </Card>

        {/* Actions */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>פעולות</Text>
            <Button 
              mode="outlined" 
              onPress={logoutAllDevices}
              style={styles.actionButton}
              textColor={COLORS.warning}
            >
              התנתק מכל המכשירים
            </Button>
            <Button 
              mode="contained" 
              onPress={logout}
              style={styles.actionButton}
              buttonColor={COLORS.error}
            >
              התנתק
            </Button>
          </Card.Content>
        </Card>

        {/* App Info */}
        <Card style={[styles.sectionCard, styles.lastCard]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>על האפליקציה</Text>
            <List.Item
              title="גרסה"
              description="1.0.0"
              left={props => <List.Icon {...props} icon="information" />}
            />
            <List.Item
              title="בניה"
              description="2024.06.23"
              left={props => <List.Icon {...props} icon="hammer" />}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.body,
    color: COLORS.textSecondary,
  },
  profileCard: {
    marginBottom: SPACING.md,
  },
  profileContent: {
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.md,
  },
  userName: {
    fontSize: FONTS.sizes.title,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: FONTS.sizes.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  userRole: {
    fontSize: FONTS.sizes.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  lastLogin: {
    fontSize: FONTS.sizes.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: SPACING.md,
  },
  lastCard: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.subtitle,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'right',
  },
  input: {
    marginBottom: SPACING.md,
    textAlign: 'right',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
});

export default ProfileScreen;